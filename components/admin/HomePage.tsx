"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  LayoutGrid,
  PieChart as PieIcon,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  SkeletonChart,
  SkeletonMobileCard,
  SkeletonStatCard,
  SkeletonTableRow,
} from "@/components/ui/Skeleton";

type StudentStatus = "Cleared" | "Not Cleared";
type YearFilter = "All" | "1" | "2" | "3" | "4";
type ChartView = "pie" | "bar";

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

interface Stats {
  total: number;
  cleared: number;
  notCleared: number;
}

const STATUS_COLORS = {
  cleared: "#10b981",
  notCleared: "#f97316",
};

function yearLabel(level: number): string {
  return ["1st Year", "2nd Year", "3rd Year", "4th Year"][level - 1] ?? `Year ${level}`;
}

function getInitials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
  "bg-emerald-100 text-emerald-600",
];

function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

export default function AdminHomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, cleared: 0, notCleared: 0 });
  const [loading, setLoading] = useState(true);

  const [globalYearFilter, setGlobalYearFilter] = useState<YearFilter>("All");
  const [chartView, setChartView] = useState<ChartView>("pie");
  const [tableSearch, setTableSearch] = useState("");
  const [tableYearFilter, setTableYearFilter] = useState<YearFilter>("All");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [chartRadius, setChartRadius] = useState({ inner: 60, outer: 85 });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/dashboard");
        const data = await res.json();
        if (data.success) {
          setStudents(Array.isArray(data.students) ? data.students : []);
          setStats(data.stats ?? { total: 0, cleared: 0, notCleared: 0 });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setChartRadius(window.innerWidth < 640 ? { inner: 40, outer: 65 } : { inner: 60, outer: 85 });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const globalFiltered = useMemo(() => {
    if (globalYearFilter === "All") return students;
    return students.filter((s) => s.year_level === Number(globalYearFilter));
  }, [students, globalYearFilter]);

  const analyticsData = useMemo(
    () => [
      {
        name: "Cleared",
        value: globalFiltered.filter((s) => s.status === "Cleared").length,
        color: STATUS_COLORS.cleared,
      },
      {
        name: "Not Cleared",
        value: globalFiltered.filter((s) => s.status === "Not Cleared").length,
        color: STATUS_COLORS.notCleared,
      },
    ],
    [globalFiltered],
  );

  const tableResults = useMemo(() => {
    const q = tableSearch.toLowerCase();
    return students.filter((s) => {
      const matchYear = tableYearFilter === "All" || s.year_level === Number(tableYearFilter);
      const name = `${s.first_name} ${s.middle_name ?? ""} ${s.last_name}`.toLowerCase();
      const matchSearch = name.includes(q) || String(s.user_id).includes(q);
      return matchYear && matchSearch;
    });
  }, [students, tableSearch, tableYearFilter]);

  useEffect(() => setCurrentPage(1), [tableSearch, tableYearFilter, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(tableResults.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tableResults.slice(start, start + itemsPerPage);
  }, [tableResults, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <header className="sticky top-0 z-[20] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 px-3 py-4 sm:px-5 lg:px-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 dark:shadow-none">
              <LayoutGrid size={20} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none uppercase">
                Admin <span className="text-brand-600 dark:text-brand-400">Dashboard</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Clearance Monitoring</p>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
            <Users size={14} />
            {stats.total} Total Students
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-2 sm:px-4 py-6 sm:py-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Performance
                </h3>
                <p className="text-xl font-black">Clearance Status Overview</p>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-auto">
                <div className="flex gap-1 mr-2">
                  <button
                    onClick={() => setChartView("pie")}
                    className={`p-2 rounded-xl transition-all ${
                      chartView === "pie"
                        ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <PieIcon size={18} />
                  </button>
                  <button
                    onClick={() => setChartView("bar")}
                    className={`p-2 rounded-xl transition-all ${
                      chartView === "bar"
                        ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <BarChart3 size={18} />
                  </button>
                </div>
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mr-2" />
                <select
                  className="bg-transparent dark:text-slate-200 text-[10px] font-black uppercase pr-4 outline-none cursor-pointer"
                  value={globalYearFilter}
                  onChange={(e) => setGlobalYearFilter(e.target.value as YearFilter)}
                >
                  <option value="All">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {loading ? (
                <SkeletonChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  {chartView === "pie" ? (
                    <PieChart>
                      <Pie data={analyticsData} innerRadius={chartRadius.inner} outerRadius={chartRadius.outer} paddingAngle={8} dataKey="value">
                        {analyticsData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                    </PieChart>
                  ) : (
                    <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                        {analyticsData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                      <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none" }} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />)
            ) : (
              <>
                <StatCard label="Total Students" value={stats.total} color="text-slate-800 dark:text-slate-100" bg="bg-slate-100 dark:bg-slate-800" icon={<Users size={24} />} />
                <StatCard label="Cleared" value={stats.cleared} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" icon={<ShieldCheck size={24} />} />
                <StatCard label="Not Cleared" value={stats.notCleared} color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" icon={<AlertCircle size={24} />} />
              </>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex p-3.5 bg-slate-900 rounded-2xl text-white">
                <GraduationCap size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Student Directory</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                  Monitor student clearance state
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              <div className="relative flex-grow sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-brand-500/10 transition-all"
                  placeholder="Search by ID or name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
              <select
                className="px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer"
                value={tableYearFilter}
                onChange={(e) => setTableYearFilter(e.target.value as YearFilter)}
              >
                <option value="All">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div className="block xl:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonMobileCard key={i} />)
            ) : (
              paginatedData.map((s) => (
                <div key={s.student_id} className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${avatarColor(s.student_id)} flex items-center justify-center font-black text-sm shadow-sm shrink-0`}>
                      {getInitials(s.first_name, s.last_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-slate-800 dark:text-slate-200 truncate">{s.first_name} {s.middle_name} {s.last_name}</p>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-0.5 tracking-tight">
                        {s.user_id} • {yearLabel(s.year_level)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.program || "No Program"}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <button
                    onClick={() => setSelectedStudent(s)}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase"
                  >
                    <Eye size={14} className="mr-2" /> View Details
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Student Information</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Program</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
                ) : (
                  paginatedData.map((s) => (
                    <tr key={s.student_id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl ${avatarColor(s.student_id)} flex items-center justify-center font-black text-xs shadow-sm`}>
                            {getInitials(s.first_name, s.last_name)}
                          </div>
                          <div>
                            <p className="font-black text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors">
                              {s.first_name} {s.middle_name} {s.last_name}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-0.5 tracking-tight">
                              {s.user_id} • {yearLabel(s.year_level)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-600 dark:text-slate-300">{s.program || "No Program"}</td>
                      <td className="px-8 py-6">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="inline-flex items-center justify-center px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase"
                        >
                          <Eye size={14} className="mr-2" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Rows per page</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] font-black"
                >
                  {[5, 10, 20, 50].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Showing {paginatedData.length} of {tableResults.length} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${avatarColor(selectedStudent.student_id)} rounded-2xl flex items-center justify-center font-black text-sm`}>
                  {getInitials(selectedStudent.first_name, selectedStudent.last_name)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {selectedStudent.user_id} • {yearLabel(selectedStudent.year_level)}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>Program:</strong> {selectedStudent.program || "No Program"}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>Status:</strong> <span className={selectedStudent.status === "Cleared" ? "text-emerald-600 font-bold" : "text-orange-600 font-bold"}>{selectedStudent.status}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <h2 className={`text-4xl sm:text-5xl font-black ${color}`}>{value}</h2>
      </div>
      <div className={`p-4 sm:p-5 rounded-2xl ${bg} ${color}`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: StudentStatus }) {
  const styles: Record<StudentStatus, string> = {
    Cleared: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    "Not Cleared": "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/50",
  };
  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full ${status === "Cleared" ? "bg-emerald-500" : "bg-orange-500"} animate-pulse`} />
      {status}
    </div>
  );
}
