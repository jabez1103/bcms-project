import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import type { AuthTokenPayload } from "@/lib/auth";
import { verifySessionFromCookies } from "@/lib/requestSession";
import type { RowDataPacket } from "mysql2/promise";

type SearchHit = {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  href: string;
  score: number;
};

/** Safe fragment for LIKE: strips wildcards so user input cannot broaden the match. */
function likeFragment(q: string): string {
  return q.replace(/\\/g, "").replace(/%/g, "").replace(/_/g, "");
}

function navItemsForRole(role: string): Omit<SearchHit, "score">[] {
  const help = {
    id: "nav-help",
    category: "Help",
    title: "Help & Support",
    subtitle: "Policies, contact, and FAQs",
    href: "/helpandsupport",
  };
  if (role === "student") {
    return [
      {
        id: "nav-student-home",
        category: "Pages",
        title: "Home",
        subtitle: "Dashboard and clearance overview",
        href: "/student/home",
      },
      {
        id: "nav-student-profile",
        category: "Pages",
        title: "Profile",
        subtitle: "Account and student profile",
        href: "/student/profile",
      },
      {
        id: "nav-student-signatories",
        category: "Pages",
        title: "Signatories",
        subtitle: "Requirements and submissions",
        href: "/student/signatories",
      },
      {
        id: "nav-student-recent",
        category: "Pages",
        title: "Recent activity logs",
        subtitle: "Your latest actions",
        href: "/student/activity-logs/recent-logs",
      },
      {
        id: "nav-student-system",
        category: "Pages",
        title: "System history",
        subtitle: "Broader activity timeline",
        href: "/student/activity-logs/system-history",
      },
      help,
    ];
  }
  if (role === "admin") {
    return [
      {
        id: "nav-admin-home",
        category: "Pages",
        title: "Admin home",
        subtitle: "Overview",
        href: "/admin/home",
      },
      {
        id: "nav-admin-users",
        category: "Pages",
        title: "User accounts",
        subtitle: "Manage students, signatories, and admins",
        href: "/admin/user-accounts",
      },
      {
        id: "nav-admin-periods",
        category: "Pages",
        title: "Clearance periods",
        subtitle: "Schedule and publish clearance windows",
        href: "/admin/clearance-periods",
      },
      {
        id: "nav-admin-progress",
        category: "Pages",
        title: "Clearance progress",
        subtitle: "Track completion across programs",
        href: "/admin/clearance-progress",
      },
      help,
    ];
  }
  if (role === "signatory") {
    return [
      {
        id: "nav-sig-home",
        category: "Pages",
        title: "Signatory home",
        subtitle: "Overview",
        href: "/signatory/home",
      },
      {
        id: "nav-sig-req",
        category: "Pages",
        title: "Manage requirements",
        subtitle: "Define and edit clearance requirements",
        href: "/signatory/manage-requirements",
      },
      {
        id: "nav-sig-status",
        category: "Pages",
        title: "Student clearance status",
        subtitle: "Browse student progress",
        href: "/signatory/student-clearance-status",
      },
      {
        id: "nav-sig-review",
        category: "Pages",
        title: "Review submissions",
        subtitle: "Approve or reject student files",
        href: "/signatory/review-submissions",
      },
      help,
    ];
  }
  return [help];
}

function scoreNav(q: string, item: Omit<SearchHit, "score">): SearchHit | null {
  const needle = q.toLowerCase();
  const hay = `${item.title} ${item.subtitle ?? ""} ${item.category}`.toLowerCase();
  if (!hay.includes(needle)) return null;
  let score = 40;
  if (item.title.toLowerCase().includes(needle)) score += 30;
  if (item.subtitle?.toLowerCase().includes(needle)) score += 10;
  return { ...item, score };
}

