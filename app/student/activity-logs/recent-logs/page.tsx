"use client";
import React, { useState, useEffect } from "react";
import {
  Search, Clock, History, ArrowUpRight,
  ShieldCheck, CheckCircle2, AlertCircle, UploadCloud
} from "lucide-react";
import { SkeletonLogFeed, SkeletonTableRow } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";

interface Log {
  id: number;
  requirementId: number;
  action: string;
  status: "success" | "error" | "pending";
  time: string;
}

/* ── Status helpers ──────────────────────────────────────────── */
function getStatusBadge(status: Log["status"]) {
  if (status === "success")
    return {
      label: "Approved",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      accent: "hover:border-emerald-500",
    };
  if (status === "error")
    return {
      label: "Rejected",
      cls: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
      accent: "hover:border-rose-500",
    };
  return {
    label: "Pending",
    cls: "bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20",
    accent: "hover:border-brand-500",
  };
}

function getIcon(status: Log["status"]) {
  if (status === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "error")   return <AlertCircle  className="w-4 h-4 text-rose-500" />;
  return                           <UploadCloud  className="w-4 h-4 text-brand-500" />;
}

function getAccentDot(status: Log["status"]) {
  if (status === "success") return "bg-emerald-500";
  if (status === "error")   return "bg-rose-500";
  return "bg-brand-500";
}

/* ── Main component ──────────────────────────────────────────── */
const RecentLogsPage = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Log["status"]>("All");

  useEffect(() => {
    fetch("/api/student/activity-logs/recent-logs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setLogs(data.logs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-6 bg-[#fbfcff] dark:bg-slate-950 font-sans transition-colors text-slate-900 dark:text-slate-100">
      <PageHeader
        title="Recent Logs"
        description="Real-time activity log of your clearance submissions."
        icon={History}
        containerClassName="px-2 sm:px-4 py-2 sm:py-4 lg:px-6"
      />

      <div className="max-w-[1600px] mx-auto px-0 py-2 sm:py-4 md:py-8">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">

        {/* Controls row */}
        <div className="border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 sm:py-5 transition-colors">
          <div className="grid grid-cols-[2fr_1fr] gap-2 w-full sm:flex sm:w-auto sm:ml-auto">
              <div className="relative min-w-0 flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search actions..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs outline-none transition-all focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-brand-500/5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="min-w-0 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="success">Approved</option>
                <option value="error">Rejected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

        {/* ── MOBILE CARD FEED (< md) ───────────────────────────── */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            <><SkeletonLogFeed /><SkeletonLogFeed /><SkeletonLogFeed /></>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400 italic">No logs found.</div>
          ) : filtered.map((log) => {
            const { label, cls } = getStatusBadge(log.status);
            return (
              <div key={log.id} className="p-4 sm:p-6 space-y-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                {/* Top row: icon + action + badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                        {getIcon(log.status)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${getAccentDot(log.status)}`} />
                    </div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                      {log.action}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm ${cls}`}>
                    {label}
                  </span>
                </div>
                {/* Bottom: timestamp */}
                <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400">
                  <Clock size={11} className="text-slate-400" />
                  <span>{log.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── DESKTOP TABLE (≥ md) ──────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                <th className="px-6 py-4 font-black">Activity</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <><SkeletonTableRow cols={3} /><SkeletonTableRow cols={3} /><SkeletonTableRow cols={3} /><SkeletonTableRow cols={3} /></>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-16 text-center text-sm text-slate-400 italic">Table is empty.</td></tr>
              ) : filtered.map((log) => {
                const { label, cls, accent } = getStatusBadge(log.status);
                return (
                  <tr
                    key={log.id}
                    className={`group transition-all duration-200 border-l-[4px] border-transparent ${accent} hover:bg-slate-50/80 dark:hover:bg-slate-800/50`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {getIcon(log.status)}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-[420px]">
                          {log.action}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm ${cls}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {log.time}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between bg-slate-50/20 dark:bg-slate-900/20 transition-colors flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-600 dark:text-brand-400" />
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.15em]">
              Official Activity History — BISU Clearance
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RecentLogsPage;
