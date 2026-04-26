import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";

import { createConnection } from "@/lib/db";
import {
  notifyClearancePeriodLive,
  syncEndedClearancePeriodNotifications,
  syncLiveClearancePeriodNotifications,
} from "@/lib/liveClearanceNotify";

type PeriodStatus = "live" | "scheduled" | "ended";
type DbConnection = Awaited<ReturnType<typeof createConnection>>;
type TokenPayload = {
  role?: string;
  user_id: number | string;
} | null;

type AdminContext =
  | {
      db: DbConnection;
      adminId: number;
    }
  | {
      response: NextResponse;
    };

type DateValidationRow = {
  start_in_past: number | boolean;
  end_in_past: number | boolean;
};

type ActivePeriodRow = {
  period_id: number;
  active_end_date: string;
};

function normalizeScheduleDate(value: string, isEnd = false) {
  if (!value) return null;

  const hasTime = value.includes("T");
  const normalized = hasTime
    ? value
    : `${value}T${isEnd ? "23:59:59" : "00:00:00"}`;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function getAdminContext(request: NextRequest): Promise<AdminContext> {
  const payload = (await verifySessionFromCookies(request)) as TokenPayload;

  if (!payload) {
    return {
      response: NextResponse.json({ error: "Not logged in" }, { status: 401 }),
    };
  }

  if (String(payload.role).toLowerCase() !== "admin") {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const db = await createConnection();

  try {
    const [adminRows] = (await db.query(
      `SELECT a.admin_id
       FROM administrators a
       JOIN users u ON a.user_id = u.user_id
       WHERE u.user_id = ?
       LIMIT 1`,
      [payload.user_id],
    )) as [Array<{ admin_id: number }>, unknown];

    if (adminRows.length === 0) {
      await db.end();

      return {
        response: NextResponse.json({ error: "Admin not found" }, { status: 403 }),
      };
    }

    return {
      db,
      adminId: adminRows[0].admin_id,
    };
  } catch (error) {
    await db.end();
    throw error;
  }
}

async function normalizePeriodStatuses(db: DbConnection) {
  await db.query(`
    UPDATE clearance_periods
    SET period_status = 'ended'
    WHERE end_date < CURDATE() AND period_status != 'ended'
  `);

  await db.query(`
    UPDATE clearance_periods
    SET period_status = 'scheduled'
    WHERE period_status = 'live'
      AND NOT (start_date <= CURDATE() AND end_date >= CURDATE())
  `);

  const [activeRows] = (await db.query(`
    SELECT period_id
    FROM clearance_periods
    WHERE start_date <= CURDATE()
      AND end_date >= CURDATE()
      AND period_status != 'ended'
    ORDER BY created_at DESC, period_id DESC
    LIMIT 1
  `)) as [Array<{ period_id: number }>, unknown];

  await db.query(`
    UPDATE clearance_periods
    SET period_status = 'scheduled'
    WHERE start_date <= CURDATE()
      AND end_date >= CURDATE()
      AND period_status != 'ended'
  `);

  if (activeRows.length > 0) {
    await db.query(
      `UPDATE clearance_periods SET period_status = 'live' WHERE period_id = ?`,
      [activeRows[0].period_id],
    );
  }
}

async function findLivePeriodConflict(
  db: DbConnection,
  startDate: string,
  endDate: string,
) {
  const [rows] = (await db.query(
    `SELECT
       period_id,
       DATE_FORMAT(end_date, '%Y-%m-%d') AS active_end_date
     FROM clearance_periods
     WHERE period_status = 'live'
       AND DATE(?) <= DATE(end_date)
       AND DATE(?) >= DATE(start_date)
     ORDER BY created_at DESC, period_id DESC
     LIMIT 1`,
    [startDate, endDate],
  )) as [ActivePeriodRow[], unknown];

  return rows;
}

export async function GET(request: NextRequest) {
  let db: DbConnection | null = null;

  try {
    const context = await getAdminContext(request);

    if ("response" in context) {
      return context.response;
    }

    db = context.db;

    await normalizePeriodStatuses(db);
    await syncLiveClearancePeriodNotifications(db);
    await syncEndedClearancePeriodNotifications(db);

    const [rows] = (await db.query(`
      SELECT cp.*, CONCAT(u.first_name, ' ', u.last_name) AS set_by
      FROM clearance_periods cp
      LEFT JOIN administrators a ON cp.admin_id = a.admin_id
      LEFT JOIN users u ON a.user_id = u.user_id
      ORDER BY cp.created_at DESC
    `)) as [Array<Record<string, unknown>>, unknown];

    return NextResponse.json({ success: true, periods: rows });
  } catch (error) {
    console.error("Failed to fetch clearance periods:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch clearance periods." },
      { status: 500 },
    );
  } finally {
    if (db) {
      await db.end();
    }
  }
}

export async function POST(request: NextRequest) {
  let db: DbConnection | null = null;

  try {
    const context = await getAdminContext(request);

    if ("response" in context) {
      return context.response;
    }

    db = context.db;

    const { academic_year, semester, start_date, end_date } = await request.json();

    if (!academic_year || !start_date || !end_date) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const startAt = normalizeScheduleDate(start_date);
    const endAt = normalizeScheduleDate(end_date, true);

    if (!startAt || !endAt) {
      return NextResponse.json({ error: "Invalid schedule dates" }, { status: 400 });
    }

    if (endAt.getTime() <= startAt.getTime()) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    const [dateValidation] = (await db.query(
      `SELECT
         DATE(?) < CURDATE() AS start_in_past,
         DATE(?) < CURDATE() AS end_in_past
       FROM DUAL`,
      [start_date, end_date],
    )) as [DateValidationRow[], unknown];

    if (dateValidation[0].start_in_past) {
      return NextResponse.json(
        { error: "Start date cannot be in the past." },
        { status: 400 },
      );
    }

    if (dateValidation[0].end_in_past) {
      return NextResponse.json(
        { error: "End date cannot be in the past." },
        { status: 400 },
      );
    }

    await normalizePeriodStatuses(db);
    await db.beginTransaction();

    const liveConflict = await findLivePeriodConflict(db, start_date, end_date);

    if (liveConflict.length > 0) {
      await db.rollback();

      return NextResponse.json(
        {
          error: `Schedule Conflict: The selected dates overlap with a live period. Please choose a date after ${liveConflict[0].active_end_date}.`,
        },
        { status: 409 },
      );
    }

    const [statusResult] = (await db.query(
      `SELECT 
         CASE
           WHEN DATE(?) < CURDATE() THEN 'ended'
           WHEN DATE(?) <= CURDATE() AND DATE(?) >= CURDATE() THEN 'live'
           ELSE 'scheduled'
         END AS period_status
       FROM DUAL`,
      [end_date, start_date, end_date],
    )) as [Array<{ period_status: PeriodStatus }>, unknown];

    const period_status = statusResult[0].period_status;

    const [insertHeader] = await db.query<ResultSetHeader>(
      `INSERT INTO clearance_periods (
        academic_year,
        semester,
        start_date,
        end_date,
        period_status,
        admin_id
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [academic_year, semester || null, start_date, end_date, period_status, context.adminId],
    );

    await db.commit();

    if (period_status === "live") {
      try {
        const periodId = insertHeader.insertId;
        const startDay = String(start_date).split("T")[0];
        const endDay = String(end_date).split("T")[0];
        await notifyClearancePeriodLive(db, {
          periodId,
          academicYear: academic_year,
          semester: semester || null,
          startDate: startDay,
          endDate: endDay,
        });
      } catch {
        // Non-critical notification failure
      }
    }

    return NextResponse.json({ success: true, message: "Period created!" });
  } catch (error) {
    if (db) {
      try {
        await db.rollback();
      } catch {}
    }

    console.error("Failed to create clearance period:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create clearance period." },
      { status: 500 },
    );
  } finally {
    if (db) {
      await db.end();
    }
  }
}
