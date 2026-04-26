"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
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

interface RequirementDetail {
  requirementId: number;
  requirementName: string;
  department: string;
  signatoryName: string;
  status: string;
}

interface StudentSignatoryBreakdown {
  department: string;
  signatoryName: string;
  approved: number;
  pending: number;
  rejected: number;
  total: number;
  status: "Approved" | "Pending" | "Rejected";
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
  const [studentDetails, setStudentDetails] = useState<RequirementDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
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

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!selectedStudent) {
        setStudentDetails([]);
        return;
      }

      setDetailsLoading(true);
      try {
        const res = await fetch(`/api/admin/clearance-progress/student/${selectedStudent.student_id}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success && Array.isArray(data.requirements)) {
          setStudentDetails(data.requirements as RequirementDetail[]);
        } else {
          setStudentDetails([]);
        }
      } catch {
        setStudentDetails([]);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchStudentDetails();
  }, [selectedStudent]);

  const groupedStudentDetails = useMemo<StudentSignatoryBreakdown[]>(() => {
    const groups = studentDetails.reduce((acc: Record<string, RequirementDetail[]>, row) => {
      const key = `${row.department}|||${row.signatoryName}`;
      (acc[key] ||= []).push(row);
      return acc;
    }, {});

    return Object.entries(groups).map(([key, rows]) => {
      const [department, signatoryName] = key.split("|||");
      const approved = rows.filter((r) => r.status === "approved").length;
      const rejected = rows.filter((r) => r.status === "rejected").length;
      const pending = rows.filter((r) => r.status === "pending" || r.status === "not_submitted").length;
      const total = rows.length;
      const status: StudentSignatoryBreakdown["status"] =
        rejected > 0 ? "Rejected" : pending > 0 ? "Pending" : "Approved";

      return { department, signatoryName, approved, pending, rejected, total, status };
    });
  }, [studentDetails]);

  const downloadStudentProgress = () => {
    if (!selectedStudent || groupedStudentDetails.length === 0) return;

    const dateStamp = new Date().toISOString().slice(0, 10);
    const csv = [
      ["Student ID", "Student Name", "Department", "Signatory", "Overall Status", "Approved", "Pending", "Rejected", "Total Requirements"],
      ...groupedStudentDetails.map((row) => [
        selectedStudent.student_id,
        `${selectedStudent.first_name} ${selectedStudent.last_name}`,
        row.department,
        row.signatoryName,
        row.status,
        row.approved,
        row.pending,
        row.rejected,
        row.total,
      ]),
    ]
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_progress_${selectedStudent.student_id}_${dateStamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-6 bg-[#fbfcff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <header className="sticky top-0 z-[20] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 px-2 sm:px-4 py-3 lg:px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 dark:bg-slate-800 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 dark:shadow-none">
              <LayoutGrid size={16} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-[13px] sm:text-2xl font-black tracking-tight leading-none uppercase">
                Admin <span className="text-brand-600 dark:text-brand-400">Dashboard</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] font-black uppercase tracking-[0.17em]">Clearance Monitoring</p>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[clamp(8px,2.6vw,10px)] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-wider shadow-sm">
            <Users size={13} />
            {stats.total} Total Students
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-0 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Performance
                </h3>
                <p className="text-xl font-black">Clearance Status Overview</p>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl bcms-keep-rounded w-full sm:w-auto">
                <div className="flex gap-1 mr-2">
                  <button
                    onClick={() => setChartView("pie")}
                    className={`p-2 rounded-xl bcms-keep-rounded transition-all ${
                      chartView === "pie"
                        ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <PieIcon size={18} />
                  </button>
                  <button
                    onClick={() => setChartView("bar")}
                    className={`p-2 rounded-xl bcms-keep-rounded transition-all ${
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

          <div className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
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

        <section className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
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

            <div className="flex flex-row gap-2 sm:gap-3 w-full xl:w-auto">
              <div className="relative flex-[1.35] min-w-0 sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-brand-500/10 transition-all"
                  placeholder="Search by ID or name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
              <select
                className="flex-1 sm:flex-none min-w-[120px] px-3.5 sm:px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer"
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
                <div key={s.student_id} className="p-6 space-y-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{s.first_name} {s.middle_name} {s.last_name}</p>
                      <p className="text-xs font-medium text-slate-400">ID: {s.user_id}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.program || "No Program"}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {yearLabel(s.year_level)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(s)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"
                  >
                    <Eye size={14} className="mr-2" /> View Details
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year / Program</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
                ) : (
                  paginatedData.map((s) => (
                    <tr key={s.student_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{s.first_name} {s.middle_name} {s.last_name}</p>
                        <p className="text-xs font-medium text-slate-400">ID: {s.user_id}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{yearLabel(s.year_level)}</p>
                        <p className="text-xs text-slate-400">{s.program || "No Program"}</p>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-4 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center text-xs font-bold text-slate-400">
            <p>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, tableResults.length)}–
              {Math.min(currentPage * itemsPerPage, tableResults.length)} of {tableResults.length} records
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:text-brand-600 transition-colors disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:text-brand-600 transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden">
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
                    ID {selectedStudent.student_id} • {yearLabel(selectedStudent.year_level)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadStudentProgress}
                  disabled={detailsLoading || groupedStudentDetails.length === 0}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FileDown size={14} />
                  Download Soft Copy
                </button>
                <button onClick={() => setSelectedStudent(null)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {detailsLoading ? (
                <p className="text-sm font-bold text-slate-500">Loading student progress...</p>
              ) : groupedStudentDetails.length === 0 ? (
                <p className="text-sm font-bold text-slate-500">No student requirement details found.</p>
              ) : (
                <div className="space-y-4">
                  {groupedStudentDetails.map((row) => (
                    <div key={`${row.department}-${row.signatoryName}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100">{row.department}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{row.signatoryName}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                        Student Status: {row.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
    <div className="p-2.5 sm:p-4 lg:p-8 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between shadow-sm">
      <div className="min-w-0">
        <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider lg:tracking-widest mb-0.5">{label}</p>
        <h2 className={`text-2xl sm:text-3xl lg:text-5xl font-black leading-none ${color}`}>{value}</h2>
      </div>
      <div className={`p-2 sm:p-2.5 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bcms-keep-rounded ${bg} ${color}`}>{icon}</div>
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
