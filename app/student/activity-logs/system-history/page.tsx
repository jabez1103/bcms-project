"use client";
import React, { useState, useEffect } from "react";
import {
  Search, Clock, History, ArrowUpRight,
  ShieldCheck, Activity, UserCog, BookOpen, AlertCircle,
  LogIn, LogOut, KeyRound, Wifi,
} from "lucide-react";
import { SkeletonLogFeed, SkeletonTableRow } from "@/components/ui/Skeleton";

interface HistoryItem {
  id: number;
  event_type: string;
  action: string;
  status: string;
  time: string;
  ip_address: string | null;
}

/* ── Event style map ─────────────────────────────────────────── */
type EventStyle = {
  badge: string;
  label: string;
  accent: string;
  dot: string;
  icon: React.ReactNode;
  category: string;
};

function getItemStyle(item: HistoryItem): EventStyle {
  switch (item.event_type) {
    case "login":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        label: "Login",
        accent: "hover:border-emerald-500",
        dot: "bg-emerald-500",
        icon: <LogIn className="w-3.5 h-3.5 text-emerald-500" />,
        category: "Authentication",
      };
    case "logout":
      return {
        badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        label: "Logout",
        accent: "hover:border-slate-400",
        dot: "bg-slate-400",
        icon: <LogOut className="w-3.5 h-3.5 text-slate-400" />,
        category: "Authentication",
      };
    case "password_changed":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
        label: "Security",
        accent: "hover:border-amber-500",
        dot: "bg-amber-500",
        icon: <KeyRound className="w-3.5 h-3.5 text-amber-500" />,
        category: "Security",
      };
    case "account_created":
      return {
        badge: "bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20",
        label: "Created",
        accent: "hover:border-brand-500",
        dot: "bg-brand-500",
        icon: <UserCog className="w-3.5 h-3.5 text-brand-500" />,
        category: "Account",
      };
    case "enrolled":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
        label: "Enrolled",
        accent: "hover:border-blue-500",
        dot: "bg-blue-500",
        icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" />,
        category: "Account",
      };
    case "period_started":
      return {
        badge: item.status === "active"
          ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
          : "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        label: item.status === "active" ? "Live" : "Started",
        accent: item.status === "active" ? "hover:border-amber-500" : "hover:border-emerald-500",
        dot: item.status === "active" ? "bg-amber-500" : "bg-emerald-500",
        icon: <Activity className={`w-3.5 h-3.5 ${item.status === "active" ? "text-amber-500" : "text-emerald-500"}`} />,
        category: "Clearance",
      };
    case "period_ended":
      return {
        badge: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
        label: "Ended",
        accent: "hover:border-rose-400",
        dot: "bg-rose-400",
        icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
        category: "Clearance",
      };
    default:
      return {
        badge: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        label: "Event",
        accent: "hover:border-slate-400",
        dot: "bg-slate-400",
        icon: <Activity className="w-3.5 h-3.5 text-slate-400" />,
        category: "System",
      };
  }
}

/* ── IP address chip ─────────────────────────────────────────── */
function IpChip({ ip }: { ip: string | null }) {
  if (!ip) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      <Wifi className="w-2.5 h-2.5" />
      {ip}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────── */
const SystemHistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetch("/api/student/activity-logs/system-history")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", "Authentication", "Security", "Account", "Clearance"];

  const filtered = history.filter((h) => {
    const style = getItemStyle(h);
    const matchSearch = h.action.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || style.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="w-full p-1 lg:p-2 bg-transparent font-sans transition-colors text-slate-900 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden transition-colors">

        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-3 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
                  <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">System History</h1>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 pl-9 font-medium uppercase tracking-wider">
                Login, security &amp; clearance events
              </p>
            </div>

            {/* Search + mobile category dropdown */}
            <div className="grid grid-cols-[2fr_1fr] gap-2 w-full sm:w-auto sm:flex sm:items-center">
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search history..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs outline-none transition-all focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-brand-500/5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="sm:hidden min-w-0 px-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-black bg-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="hidden sm:flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  categoryFilter === cat
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            <><SkeletonLogFeed /><SkeletonLogFeed /><SkeletonLogFeed /></>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400 italic">No history found.</div>
          ) : filtered.map((item) => {
            const style = getItemStyle(item);
            return (
              <div key={item.id} className="p-5 space-y-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                        {style.icon}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${style.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-[13px] leading-snug">{item.action}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <IpChip ip={item.ip_address} />
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400">
                  <Clock size={11} className="text-slate-400" />
                  <span>{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                <th className="px-6 py-4 font-black">Category</th>
                <th className="px-6 py-4 font-black">Activity</th>
                <th className="px-6 py-4 font-black">Result</th>
                <th className="px-6 py-4 font-black">IP Address</th>
                <th className="px-6 py-4 font-black text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <><SkeletonTableRow cols={5} /><SkeletonTableRow cols={5} /><SkeletonTableRow cols={5} /></>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-400 italic">No history found.</td></tr>
              ) : filtered.map((item) => {
                const style = getItemStyle(item);
                return (
                  <tr
                    key={item.id}
                    className={`group transition-all duration-200 border-l-[4px] border-transparent ${style.accent} hover:bg-slate-50/80 dark:hover:bg-slate-800/50`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">{style.icon}</div>
                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-tighter">
                          {style.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-[320px] leading-relaxed font-medium">
                        {item.action}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm ${style.badge}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <IpChip ip={item.ip_address} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {item.time}
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
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-50/20 dark:bg-slate-900/20 transition-colors">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-600 dark:text-brand-400" />
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.15em]">
              Security logs — BISU Clearance System
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </div>
  );
};

export default SystemHistoryPage;
