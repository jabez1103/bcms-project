import type { Connection, RowDataPacket } from "mysql2/promise";
import { createNotificationBulk } from "@/lib/notifications";
import {
  buildSignatoryPeriodOpenedInApp,
  buildStudentPeriodOpenedInApp,
  type PeriodOpenedFields,
} from "@/lib/periodOpenedMessaging";

type UserIdRow = { user_id: number };

async function alreadyNotifiedRole(
  db: Connection,
  periodId: number,
  role: "student" | "signatory"
): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT 1 AS ok
     FROM notifications
     WHERE type = 'period_opened'
       AND target_id = ?
       AND role = ?
     LIMIT 1`,
    [periodId, role]
  );
  return rows.length > 0;
}

export type LivePeriodRow = PeriodOpenedFields & { periodId: number };

type PeriodRow = RowDataPacket & {
  period_id: number;
  academic_year: string;
  semester: string | null;
  start_date: string;
  end_date: string;
};

/**
 * Sends in-app + Web Push when a clearance period is live, once per role per period
 * (deduped with notifications.target_id = period_id).
 */
export async function notifyClearancePeriodLive(db: Connection, row: LivePeriodRow): Promise<void> {
  const [studentUsers] = (await db.query(
    `SELECT u.user_id FROM students st JOIN users u ON st.user_id = u.user_id`,
  )) as [UserIdRow[], unknown];

  const [signatoryUsers] = (await db.query(
    `SELECT u.user_id FROM signatories sg JOIN users u ON sg.user_id = u.user_id`,
  )) as [UserIdRow[], unknown];

  const fields: PeriodOpenedFields = {
    academicYear: row.academicYear,
    semester: row.semester,
    startDate: row.startDate,
    endDate: row.endDate,
  };

  if (studentUsers.length > 0 && !(await alreadyNotifiedRole(db, row.periodId, "student"))) {
    const s = buildStudentPeriodOpenedInApp(fields, row.periodId);
    await createNotificationBulk(
      db,
      studentUsers.map((u) => ({ userId: u.user_id, role: "student" as const })),
      "period_opened",
      s.title,
      s.message,
      {
        targetId: row.periodId,
        pushTitle: s.pushTitle,
        pushBody: s.pushBody,
        pushTag: s.pushTag,
      }
    );
  }

  if (signatoryUsers.length > 0 && !(await alreadyNotifiedRole(db, row.periodId, "signatory"))) {
    const g = buildSignatoryPeriodOpenedInApp(fields, row.periodId);
    await createNotificationBulk(
      db,
      signatoryUsers.map((u) => ({ userId: u.user_id, role: "signatory" as const })),
      "period_opened",
      g.title,
      g.message,
      {
        targetId: row.periodId,
        pushTitle: g.pushTitle,
        pushBody: g.pushBody,
        pushTag: g.pushTag,
      }
    );
  }
}

/**
 * After schedule normalization, notify any live period that has not yet triggered student push.
 */
export async function syncLiveClearancePeriodNotifications(db: Connection): Promise<void> {
  const [periods] = (await db.query<PeriodRow[]>(
    `SELECT
       cp.period_id,
       cp.academic_year,
       cp.semester,
       DATE_FORMAT(cp.start_date, '%Y-%m-%d') AS start_date,
       DATE_FORMAT(cp.end_date, '%Y-%m-%d') AS end_date
     FROM clearance_periods cp
     WHERE cp.period_status = 'live'
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.type = 'period_opened'
           AND n.target_id = cp.period_id
           AND n.role = 'student'
         LIMIT 1
       )`
  )) as [PeriodRow[], unknown];

  for (const raw of periods) {
    const p: LivePeriodRow = {
      periodId: raw.period_id,
      academicYear: raw.academic_year,
      semester: raw.semester,
      startDate: raw.start_date,
      endDate: raw.end_date,
    };
    try {
      await notifyClearancePeriodLive(db, p);
    } catch (e) {
      console.error("[liveClearanceNotify] sync failed for period", p.periodId, e);
    }
  }
}
