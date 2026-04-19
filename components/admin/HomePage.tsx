"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Check, AlertCircle, Search, X,
  ShieldCheck, Eye, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

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
    const check = () => setIsMobile(window.innerWidth < 640);
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
  const filteredChart = useMemo(() => {
    const programs = [...new Set(globalFiltered.map(s => s.program).filter(Boolean))];
    return programs.map(prog => {
      const group = globalFiltered.filter(s => s.program === prog);
      return {
        name: prog,
        cleared: group.filter(s => s.status === "Cleared").length,
        notCleared: group.filter(s => s.status === "Not Cleared").length,
      };
    });
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <p className="text-slate-400 text-sm">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">

      {/* ── MODAL ── */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className={`p-6 sm:p-8 ${avatarColor(selectedStudent.student_id)} flex justify-between items-start`}>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h2>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                  ID: {selectedStudent.user_id}
                </p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-black/5 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-bold">
                <div className="p-4 bg-slate-50 rounded-2xl">Program: {selectedStudent.program || "—"}</div>
                <div className="p-4 bg-slate-50 rounded-2xl">{yearLabel(selectedStudent.year_level)}</div>
              </div>
              <div className={`p-4 rounded-2xl text-center font-black text-sm uppercase tracking-widest ${
                selectedStudent.status === "Cleared"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-orange-50 text-orange-600"
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
        <div className="col-span-12 lg:col-span-8 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="font-black uppercase text-[10px] sm:text-xs tracking-widest text-slate-400">Institutional Overview</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Real-time clearance tracking</p>
            </div>
            <div className="bg-slate-50 px-3 py-1 rounded-xl border flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-slate-400" />
              <select
                className="bg-transparent text-[10px] sm:text-[11px] font-black uppercase tracking-wider p-2 outline-none cursor-pointer flex-grow"
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="cleared" name="Cleared" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : 24} />
                <Bar dataKey="notCleared" name="Not Cleared" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : 24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">
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

          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-orange-100 shadow-sm relative overflow-hidden">
            <AlertCircle className="absolute -right-2 -bottom-2 text-orange-500 opacity-10" size={70} />
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Not Cleared</p>
            <h2 className="text-3xl sm:text-4xl font-black text-orange-600 tracking-tighter">
              {globalFiltered.filter(s => s.status === "Not Cleared").length}
            </h2>
          </div>
        </div>
      </div>

      {/* ── STUDENT DIRECTORY ── */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800">Student Directory</h2>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 mt-1">{tableResults.length} students found</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-slate-50 px-4 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center">
              <select
                value={tableLevelFilter}
                onChange={(e) => setTableLevelFilter(e.target.value as YearLevel)}
                className="bg-transparent text-[11px] font-bold outline-none py-3 cursor-pointer w-full"
              >
                <option value="All">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 focus:bg-white transition-all outline-none font-medium text-xs sm:text-sm"
                placeholder="Search name or ID..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="block md:hidden divide-y divide-slate-50">
          {paginated.map((s) => (
            <div key={s.student_id} className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 shrink-0 rounded-xl ${avatarColor(s.student_id)} flex items-center justify-center font-black text-sm`}>
                  {getInitials(s.first_name, s.last_name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-700 text-sm truncate">{s.first_name} {s.last_name}</p>
                  <p className="text-[10px] font-bold text-slate-400">ID: {s.user_id}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{yearLabel(s.year_level)}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${s.status === "Cleared" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                    {s.status}
                  </span>
                </div>
                <button onClick={() => setSelectedStudent(s)} className="text-indigo-600 font-black text-[10px] uppercase">View</button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((s) => (
                <tr key={s.student_id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${avatarColor(s.student_id)} flex items-center justify-center font-black text-xs shadow-sm`}>
                        {getInitials(s.first_name, s.last_name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{s.first_name} {s.middle_name} {s.last_name}</p>
                        <p className="text-[10px] font-bold text-slate-400">ID: {s.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{yearLabel(s.year_level)}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{s.program || "—"}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      s.status === "Cleared" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
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
        <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {tableResults.length} filtered entries
          </p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-[10px] font-black transition-all ${
                    currentPage === page ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}