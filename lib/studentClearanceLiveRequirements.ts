import type { Connection, RowDataPacket } from "mysql2/promise";

/** Canonical row shape for student clearance against the live period (admin + signatory + exports). */
export type LiveRequirementRow = {
  requirementId: number;
  requirementName: string;
  requirementType: string | null;
  description: string | null;
  targetYear: string | null;
  signatoryId: number;
  department: string;
  signatoryName: string;
  submissionId: number | null;
  filePath: string | null;
  studentComment: string | null;
  submittedAt: string | null;
  status: string;
  rejectionComment: string | null;
};

export function yearLabelFromLevel(yearLevel: number | null | undefined): string {
  const map: Record<number, string> = {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year",
  };
  if (yearLevel == null) return "All Years";
  return map[yearLevel] ?? "All Years";
}

/**
 * All active live-period requirements applicable to the student (year rules),
 * optionally restricted to one signatory office.
 */
export async function fetchStudentLiveRequirements(
  db: Connection,
  studentId: number,
  filters?: { signatoryId?: number }
): Promise<LiveRequirementRow[]> {
  const sigClause = filters?.signatoryId != null ? " AND sg.signatory_id = ? " : "";
  const params: (number | string)[] = [studentId];
  if (filters?.signatoryId != null) params.push(filters.signatoryId);

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
        r.requirement_id AS requirementId,
        r.requirement_name AS requirementName,
        r.requirement_type AS requirementType,
        r.description,
        r.target_year AS targetYear,
        sg.signatory_id AS signatoryId,
        sg.department AS department,
        CONCAT(u.first_name, ' ', u.last_name,
          IF(sg.academic_credentials IS NOT NULL AND sg.academic_credentials != '',
            CONCAT(', ', sg.academic_credentials), '')) AS signatoryName,
        s.submission_id AS submissionId,
        s.file_path AS filePath,
        s.comment AS studentComment,
        DATE_FORMAT(s.submission_date, '%M %d, %Y') AS submittedAt,
        COALESCE(a.decision_status,
          CASE WHEN s.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
        ) AS status,
        a.remarks AS rejectionComment
     FROM students st
     INNER JOIN clearance_periods cp ON cp.period_status = 'live'
     INNER JOIN requirements r
       ON r.period_id = cp.period_id
       AND COALESCE(r.req_status, 'active') = 'active'
       AND (
         r.target_year = 'All Years'
         OR r.target_year = CASE st.year_level
           WHEN 1 THEN '1st Year'
           WHEN 2 THEN '2nd Year'
           WHEN 3 THEN '3rd Year'
           WHEN 4 THEN '4th Year'
           ELSE 'All Years'
         END
       )
     INNER JOIN signatories sg ON r.signatory_id = sg.signatory_id
     INNER JOIN users u ON sg.user_id = u.user_id
     LEFT JOIN submissions s
       ON s.requirement_id = r.requirement_id AND s.student_id = st.student_id
     LEFT JOIN approvals a ON a.submission_id = s.submission_id
     WHERE st.student_id = ?
       AND (
         LOWER(sg.department) NOT LIKE '%dean%'
         OR sg.assigned_program IS NULL
         OR sg.assigned_program = st.program
       )
       ${sigClause}
     ORDER BY sg.department ASC, r.requirement_id ASC`,
    params
  );

  return rows.map((row) => {
    let rawStatus = String(row.status ?? "not_submitted").toLowerCase();
    
    // Global Rule: Conditional requirements default to 'pending' unless explicitly approved/rejected
    const type = String(row.requirementType ?? "").toLowerCase();
    if (type === "conditional" && rawStatus !== "approved" && rawStatus !== "rejected") {
      rawStatus = "pending";
    }

    return {
      requirementId: Number(row.requirementId),
      requirementName: String(row.requirementName ?? ""),
      requirementType: row.requirementType != null ? String(row.requirementType) : null,
      description: row.description != null ? String(row.description) : null,
      targetYear: row.targetYear != null ? String(row.targetYear) : null,
      signatoryId: Number(row.signatoryId),
      department: String(row.department ?? ""),
      signatoryName: String(row.signatoryName ?? ""),
      submissionId: row.submissionId != null ? Number(row.submissionId) : null,
      filePath: row.filePath != null ? String(row.filePath) : null,
      studentComment: row.studentComment != null ? String(row.studentComment) : null,
      submittedAt: row.submittedAt != null ? String(row.submittedAt) : null,
      status: rawStatus,
      rejectionComment: row.rejectionComment != null ? String(row.rejectionComment) : null,
    };
  });
}

/** Roll up per-requirement rows into office-level rows for legacy DOCX export. */
export function rollupRequirementsForExport(
  requirements: LiveRequirementRow[]
): { name: string; role: string; status: string }[] {
  const bySig = new Map<number, LiveRequirementRow[]>();
  for (const r of requirements) {
    const list = bySig.get(r.signatoryId) ?? [];
    list.push(r);
    bySig.set(r.signatoryId, list);
  }

  const out: { name: string; role: string; status: string }[] = [];
  for (const [, list] of bySig) {
    const first = list[0];
    const statuses = list.map((x) => x.status);
    let status = "Pending";
    if (statuses.every((s) => s === "approved")) status = "Approved";
    else if (statuses.some((s) => s === "rejected")) status = "Rejected";
    else if (statuses.every((s) => s === "not_submitted")) status = "Not Submitted";
    else status = "Pending";

    out.push({
      role: first.department,
      name: first.signatoryName,
      status,
    });
  }
  return out.sort((a, b) => a.role.localeCompare(b.role));
}