export async function GET(request: NextRequest) {
  const payload: AuthTokenPayload | null = await verifySessionFromCookies(request);
  if (!payload) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const qRaw = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (qRaw.length < 2) {
    return NextResponse.json({ success: true, results: [] as SearchHit[] });
  }

  const role = String(payload.role);
  const db = await createConnection();
  const fragment = likeFragment(qRaw);
  const pattern = `%${fragment}%`;
  const hits: SearchHit[] = [];

  try {
    for (const item of navItemsForRole(role)) {
      const scored = scoreNav(qRaw, item);
      if (scored) hits.push(scored);
    }

    if (fragment.length === 0) {
      hits.sort((a, b) => b.score - a.score);
      return NextResponse.json({ success: true, results: hits.slice(0, 25) });
    }

    if (role === "admin") {
      type UserRow = RowDataPacket & {
        user_id: number;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
      };
      const [userRows] = await db.query<UserRow[]>(
        `SELECT user_id, first_name, last_name, email, role
         FROM users
         WHERE CONCAT(first_name, ' ', last_name) LIKE ?
            OR email LIKE ?
            OR CAST(user_id AS CHAR) LIKE ?
         ORDER BY first_name ASC, last_name ASC, user_id ASC
         LIMIT 15`,
        [pattern, pattern, pattern]
      );
      for (const u of userRows) {
        const name = `${u.first_name} ${u.last_name}`.trim();
        hits.push({
          id: `user-${u.user_id}`,
          category: "Users",
          title: name,
          subtitle: `${u.email} · ${u.role}`,
          href: "/admin/user-accounts",
          score: 55,
        });
      }
    }

    if (role === "student") {
      const [studentRows] = await db.query<RowDataPacket[]>(
        "SELECT student_id, year_level FROM students WHERE user_id = ?",
        [payload.user_id]
      );
      const st = studentRows[0];
      if (st) {
        const yearMap: Record<number, string> = {
          1: "1st Year",
          2: "2nd Year",
          3: "3rd Year",
          4: "4th Year",
        };
        const studentYearLabel = yearMap[Number(st.year_level)] ?? "All Years";

        type ReqRow = RowDataPacket & {
          requirement_id: number;
          requirement_name: string;
          department: string;
          signatory_name: string;
          signatory_email: string;
        };
        const [reqRows] = await db.query<ReqRow[]>(
          `SELECT
             r.requirement_id,
             r.requirement_name,
             sg.department,
             CONCAT(u.first_name, ' ', u.last_name) AS signatory_name,
             u.email AS signatory_email
           FROM requirements r
           JOIN signatories sg ON r.signatory_id = sg.signatory_id
           JOIN users u ON sg.user_id = u.user_id
           JOIN clearance_periods cp ON r.period_id = cp.period_id
           WHERE cp.period_status = 'live'
             AND COALESCE(r.req_status, 'active') = 'active'
             AND (r.target_year = 'All Years' OR r.target_year = ?)
             AND (
               r.requirement_name LIKE ?
               OR sg.department LIKE ?
               OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
               OR u.email LIKE ?
               OR CAST(r.requirement_id AS CHAR) LIKE ?
             )
           ORDER BY r.requirement_name ASC, sg.department ASC, r.requirement_id ASC
           LIMIT 20`,
          [studentYearLabel, pattern, pattern, pattern, pattern, pattern]
        );
        for (const r of reqRows) {
          hits.push({
            id: `req-${r.requirement_id}`,
            category: "Requirements",
            title: r.requirement_name,
            subtitle: `${r.department} · ${r.signatory_name} · ${r.signatory_email}`,
            href: `/student/signatories/${r.requirement_id}`,
            score: 60,
          });
        }
      }
    }

    if (role === "signatory") {
      const [sigRows] = await db.query<RowDataPacket[]>(
        "SELECT signatory_id FROM signatories WHERE user_id = ?",
        [payload.user_id]
      );
      const sigRow = sigRows[0];
      if (sigRow) {
        const signatory_id = sigRow.signatory_id;
        type SubRow = RowDataPacket & {
          submission_id: number;
          student_id: number;
          student_name: string;
          student_email: string;
          program: string;
          requirement_name: string;
          requirement_id: number;
        };
        const [subRows] = await db.query<SubRow[]>(
          `SELECT
             sub.submission_id,
             s.student_id,
             CONCAT(u.first_name, ' ', u.last_name) AS student_name,
             u.email AS student_email,
             s.program,
             req.requirement_name,
             req.requirement_id
           FROM submissions sub
           JOIN students s ON sub.student_id = s.student_id
           JOIN users u ON s.user_id = u.user_id
           JOIN requirements req ON sub.requirement_id = req.requirement_id
           WHERE req.signatory_id = ?
             AND (
               CONCAT(u.first_name, ' ', u.last_name) LIKE ?
               OR CAST(s.student_id AS CHAR) LIKE ?
               OR u.email LIKE ?
               OR req.requirement_name LIKE ?
               OR s.program LIKE ?
               OR CAST(sub.submission_id AS CHAR) LIKE ?
             )
           ORDER BY u.first_name ASC, u.last_name ASC, sub.submission_id DESC
           LIMIT 20`,
          [signatory_id, pattern, pattern, pattern, pattern, pattern, pattern]
        );
        for (const s of subRows) {
          hits.push({
            id: `sub-${s.submission_id}`,
            category: "Submissions",
            title: s.student_name,
            subtitle: `ID ${s.student_id} · ${s.student_email} · ${s.requirement_name} · ${s.program}`,
            href: `/signatory/review-submissions?requirementId=${s.requirement_id}`,
            score: 58,
          });
        }
      }
    }

    const seen = new Set<string>();
    const deduped: SearchHit[] = [];
    hits
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.title.localeCompare(b.title);
      })
      .forEach((h) => {
        if (seen.has(h.id)) return;
        seen.add(h.id);
        deduped.push(h);
      });

    return NextResponse.json({ success: true, results: deduped.slice(0, 25) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
