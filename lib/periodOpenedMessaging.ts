export type PeriodOpenedFields = {
  academicYear: string;
  semester: string | null | undefined;
  startDate: string;
  endDate: string;
};

function periodLabel(p: PeriodOpenedFields): string {
  const sem = p.semester?.trim();
  return sem ? `${p.academicYear} — ${sem}` : p.academicYear;
}

function formatDay(isoDate: string): string {
  const normalized = isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Full copy for the in-app notification center (students). */
export function buildStudentPeriodOpenedInApp(
  p: PeriodOpenedFields,
  periodId: number
): {
  title: string;
  message: string;
  pushTitle: string;
  pushBody: string;
  pushTag: string;
} {
  const label = periodLabel(p);
  const start = formatDay(p.startDate);
  const end = formatDay(p.endDate);
  const title = "Clearance is now open";
  const message = [
    `The clearance period "${label}" is officially live.`,
    "",
    `Open period: ${start} → ${end}`,
    `Important: complete all requirements on or before ${end} (end of the clearance window).`,
    "",
    "Start your clearance now — open Signatories to view each requirement and submit your documents.",
  ].join("\n");

  const pushTitle = "Clearance is live";
  const pushBody = `${label}: ${start}–${end}. Deadline ${end}. Tap to start clearance.`;
  const pushTag = `clearance-live-${periodId}-student`;

  return { title, message, pushTitle, pushBody, pushTag };
}

/** In-app + push lines for signatories when a period goes live. */
export function buildSignatoryPeriodOpenedInApp(
  p: PeriodOpenedFields,
  periodId: number
): {
  title: string;
  message: string;
  pushTitle: string;
  pushBody: string;
  pushTag: string;
} {
  const label = periodLabel(p);
  const start = formatDay(p.startDate);
  const end = formatDay(p.endDate);
  const title = "Clearance period is active";
  const message = [
    `Clearance "${label}" is now active for students.`,
    "",
    `Window: ${start} → ${end}`,
    `Students may submit until ${end}.`,
    "",
    "Review pending work under Review Submissions.",
  ].join("\n");

  const pushTitle = "Clearance period active";
  const pushBody = `${label} (${start}–${end}). Students can submit until ${end}. Tap to review.`;
  const pushTag = `clearance-live-${periodId}-signatory`;

  return { title, message, pushTitle, pushBody, pushTag };
}
