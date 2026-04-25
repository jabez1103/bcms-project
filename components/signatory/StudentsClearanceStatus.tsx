"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, Eye, X, CheckCircle2, AlertCircle,
  MessageSquare, Maximize2, ZoomIn, ZoomOut, RotateCcw,
  ChevronLeft, ChevronRight, GraduationCap, 
  Layers, Hash, Info, CalendarDays, FileDown
} from "lucide-react";
import { SkeletonMobileCard, SkeletonTableRow } from "@/components/ui/Skeleton";
import { downloadClearanceDoc } from "./downloadClearance";

/* ================= TYPES ================= */
type ClearanceStatus = "Cleared" | "Not Cleared";

type SignatoryStatus =
  | "Approved"
  | "Rejected"
  | "Pending"
  | "Not Submitted";
  
type Program = "BSCS" | "BSIT";
type Year = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
type Section = "A" | "B";

interface SubmissionRow {
  id: string;
  studentId: string;
  name: string;
  requirement: string;
  submittedAt: string; // New field for date
  status: ClearanceStatus;
  comment?: string;
  program: Program;
  year: Year;
  section: Section;
  proofImageUrl: string;
  hasSubmission?: boolean;
}

export default function SignatoryTableWithDate() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClearanceStatus | "All">("All");
  const [programFilter, setProgramFilter] = useState<Program | "All">("All");
  const [yearFilter, setYearFilter] = useState<Year | "All">("All");
  const [sectionFilter, setSectionFilter] = useState<Section | "All">("All");

  const [selectedRecord, setSelectedRecord] = useState<SubmissionRow | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  // New state for Review Modal
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  React.useEffect(() => {
    const fetchRows = async () => {
      try {
        const res = await fetch("/api/signatory/student-status");
        const data = await res.json();
        if (data.success) {
          const formatted = data.statuses.map((s: any) => ({
            id: s.id,
            studentId: s.studentId,
            name: s.name,
            requirement: s.requirement,
            submittedAt: s.submittedAt,
            status: s.status,
            hasSubmission: s.hasSubmission,
            comment: s.comment,
            proofImageUrl: s.proofImageUrl,
            program: s.program,
            year: s.year,
            section: s.section
          }));
          setRows(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch student status", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, []);

const toSignatoryStatus = (status: SignatoryStatus): ClearanceStatus => {
  switch (status) {
    case "Approved":
      return "Cleared";
    case "Rejected":
    case "Pending":
    case "Not Submitted":
      return "Not Cleared";
    default:
      return "Not Cleared";
  }
};
  React.useEffect(() => {
    if (selectedRecord) {
      setLoadingProgress(true);
      fetch(`/api/signatory/student-status/${selectedRecord.studentId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setStudentProgress(data.signatories);
          setLoadingProgress(false);
        })
        .catch(() => setLoadingProgress(false));
    } else {
      setStudentProgress([]);
    }
  }, [selectedRecord]);

  const filteredData = useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase()) || row.studentId.includes(search);
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      const matchesProgram = programFilter === "All" || row.program === programFilter;
      const matchesYear = yearFilter === "All" || row.year === yearFilter;
      const matchesSection = sectionFilter === "All" || row.section === sectionFilter;
      return matchesSearch && matchesStatus && matchesProgram && matchesYear && matchesSection;
    });
  }, [rows, search, statusFilter, programFilter, yearFilter, sectionFilter]);

  // Reset to page 1 whenever any filter/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, programFilter, yearFilter, sectionFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownload = () =>
    downloadClearanceDoc(selectedRecord!, studentProgress);



  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 md:p-10 font-sans text-slate-900 dark:text-slate-100 transition-colors">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-[20] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 -mx-6 md:-mx-10 px-6 md:px-10 py-4 mb-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 dark:shadow-none">
              <GraduationCap size={20} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none uppercase">
                Student <span className="text-brand-600">Clearance Status</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Manage student submissions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER & FILTERS --- */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col xl:flex-row gap-6 mb-8 items-start xl:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Clearance Status</h1>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Manage student submissions</p>
            </div>
            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full xl:w-auto">
              {["All", "Cleared", "Not Cleared"].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s as any)}
                  className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by student ID or name..." 
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <FilterGroup icon={<GraduationCap size={16}/>} value={programFilter} onChange={setProgramFilter} options={["All", "BSCS", "BSIT"]} />
              <FilterGroup icon={<Layers size={16}/>} value={yearFilter} onChange={setYearFilter} options={["All", "1st Year", "2nd Year", "3rd Year", "4th Year"]} />
              <FilterGroup icon={<Hash size={16}/>} value={sectionFilter} onChange={setSectionFilter} options={["All", "A", "B"]} />
            </div>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          {/* MOBILE LIST VIEW */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <>
                <SkeletonMobileCard />
                <SkeletonMobileCard />
                <SkeletonMobileCard />
                <SkeletonMobileCard />
              </>
            ) : paginatedData.length === 0 ? (
              <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
                No submissions found
              </div>
            ) : paginatedData.map((row) => (
              <div key={row.id} className="p-6 space-y-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-lg border border-brand-100 dark:border-brand-500/20 shrink-0">
                    {row.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{row.name}</p>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{row.studentId}</p>
                  </div>
                  <ClearancePill status={row.status} />
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-400 uppercase tracking-widest">Classification</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{row.program} • {row.year}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-400 uppercase tracking-widest">Requirement</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300 truncate pl-4">{row.requirement}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-400 uppercase tracking-widest">Submitted</span>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <CalendarDays size={12} className="text-slate-400" />
                      <span className="font-bold">{row.submittedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setSelectedRecord(row)} 
                    className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all active:scale-95 shadow-sm"
                  >
                    View Progress
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Student ID</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Name</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Classification</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {loading ? (
                  <>
                    <SkeletonTableRow cols={5} />
                    <SkeletonTableRow cols={5} />
                    <SkeletonTableRow cols={5} />
                    <SkeletonTableRow cols={5} />
                    <SkeletonTableRow cols={5} />
                  </>
                ) : paginatedData.map((row) => (
                  <tr key={row.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{row.studentId}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-xs border border-brand-100 dark:border-brand-500/20">{row.name.charAt(0)}</div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{row.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.program}</p>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{row.year} • Sec {row.section}</p>
                    </td>
                    <td className="px-8 py-5 text-center"><ClearancePill status={row.status} /></td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => setSelectedRecord(row)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all active:scale-95 shadow-sm">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
               <Info size={14} />
               <p className="text-[10px] font-black uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
            </div>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-30 transition-all"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-30 transition-all"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* --- REVIEW MODAL --- */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col border border-transparent dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start shrink-0 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-[2.5rem]">
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Clearance Progress</p>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{selectedRecord.name}</h2>
                <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5">{selectedRecord.studentId} • {selectedRecord.program}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={loadingProgress || studentProgress.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-brand-200 dark:shadow-none"
                >
                  <FileDown size={14} />
                  Download Soft Copy
                </button>
                <button onClick={() => setSelectedRecord(null)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-full transition-all shadow-sm"><X size={20} /></button>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              {loadingProgress ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="w-8 h-8 border-4 border-brand-200 dark:border-brand-500/30 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin"></div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Progress...</p>
                </div>
              ) : studentProgress.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-slate-500">No clearance data found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentProgress.map((sig, idx) => (
                    <div key={`${sig.role ?? "role"}-${sig.name ?? "name"}-${idx}`} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-xs border border-brand-100 dark:border-brand-500/20">
                          {(sig.role || "U").charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{sig.role || "Unknown Role"}</p>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{sig.name}</p>
                        </div>
                      </div>
                    <SignatoryPill status={sig.status} />            
                      </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0 rounded-b-[2.5rem] flex justify-end">
              <button onClick={() => setSelectedRecord(null)} className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ icon, value, onChange, options }: any) {
    return (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:border-brand-500 transition-all">
            <span className="text-slate-400 dark:text-slate-500">{icon}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-[11px] text-slate-700 dark:text-slate-200 font-black uppercase outline-none cursor-pointer">
                {options.map((opt: string) => <option key={opt} value={opt} className="bg-white dark:bg-slate-900">{opt === "All" ? `All ${opt}` : opt}</option>)}
            </select>
        </div>
    );
}
function ClearancePill({ status }: { status: ClearanceStatus }) {
  const themes: Record<ClearanceStatus, string> = {
    Cleared:
      "bg-emerald-50 text-emerald-600 border-emerald-200",
    "Not Cleared":
      "bg-rose-50 text-rose-600 border-rose-200",
  };

  const dot = {
    Cleared: "bg-emerald-500",
    "Not Cleared": "bg-rose-500",
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${themes[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </div>
  );
}



function SignatoryPill({ status }: { status: SignatoryStatus }) {
  const themes: Record<SignatoryStatus, string> = {
    Approved:
      "bg-emerald-50 text-emerald-600 border-emerald-200",

    Rejected:
      "bg-rose-50 text-rose-600 border-rose-200",

    Pending:
      "bg-amber-50 text-amber-600 border-amber-200",

    "Not Submitted":
      "bg-gray-50 text-gray-600 border-gray-200",
  };

  const dot: Record<SignatoryStatus, string> = {
    Approved: "bg-emerald-500",
    Rejected: "bg-rose-500",
    Pending: "bg-amber-500",
    "Not Submitted": "bg-gray-500",
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${themes[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </div>
  );
}
