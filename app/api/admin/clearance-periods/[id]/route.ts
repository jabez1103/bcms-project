import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

type DbConnection = Awaited<ReturnType<typeof createConnection>>;
type TokenPayload = {
  role?: string;
  user_id: number | string;
} | null;

type AdminContext =
  | {
      db: DbConnection;
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

type StatusRow = {
  period_status: "live" | "scheduled" | "ended";
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

async function findLivePeriodConflict(
  db: DbConnection,
  startDate: string,
  endDate: string,
  excludePeriodId?: string,
) {
  const query = `SELECT
       period_id,
       DATE_FORMAT(end_date, '%Y-%m-%d') AS active_end_date
     FROM clearance_periods
     WHERE period_status = 'live'
       AND DATE(?) <= DATE(end_date)
       AND DATE(?) >= DATE(start_date)
       ${excludePeriodId ? "AND period_id <> ?" : ""}
     ORDER BY created_at DESC, period_id DESC
     LIMIT 1`;

  const params = excludePeriodId
    ? [startDate, endDate, excludePeriodId]
    : [startDate, endDate];

  const [rows] = (await db.query(query, params)) as [ActivePeriodRow[], unknown];

  return rows;
}

async function requireAdmin(request: NextRequest): Promise<AdminContext> {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return { response: NextResponse.json({ error: "Not logged in" }, { status: 401 }) };
  }

  const payload = (await verifyToken(token)) as TokenPayload;

  if (!payload || String(payload.role).toLowerCase() !== "admin") {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
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
      return { response: NextResponse.json({ error: "Admin not found" }, { status: 403 }) };
    }

    return { db };
  } catch (error) {
    await db.end();
    throw error;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
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
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  const db = auth.db;

  try {
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

    await db.beginTransaction();

    const liveConflict = await findLivePeriodConflict(db, start_date, end_date, id);

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
    )) as [StatusRow[], unknown];

    const period_status = statusResult[0].period_status;

    await db.query(
      `UPDATE clearance_periods
       SET academic_year=?, semester=?, start_date=?, end_date=?, period_status=?
       WHERE period_id=?`,
      [academic_year, semester || null, start_date, end_date, period_status, id],
    );

    await db.commit();
    return NextResponse.json({ success: true, message: "Period updated!" });
  } catch (error) {
    try {
      await db.rollback();
    } catch {}

    console.error("Failed to update clearance period:", error);
    return NextResponse.json({ error: "Failed to update period." }, { status: 500 });
  } finally {
    await db.end();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  const db = auth.db;

  try {
    await db.query(`DELETE FROM clearance_periods WHERE period_id = ?`, [id]);
    return NextResponse.json({ success: true, message: "Period deleted!" });
  } catch (error) {
    console.error("Failed to delete clearance period:", error);
    return NextResponse.json({ error: "Failed to delete period." }, { status: 500 });
  } finally {
    await db.end();
  }
}
