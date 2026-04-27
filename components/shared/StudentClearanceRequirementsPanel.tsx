"use client";

export type RequirementProgressRow = {
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

function statusLabel(raw: string): string {
  const s = raw.toLowerCase();
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  if (s === "pending") return "Pending";
  if (s === "not_submitted") return "Not Submitted";
  return raw;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const themes: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
    rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
    pending: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
    not_submitted: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
  };
  const t = themes[s] ?? themes.not_submitted;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${t}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function StudentClearanceRequirementsPanel({
  requirements,
  loading,
}: {
  requirements: RequirementProgressRow[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <div className="w-8 h-8 border-4 border-brand-200 dark:border-brand-500/30 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading requirements…</p>
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          No live clearance requirements apply to this student, or no clearance period is live.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Requirement breakdown (live period)
      </p>
      <div className="md:hidden rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {requirements.map((r) => (
          <div key={r.requirementId} className="p-3.5 bg-white dark:bg-slate-900/40 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{r.requirementName}</p>
                {r.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{r.description}</p>
                )}
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <p className="text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-600 dark:text-slate-300">Office:</span> {r.department}</p>
              <p className="text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-600 dark:text-slate-300">Year:</span> {r.targetYear ?? "—"}</p>
              <p className="col-span-2 text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-600 dark:text-slate-300">Signatory:</span> {r.signatoryName}</p>
              <p className="col-span-2 text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-600 dark:text-slate-300">Submitted:</span> {r.submittedAt ?? "—"}</p>
            </div>
            {r.rejectionComment && r.status === "rejected" && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400">Remarks: {r.rejectionComment}</p>
            )}
          </div>
        ))}
      </div>
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-sm min-w-[720px]">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Requirement</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Office</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Signatory</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Year</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {requirements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                  Table is empty.
                </td>
              </tr>
            ) : requirements.map((r) => (
              <tr key={r.requirementId} className="bg-white dark:bg-slate-900/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 align-top">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{r.requirementName}</p>
                  {r.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{r.description}</p>
                  )}
                  {r.rejectionComment && r.status === "rejected" && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Remarks: {r.rejectionComment}</p>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-300 font-medium">{r.department}</td>
                <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-400">{r.signatoryName}</td>
                <td className="px-4 py-3 align-top text-xs text-slate-500">{r.targetYear ?? "—"}</td>
                <td className="px-4 py-3 align-top">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {r.submittedAt ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
