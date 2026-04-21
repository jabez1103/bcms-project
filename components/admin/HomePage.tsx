"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Check, AlertCircle, Search, X,
  ShieldCheck, Eye, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
  import { BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  SkeletonStatCard,
  SkeletonChart,
  SkeletonDashboardRow,
  SkeletonMobileCard
} from "@/components/ui/Skeleton";

/* ================= TYPES ================= */
type StudentStatus = "Cleared" | "Not Cleared";
type YearLevel = "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | "All";

interface Student {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  student_id: number;
  program: string;
  year_level: number;
  status: StudentStatus;
}

interface ChartEntry {
  name: string;
  cleared: number;
  notCleared: number;
}

interface Stats {
  total: number;
  cleared: number;
  notCleared: number;
}

/* ================= HELPERS ================= */
function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function yearLabel(level: number): string {
  return ["1st Year", "2nd Year", "3rd Year", "4th Year"][level - 1] ?? `Year ${level}`;
}

const AVATAR_COLORS = [
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-indigo-100 text-indigo-600",
  "bg-cyan-100 text-cyan-600",
  "bg-yellow-100 text-yellow-600",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

/* ================= COMPONENT ================= */
export default function AdminHomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [chartData, setChartData] = useState<ChartEntry[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, cleared: 0, notCleared: 0 });
  const [loading, setLoading] = useState(true);

  const [globalLevelFilter, setGlobalLevelFilter] = useState<YearLevel>("All");
  const [tableSearch, setTableSearch] = useState("");
  const [tableLevelFilter, setTableLevelFilter] = useState<YearLevel>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<"pie" | "bar">("pie");
  const [chartRadius, setChartRadius] = useState({ inner: 60, outer: 85 });

  const itemsPerPage = 5;

  /* ── FETCH ── */
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setChartData(data.chartData);
        setStats(data.stats);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setChartRadius(window.innerWidth < 640 ? { inner: 40, outer: 65 } : { inner: 60, outer: 85 });
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── FILTERS ── */
  const globalFiltered = useMemo(() => {
    if (globalLevelFilter === "All") return students;
    const lvl = parseInt(globalLevelFilter);
    return students.filter(s => s.year_level === lvl);
  }, [students, globalLevelFilter]);

  // Recompute chart based on global filter
  const analyticsData = useMemo(() => {
    return [
      { name: "Cleared", value: globalFiltered.filter(s => s.status === "Cleared").length, color: "#10b981" }, // emerald-500
      { name: "Not Cleared", value: globalFiltered.filter(s => s.status === "Not Cleared").length, color: "#f97316" }, // orange-500
    ];
  }, [globalFiltered]);

  const tableResults = useMemo(() => {
    const q = tableSearch.toLowerCase();
    return students.filter(s => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      const matchLevel = tableLevelFilter === "All" || s.year_level === parseInt(tableLevelFilter);
      const matchSearch = name.includes(q) || String(s.user_id).includes(q);
      return matchLevel && matchSearch;
    });
  }, [students, tableSearch, tableLevelFilter]);

  useEffect(() => { setCurrentPage(1); }, [tableSearch, tableLevelFilter]);

  const totalPages = Math.ceil(tableResults.length / itemsPerPage);
  const paginated = tableResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  if (loading) return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans">

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <SkeletonChart />
        </div>

        <div className="col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        
        {/* MOBILE SKELETON */}
        <div className="block md:hidden divide-y divide-slate-50 dark:divide-slate-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonMobileCard key={i} />
          ))}
        </div>

        {/* DESKTOP SKELETON */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonDashboardRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-100">

      {/* ── MODAL ── */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className={`p-6 sm:p-8 ${avatarColor(selectedStudent.student_id)} flex justify-between items-start`}>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h2>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                  ID: {selectedStudent.user_id}
                </p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-bold">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">Program: {selectedStudent.program || "—"}</div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">{yearLabel(selectedStudent.year_level)}</div>
              </div>
              <div className={`p-4 rounded-2xl text-center font-black text-sm uppercase tracking-widest ${
                selectedStudent.status === "Cleared"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
              }`}>
                {selectedStudent.status}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-10">

        {/* CHART */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="font-black uppercase text-[10px] sm:text-xs tracking-widest text-slate-400 dark:text-slate-500">Institutional Overview</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">Real-time clearance tracking</p>
            </div>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-auto">
              <div className="flex gap-1 mr-2">
                <button onClick={() => setViewMode("pie")} className={`p-2 rounded-xl transition-all ${viewMode === "pie" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg></button>
                <button onClick={() => setViewMode("bar")} className={`p-2 rounded-xl transition-all ${viewMode === "bar" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg></button>
              </div>
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mr-2" />
              <select
                className="bg-transparent dark:text-slate-200 text-[10px] sm:text-[11px] font-black uppercase tracking-wider p-2 outline-none cursor-pointer flex-grow"
                value={globalLevelFilter}
                onChange={(e) => setGlobalLevelFilter(e.target.value as YearLevel)}
              >
                <option value="All">All Levels</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              {viewMode === "pie" ? (
                  <PieChart>
                    <Pie data={analyticsData} innerRadius={chartRadius.inner} outerRadius={chartRadius.outer} paddingAngle={8} dataKey="value">
                      {analyticsData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px' }} />
                  </PieChart>
                ) : (
                  <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={isMobile ? 30 : 60}>
                      {analyticsData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  </BarChart>
                )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Students</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
              {globalLevelFilter === "All" ? stats.total : globalFiltered.length}
            </h2>
          </div>

          <div className="bg-indigo-600 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <ShieldCheck className="absolute -right-2 -bottom-2 opacity-10" size={70} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Cleared</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">
              {globalFiltered.filter(s => s.status === "Cleared").length}
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-orange-100 dark:border-orange-900/30 shadow-sm relative overflow-hidden">
            <AlertCircle className="absolute -right-2 -bottom-2 text-orange-500 opacity-10" size={70} />
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Not Cleared</p>
            <h2 className="text-3xl sm:text-4xl font-black text-orange-600 tracking-tighter">
              {globalFiltered.filter(s => s.status === "Not Cleared").length}
            </h2>
          </div>
        </div>
      </div>

      {/* ── STUDENT DIRECTORY ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">Student Directory</h2>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{tableResults.length} students found</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center">
              <select
                value={tableLevelFilter}
                onChange={(e) => setTableLevelFilter(e.target.value as YearLevel)}
                className="bg-transparent dark:text-slate-200 text-[11px] font-bold outline-none py-3 cursor-pointer w-full"
              >
                <option value="All">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 dark:text-slate-200 transition-all outline-none font-medium text-xs sm:text-sm"
                placeholder="Search name or ID..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="block md:hidden divide-y divide-slate-50 dark:divide-slate-800">
          {paginated.map((s) => (
            <div key={s.student_id} className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 shrink-0 rounded-xl ${avatarColor(s.student_id)} flex items-center justify-center font-black text-sm`}>
                  {getInitials(s.first_name, s.last_name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{s.first_name} {s.last_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">ID: {s.user_id}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{yearLabel(s.year_level)}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${s.status === "Cleared" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"}`}>
                    {s.status}
                  </span>
                </div>
                <button onClick={() => setSelectedStudent(s)} className="text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase">View</button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Student</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Year</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Program</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {paginated.map((s) => (
                <tr key={s.student_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${avatarColor(s.student_id)} flex items-center justify-center font-black text-xs shadow-sm`}>
                        {getInitials(s.first_name, s.last_name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{s.first_name} {s.middle_name} {s.last_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">ID: {s.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-slate-300">{yearLabel(s.year_level)}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-slate-300">{s.program || "—"}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      s.status === "Cleared" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-slate-700 hover:text-white transition-all"
                    >
                      <Eye size={14} className="inline mr-2" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginated.length === 0 && !loading && (
          <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest">No results found</div>
        )}

        {/* PAGINATION */}
        <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {tableResults.length} filtered entries
          </p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-[10px] font-black transition-all ${
                    currentPage === page ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-100 dark:shadow-none" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}