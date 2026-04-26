"use client";

import { useState, useEffect } from "react";
import { Activity, CheckCircle2, AlertCircle, FileText, UploadCloud, Loader2, History } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

/* ── Types ───────────────────────────────────────────────── */
type LogStatus = "success" | "error" | "pending" | "neutral" | "active";

interface LogItem {
  id: number;
  action: string;
  status: LogStatus;
  time: string;
  requirementId?: number; // recent-logs only
}

/* ── Icon + colour helper ────────────────────────────────── */
function iconAndColor(status: LogStatus, tab: "recent" | "history") {
  if (status === "success")
    return { Icon: CheckCircle2, color: "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" };
  if (status === "error")
    return { Icon: AlertCircle, color: "text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10" };
  if (status === "pending")
    return { Icon: UploadCloud, color: "text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10" };
  if (status === "active")
    return { Icon: Activity, color: "text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10" };
  // neutral
  return tab === "recent"
    ? { Icon: FileText, color: "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800" }
    : { Icon: Activity, color: "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800" };
}

/* ── Loading skeleton ────────────────────────────────────── */
function LogSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl animate-pulse">
          <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function ActivityLogs() {
  const [activeTab, setActiveTab] = useState<"recent" | "history">("recent");
  const [recentLogs, setRecentLogs] = useState<LogItem[]>([]);
  const [systemHistory, setSystemHistory] = useState<LogItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetch("/api/student/activity-logs/recent-logs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRecentLogs(data.logs);
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, []);

  useEffect(() => {
    fetch("/api/student/activity-logs/system-history")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSystemHistory(data.history);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const displayData = activeTab === "recent" ? recentLogs : systemHistory;
  const isLoading = activeTab === "recent" ? loadingRecent : loadingHistory;

  return (
    <div className="min-h-screen bg-[#fbfcff] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <PageHeader
        title="Activity Logs"
        description="Chronological record of your submissions, approvals, and system interactions."
        icon={History}
        breadcrumbs={[{ label: "Student" }, { label: "Activity Logs" }]}
      />
      <div className="w-full max-w-none mx-0 p-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm transition-colors overflow-hidden">


        {/* Tabs */}
        <div className="px-0 md:px-8 pt-4 md:pt-6">
          <div className="flex gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800">
            {(["recent", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {tab === "recent" ? "Recent Logs" : "System History"}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="p-0 md:p-8">
          {isLoading ? (
            <LogSkeleton />
          ) : displayData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium italic">
                No {activeTab === "recent" ? "recent logs" : "history"} found.
              </p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
              {displayData.map((log) => {
                const { Icon, color } = iconAndColor(log.status, activeTab);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 px-3 py-4 md:p-4 rounded-none transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                  >
                    <div className={`p-3 rounded-xl shrink-0 transition-colors ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {log.action}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                        {log.time}
                      </p>
                    </div>
                    {/* Status badge */}
                    {log.status !== "neutral" && (
                      <span
                        className={`shrink-0 self-center text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          log.status === "success"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : log.status === "error"
                            ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                            : log.status === "active"
                            ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            : "bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20"
                        }`}
                      >
                        {log.status === "active" ? "Live" : log.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
