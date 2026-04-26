"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileX,
  LayoutGrid,
  PieChart as PieIcon,
  BarChart3,
  GraduationCap,
  MessageSquare
} from "lucide-react";
import {
  SkeletonStatCard,
  SkeletonChart,
  SkeletonTableRow,
  SkeletonMobileCard
} from "@/components/ui/Skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

/* ================= TYPES & MOCK DATA ================= */

type SubmissionStatus = "Approved" | "Pending" | "Rejected";
type YearLevel = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
type ChartView = "pie" | "bar";

interface StudentSubmission {
  id: string;
  name: string;
  level: YearLevel;
  program: string;
  status: SubmissionStatus;
  requirementType: string;
  submissionDate: string;
  fileUrl: string;
  remarks: string;
  initials: string;
  color: string;
}

const COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
  "bg-emerald-100 text-emerald-600"
];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

function getColorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

const THEME_COLORS = {
  Approved: "#00FF00", 
  Pending: "#f59e0b", 
  Rejected: "#f43f5e" 
};

/* ================= MAIN DASHBOARD ================= */

export default function SignatoryDashboard() {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [globalLevelFilter, setGlobalLevelFilter] = useState<YearLevel | "All">("All");
  const [viewMode, setViewMode] = useState<ChartView>("pie");
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "All">("All");
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  /* --- PAGINATION STATE --- */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  const [chartRadius, setChartRadius] = useState({ inner: 60, outer: 85 });

  /* --- SELECTION & BULK STATE --- */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<"Approve" | "Reject" | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/signatory/submissions");
        const data = await res.json();
        if (data.success) {
          const formatted = data.submissions.map((s: any) => ({
            id: s.id,
            name: s.name,
            level: s.year,
            program: s.program,
            status: s.status,
            requirementType: s.requirement,
            submissionDate: s.submittedAt,
            fileUrl: s.fileUrl || "",
            remarks: s.studentComment || "",
            initials: getInitials(s.name),
            color: getColorForId(s.id)
          }));
          setSubmissions(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setChartRadius(window.innerWidth < 640 ? { inner: 40, outer: 65 } : { inner: 60, outer: 85 });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, statusFilter]);

  const analyticsData = useMemo(() => {
    const filtered = globalLevelFilter === "All" ? submissions : submissions.filter(s => s.level === globalLevelFilter);
    return [
      { name: "Approved", value: filtered.filter(s => s.status === "Approved").length, color: THEME_COLORS.Approved },
      { name: "Pending", value: filtered.filter(s => s.status === "Pending").length, color: THEME_COLORS.Pending },
      { name: "Rejected", value: filtered.filter(s => s.status === "Rejected").length, color: THEME_COLORS.Rejected },
    ];
  }, [submissions, globalLevelFilter]);

  const filteredData = useMemo(() => {
    return submissions.filter((s) => {
      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      const matchSearch = s.name.toLowerCase().includes(tableSearch.toLowerCase()) || s.id.includes(tableSearch);
      return matchStatus && matchSearch;
    });
  }, [submissions, tableSearch, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const isPageSelected =
    paginatedData.length > 0 && paginatedData.every((s) => selectedIds.includes(String(s.id)));

  const handleSelectPage = () => {
    const pageIds = paginatedData.map(s => s.id);
    if (isPageSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelect = (id: string) => {
    const normalizedId = String(id);
    setSelectedIds(prev => prev.includes(normalizedId) ? prev.filter(i => i !== normalizedId) : [...prev, normalizedId]);
  };

  const handleBulkAction = async () => {
    if (!showBulkModal) return;
    const newStatus = showBulkModal === "Approve" ? "Approved" : "Rejected";
    try {
      const res = await fetch("/api/signatory/submissions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionIds: selectedIds,
          status: showBulkModal.toLowerCase(),
          feedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(prev =>
          prev.map(s => selectedIds.includes(String(s.id)) ? { ...s, status: newStatus } : s)
        );
      }
    } catch (err) {
      console.error("Bulk action failed", err);
    }
    setSelectedIds([]);
    setFeedback("");
    setShowBulkModal(null);
  };

  const updateStatus = async (id: string, newStatus: SubmissionStatus) => {
    try {
      await fetch("/api/signatory/submissions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionIds: [id], status: newStatus.toLowerCase(), feedback }),
      });
    } catch (err) {
      console.error("Status update failed", err);
    }
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setSelectedSubmission(null);
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-6 bg-[#fbfcff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* STICKY HEADER COMPONENT */}
      <header className="sticky top-0 z-[20] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 px-2 py-3 sm:px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 dark:bg-slate-800 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 dark:shadow-none">
                <ShieldCheck size={16} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-[13px] sm:text-2xl font-black tracking-tight leading-none uppercase">
                Signatory <span className="text-blue-600">Portal</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[8px] font-black uppercase tracking-[0.17em]">Queue Monitoring</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0" />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-0 py-6 sm:py-8">
        
        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Performance</h3>
                <p className="text-xl font-black">Analytics Overview</p>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-auto">
                <div className="flex gap-1 mr-2">
                  <button onClick={() => setViewMode("pie")} className={`p-2 rounded-xl transition-all ${viewMode === "pie" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}><PieIcon size={18} /></button>
                  <button onClick={() => setViewMode("bar")} className={`p-2 rounded-xl transition-all ${viewMode === "bar" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}><BarChart3 size={18} /></button>
                </div>
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mr-2" />
                <select 
                  className="bg-transparent dark:text-slate-200 text-[10px] font-black uppercase pr-4 outline-none cursor-pointer"
                  value={globalLevelFilter}
                  onChange={(e) => setGlobalLevelFilter(e.target.value as any)}
                >
                  <option value="All" className="text-black bg-white">All Years</option>
                  <option value="1st Year" className="text-black bg-white">1st Year</option>
                  <option value="2nd Year" className="text-black bg-white">2nd Year</option>
                  <option value="3rd Year" className="text-black bg-white">3rd Year</option>
                  <option value="4th Year" className="text-black bg-white">4th Year</option>
                </select>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              {loading ? (
                <SkeletonChart />
              ) : (
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
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                        {analyticsData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />)
            ) : (
              <>
                <StatCard label="Pending" value={analyticsData[1].value} color="text-amber-500" bg="bg-amber-50" icon={<Clock size={24} />} />
                <StatCard label="Approved" value={analyticsData[0].value} color="text-[#00FF00]" bg="bg-green-50" icon={<ShieldCheck size={24} />} />
                <StatCard label="Rejected" value={analyticsData[2].value} color="text-rose-500" bg="bg-rose-50" icon={<FileX size={24} />} />
              </>
            )}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex p-3.5 bg-slate-900 rounded-2xl text-white"><LayoutGrid size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Review Queue</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Manage student clearances</p>
              </div>
            </div>
            
            <div className="grid grid-cols-[1.8fr_1fr_1fr] sm:flex gap-2 sm:gap-3 w-full xl:w-auto items-stretch">
              <div className="relative min-w-0 sm:flex-grow sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input 
                  type="text"
                  className="w-full h-11 sm:h-auto pl-10 sm:pl-11 pr-3 sm:pr-4 py-0 sm:py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-lg sm:rounded-2xl text-[11px] sm:text-xs font-bold outline-none focus:ring-2 ring-blue-500/10 transition-all shadow-inner"
                  placeholder="Search by ID or Name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              <select 
                className="min-w-0 h-11 sm:h-auto px-2 sm:px-5 py-0 sm:py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-2xl text-[10px] sm:text-[10px] text-center font-extrabold normal-case sm:uppercase outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                onClick={handleSelectPage}
                className="sm:hidden min-w-0 h-11 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap"
              >
                Select
              </button>
            </div>
          </div>

          {/* SELECT ALL + BULK ACTIONS TOOLBAR */}
          <div className="px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
            <button
              onClick={handleSelectPage}
              className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isPageSelected
                  ? 'bg-slate-900 dark:bg-brand-600 border-slate-900 dark:border-brand-600'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {isPageSelected && <span className="text-white text-[10px] font-black">&#10003;</span>}
              </div>
              Select Page
            </button>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full">
                  {selectedIds.length} Selected
                </span>
                <button onClick={() => setShowBulkModal("Approve")} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                  Approve
                </button>
                <button onClick={() => setShowBulkModal("Reject")} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                  Reject
                </button>
              </div>
            )}
          </div>

          {/* MOBILE SKELETON & VIEW */}
          <div className="block xl:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonMobileCard key={i} />)
            ) : paginatedData.map((s) => (
              <div key={s.id} className={`p-5 space-y-4 transition-colors ${
                selectedIds.includes(String(s.id)) ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''
              }`}>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(String(s.id))}
                    onChange={() => toggleSelect(s.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 cursor-pointer"
                  />
                  <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center font-black text-sm shadow-sm shrink-0`}>{s.initials}</div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-0.5 tracking-tight flex items-center gap-1 truncate">
                      <GraduationCap size={12} className="shrink-0" /> {s.id} • {s.level}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.requirementType}</p>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{s.program}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <button
                  onClick={() => setSelectedSubmission(s)}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-sm mt-2"
                >
                  Review
                </button>
              </div>
            ))}
          </div>

          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Student Information</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Requirement</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                ) : paginatedData.map((s) => (
                  <tr key={s.id} className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all ${
                    selectedIds.includes(String(s.id)) ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''
                  }`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(String(s.id))}
                          onChange={() => toggleSelect(s.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        <div className={`w-11 h-11 rounded-2xl ${s.color} flex items-center justify-center font-black text-xs shadow-sm`}>{s.initials}</div>
                        <div>
                          <p className="font-black text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{s.name}</p>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-0.5 tracking-tight flex items-center gap-1">
                            <GraduationCap size={12} /> {s.id} • {s.level}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.requirementType}</p>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{s.program}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6"><StatusBadge status={s.status} /></td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setSelectedSubmission(s)}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION FOOTER */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Rows per page</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-[11px] font-black outline-none focus:ring-2 ring-blue-500/10 transition-all cursor-pointer shadow-sm"
                >
                  {[5, 10, 20, 50].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Showing {paginatedData.length} of {filteredData.length} results
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400 shadow-sm active:scale-95"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex gap-1 mx-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages && Math.abs(currentPage - pageNum) > 1) {
                        if (pageNum === 2 || pageNum === totalPages - 1) return <span key={i} className="px-1 text-slate-300 font-black">...</span>;
                        return null;
                    }
                    return (
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                          currentPage === pageNum 
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400 shadow-sm active:scale-95"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* INSPECTION MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

            {/* Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${selectedSubmission.color} rounded-2xl flex items-center justify-center font-black text-sm shadow-sm`}>
                  {selectedSubmission.initials}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{selectedSubmission.name}</h2>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{selectedSubmission.id} • {selectedSubmission.requirementType}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col md:flex-row gap-10">

              {/* File preview */}
              <div className="flex-1">
                {selectedSubmission.fileUrl ? (
                  <img
                    src={selectedSubmission.fileUrl}
                    className="w-full rounded-3xl shadow-lg border-8 border-slate-50 dark:border-slate-800 object-contain max-h-[60vh]"
                    alt="Submitted file preview"
                  />
                ) : (
                  <div className="w-full h-64 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-bold uppercase tracking-widest">No file attached</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="w-full md:w-80 space-y-8 shrink-0">
                {/* Student comment */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Student Note</h4>
                  {selectedSubmission.remarks ? (
                    <div className="bg-brand-50 dark:bg-brand-500/10 rounded-2xl p-4 border border-brand-100 dark:border-brand-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={13} className="text-brand-500 shrink-0" />
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Comment from Student</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed">
                        "{selectedSubmission.remarks}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">No comment was added by the student.</p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 gap-3">
                  <button
                    onClick={() => updateStatus(selectedSubmission.id, "Approved")}
                    className="w-full py-5 bg-brand-600 dark:bg-brand-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-100 dark:shadow-none hover:bg-brand-700 dark:hover:bg-brand-600 transition-all active:scale-95"
                  >
                    Approve Document
                  </button>
                  <button
                    onClick={() => updateStatus(selectedSubmission.id, "Rejected")}
                    className="w-full py-5 bg-white dark:bg-slate-900 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all active:scale-95"
                  >
                    Reject
                  </button>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add optional feedback for this student..."
                    rows={3}
                    maxLength={1000}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK CONFIRM MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6 border border-transparent dark:border-slate-800">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              showBulkModal === "Approve"
                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
            }`}>
              <span className="text-2xl font-black">{showBulkModal === "Approve" ? "✓" : "✕"}</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                Confirm {showBulkModal}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                Are you sure you want to {showBulkModal.toLowerCase()}{" "}
                <strong>{selectedIds.length}</strong> selected submission{selectedIds.length !== 1 ? "s" : ""}?
                This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => setShowBulkModal(null)}
                className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                className={`py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95 ${
                  showBulkModal === "Approve"
                    ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600"
                    : "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600"
                }`}
              >
                Yes, {showBulkModal}
              </button>
            </div>
            <div className="pt-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional feedback for selected submissions..."
                rows={3}
                maxLength={1000}
                className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function StatCard({ label, value, color, icon, bg }: { label: string, value: number, color: string, icon: React.ReactNode, bg: string }) {
  return (
    <div className="p-3 sm:p-8 bg-white dark:bg-slate-900 rounded-lg sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 min-h-[82px] sm:min-h-0 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] sm:tracking-widest mb-0.5 sm:mb-1 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">{label}</p>
        <h2 className={`text-2xl sm:text-5xl leading-none font-black ${color}`}>{value}</h2>
      </div>
      <div className={`hidden sm:flex p-5 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110 [&_svg]:h-6 [&_svg]:w-6`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles = {
    Approved: "bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50",
    Pending: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
    Rejected: "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50",
  };
  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase border shadow-sm ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'Approved' ? 'bg-[#00FF00]' : status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`} />
      {status}
    </div>
  );
}
