"use client";
import React, { useState, useEffect } from "react";
import {
  Search, ChevronDown, Clock, History, ArrowUpRight,
  ShieldCheck, Activity, UserCog, BookOpen, AlertCircle
} from "lucide-react";
import { SkeletonLogFeed, SkeletonTableRow } from "@/components/ui/Skeleton";

interface HistoryItem {
  id: number;
  action: string;
  status: "neutral" | "active";
  time: string;
}

/* ── Helpers ──────────────────────────────────────────────── */
function getItemStyle(status: HistoryItem["status"], action: string) {
  if (status === "active")
    return {
      badge: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      label: "Live",
      accent: "hover:border-amber-500",
      dot: "bg-amber-500",
      icon: <Activity className="w-3.5 h-3.5 text-amber-500" />,
    };
  if (action.toLowerCase().includes("account"))
    return {
      badge: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
      label: "Created",
      accent: "hover:border-indigo-500",
      dot: "bg-indigo-500",
      icon: <UserCog className="w-3.5 h-3.5 text-indigo-500" />,
    };
  if (action.toLowerCase().includes("enrolled"))
    return {
      badge: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      label: "Enrolled",
      accent: "hover:border-blue-500",
      dot: "bg-blue-500",
      icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" />,
    };
  if (action.toLowerCase().includes("ended"))
    return {
      badge: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      label: "Ended",
      accent: "hover:border-slate-400",
      dot: "bg-slate-400",
      icon: <AlertCircle className="w-3.5 h-3.5 text-slate-400" />,
    };
  // clearance period started / neutral
  return {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    label: "Event",
    accent: "hover:border-emerald-500",
    dot: "bg-emerald-500",
    icon: <Activity className="w-3.5 h-3.5 text-emerald-500" />,
  };
}

/* ── Main component ───────────────────────────────────────── */
const SystemHistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/student/activity-logs/system-history")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = history.filter((h) =>
    h.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-1 lg:p-2 bg-transparent font-sans transition-colors text-slate-900 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden transition-colors">

        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">System History</h1>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 pl-9 font-medium uppercase tracking-wider">
              System Audit — Account creation and clearance period events
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-center">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history logs..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs outline-none transition-all focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-indigo-500/5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            <><SkeletonLogFeed /><SkeletonLogFeed /><SkeletonLogFeed /></>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400 italic">No history found.</div>
          ) : filtered.map((item) => {
            const style = getItemStyle(item.status, item.action);
            return (
              <div key={item.id} className="p-6 space-y-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                        {style.icon}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${style.dot}`} />
                    </div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-[13px]">{item.action}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm ${style.badge}`}>{style.label}</span>
                </div>
                <div className="flex justify-end items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400">
                  <Clock size={12} className="text-slate-400" />
                  <span>{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                <th className="px-6 py-4 font-black">Category</th>
                <th className="px-6 py-4 font-black">Activity Description</th>
                <th className="px-6 py-4 font-black">Result</th>
                <th className="px-6 py-4 font-black text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <><SkeletonTableRow cols={4} /><SkeletonTableRow cols={4} /><SkeletonTableRow cols={4} /></>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-sm text-slate-400 italic">No history found.</td></tr>
              ) : filtered.map((item) => {
                const style = getItemStyle(item.status, item.action);
                return (
                  <tr key={item.id} className={`group transition-all duration-200 border-l-[4px] border-transparent ${style.accent} hover:bg-slate-50/80 dark:hover:bg-slate-800/50`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800`}>{style.icon}</div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                          {item.action.toLowerCase().includes("account") ? "Account"
                            : item.action.toLowerCase().includes("enrolled") ? "Enrollment"
                            : "System"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-[340px] leading-relaxed font-medium">{item.action}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm ${style.badge}`}>{style.label}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.time}
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-8 py-4 flex items-center justify-between bg-slate-50/20 dark:bg-slate-900/20 transition-colors">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
            Security logs are encrypted and verified by <span className="text-indigo-600 dark:text-indigo-400">BISU-IT Center</span>
          </p>
          <p className="text-[10px] text-slate-400 font-bold">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </div>
  );
};

export default SystemHistoryPage;