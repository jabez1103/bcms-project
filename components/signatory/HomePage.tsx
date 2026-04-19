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
  History,
  LayoutGrid,
  PieChart as PieIcon,
  BarChart3,
  Download,
  GraduationCap
} from "lucide-react";
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
  hasAttachment: boolean;
  remarks: string;
  initials: string;
  color: string;
}

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  { id: "2021-0001", name: "Mariana Alcantara", level: "3rd Year", program: "BSCS", status: "Approved", requirementType: "Lab Return", submissionDate: "2026-04-10", hasAttachment: true, remarks: "All items returned.", initials: "MA", color: "bg-blue-100 text-blue-600" },
  { id: "2022-0412", name: "Rafael Jimenez", level: "1st Year", program: "BS-Math", status: "Pending", requirementType: "Department Fee", submissionDate: "2026-04-15", hasAttachment: false, remarks: "", initials: "RJ", color: "bg-amber-100 text-amber-600" },
  { id: "2021-0882", name: "Kristine Lopez", level: "2nd Year", program: "Education", status: "Rejected", requirementType: "Library Book", submissionDate: "2026-04-12", hasAttachment: true, remarks: "Wrong file uploaded.", initials: "KL", color: "bg-rose-100 text-rose-600" },
  { id: "2023-1102", name: "John Doe", level: "1st Year", program: "BSCS", status: "Pending", requirementType: "Lab Return", submissionDate: "2026-04-16", hasAttachment: true, remarks: "", initials: "JD", color: "bg-amber-100 text-amber-600" },
  { id: "2021-0994", name: "Sarah Smith", level: "3rd Year", program: "BSHM", status: "Approved", requirementType: "Uniform Clearance", submissionDate: "2026-04-08", hasAttachment: true, remarks: "Verified.", initials: "SS", color: "bg-blue-100 text-blue-600" },
  { id: "2020-0551", name: "Leonel Messi", level: "4th Year", program: "BSES", status: "Approved", requirementType: "Lab Return", submissionDate: "2026-04-05", hasAttachment: true, remarks: "Complete.", initials: "LM", color: "bg-blue-100 text-blue-600" },
  { id: "2022-0991", name: "Alice Guo", level: "2nd Year", program: "BSIT", status: "Pending", requirementType: "Lab Return", submissionDate: "2026-04-16", hasAttachment: true, remarks: "", initials: "AG", color: "bg-amber-100 text-amber-600" },
  { id: "2022-1001", name: "Jabez Bautista", level: "4th Year", program: "BSCS", status: "Pending", requirementType: "Capstone Clearance", submissionDate: "2026-04-17", hasAttachment: true, remarks: "Final docs attached.", initials: "JB", color: "bg-violet-100 text-violet-600" },
];

const THEME_COLORS = {
  Approved: "#00FF00", 
  Pending: "#f59e0b", 
  Rejected: "#f43f5e" 
};

/* ================= MAIN DASHBOARD ================= */

export default function SignatoryDashboard() {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [globalLevelFilter, setGlobalLevelFilter] = useState<YearLevel | "All">("All");
  const [viewMode, setViewMode] = useState<ChartView>("pie");
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "All">("All");
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  /* --- PAGINATION STATE --- */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [chartRadius, setChartRadius] = useState({ inner: 60, outer: 85 });

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

  const updateStatus = (id: string, newStatus: SubmissionStatus) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setSelectedSubmission(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* STICKY HEADER COMPONENT */}
      <header className="sticky top-0 z-[20] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-4 sm:px-8 lg:px-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                <ShieldCheck size={20} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none uppercase">
                Signatory <span className="text-blue-600">Portal</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Queue Monitoring</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <History size={14} /> History
            </button>
            <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-900/10 hover:bg-blue-600 transition-all active:scale-95">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-8 sm:px-8 lg:px-12">
        
        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-1">Performance</h3>
                <p className="text-xl font-black">Analytics Overview</p>
              </div>
              <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
                <div className="flex gap-1 mr-2">
                  <button onClick={() => setViewMode("pie")} className={`p-2 rounded-xl transition-all ${viewMode === "pie" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><PieIcon size={18} /></button>
                  <button onClick={() => setViewMode("bar")} className={`p-2 rounded-xl transition-all ${viewMode === "bar" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><BarChart3 size={18} /></button>
                </div>
                <div className="w-[1px] h-6 bg-slate-200 mr-2" />
                <select 
                  className="bg-transparent text-[10px] font-black uppercase pr-4 outline-none cursor-pointer"
                  value={globalLevelFilter}
                  onChange={(e) => setGlobalLevelFilter(e.target.value as any)}
                >
                  <option value="All">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <StatCard label="Pending" value={analyticsData[1].value} color="text-amber-500" bg="bg-amber-50" icon={<Clock size={24} />} />
            <StatCard label="Approved" value={analyticsData[0].value} color="text-[#00FF00]" bg="bg-green-50" icon={<ShieldCheck size={24} />} />
            <StatCard label="Rejected" value={analyticsData[2].value} color="text-rose-500" bg="bg-rose-50" icon={<FileX size={24} />} />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex p-3.5 bg-slate-900 rounded-2xl text-white"><LayoutGrid size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Review Queue</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage student clearances</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              <div className="relative flex-grow sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-blue-500/10 transition-all shadow-inner"
                  placeholder="Search by ID or Name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
              <select 
                className="px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer hover:bg-slate-50 transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Information</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Requirement</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl ${s.color} flex items-center justify-center font-black text-xs shadow-sm`}>{s.initials}</div>
                        <div>
                          <p className="font-black text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{s.name}</p>
                          <p className="text-[10px] font-black text-slate-400 mt-0.5 tracking-tight flex items-center gap-1">
                            <GraduationCap size={12} /> {s.id} • {s.level}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-600">{s.requirementType}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{s.program}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6"><StatusBadge status={s.status} /></td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedSubmission(s)} 
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
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
          <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rows per page</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black outline-none focus:ring-2 ring-blue-500/10 transition-all cursor-pointer shadow-sm"
                >
                  {[5, 10, 20, 50].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
              <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Showing {paginatedData.length} of {filteredData.length} results
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600 shadow-sm active:scale-95"
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
                          : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300'
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
                  className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600 shadow-sm active:scale-95"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* REVIEW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-8 sm:p-10 ${selectedSubmission.color} flex justify-between items-start`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Reviewing Submission</p>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight">{selectedSubmission.name}</h2>
                <p className="text-xs font-bold mt-1 opacity-80">{selectedSubmission.id} • {selectedSubmission.requirementType}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2.5 bg-white/20 hover:bg-white/40 rounded-2xl transition-all"><X size={20}/></button>
            </div>
            <div className="p-8 sm:p-10 space-y-8">
              <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Student Remarks</p>
                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                  {selectedSubmission.remarks ? `"${selectedSubmission.remarks}"` : "No remarks provided by student."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => updateStatus(selectedSubmission.id, "Rejected")} 
                  className="py-4.5 bg-white border-2 border-rose-100 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                >
                  Decline
                </button>
                <button 
                  onClick={() => updateStatus(selectedSubmission.id, "Approved")} 
                  className="py-4.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-blue-600 transition-all active:scale-95"
                >
                  Approve
                </button>
              </div>
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
    <div className="p-6 sm:p-8 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-slate-500 transition-colors">{label}</p>
        <h2 className={`text-4xl sm:text-5xl font-black ${color}`}>{value}</h2>
      </div>
      <div className={`p-4 sm:p-5 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles = {
    Approved: "bg-green-200 text-gree-700 border-green-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Rejected: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase border shadow-sm ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'Approved' ? 'bg-[#00FF00]' : status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`} />
      {status}
    </div>
  );
}