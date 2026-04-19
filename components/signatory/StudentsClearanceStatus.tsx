"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, Eye, X, CheckCircle2, AlertCircle,
  MessageSquare, Maximize2, ZoomIn, ZoomOut, RotateCcw,
  ChevronLeft, ChevronRight, GraduationCap, 
  Layers, Hash, Info, CalendarDays
} from "lucide-react";

/* ================= TYPES ================= */
type Status = "Pending" | "Approved" | "Rejected";
type Program = "BSCS" | "BSIT";
type Year = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
type Section = "A" | "B";

interface SubmissionRow {
  id: string;
  studentId: string;
  name: string;
  requirement: string;
  submittedAt: string; // New field for date
  status: Status;
  comment?: string;
  program: Program;
  year: Year;
  section: Section;
  proofImageUrl: string;
}

/* ================= MOCK DATA ================= */
const MOCK_ROWS: SubmissionRow[] = [
  { id: "1", studentId: "2022-0001", name: "Jabez Bautista", requirement: "Laboratory Clearance", submittedAt: "Apr 17, 2026", status: "Pending", comment: "Returned all lab equipment.", program: "BSCS", year: "3rd Year", section: "A", proofImageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070" },
  { id: "2", studentId: "2022-0045", name: "Maria Clara", requirement: "Library Form", submittedAt: "Apr 15, 2026", status: "Approved", program: "BSIT", year: "3rd Year", section: "B", proofImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070" },
  { id: "3", studentId: "2023-0112", name: "Juan Dela Cruz", requirement: "Departmental Fee", submittedAt: "Apr 14, 2026", status: "Rejected", program: "BSCS", year: "2nd Year", section: "A", proofImageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011" },
  { id: "4", studentId: "2024-0089", name: "Pedro Penduko", requirement: "P.E. Uniform", submittedAt: "Apr 13, 2026", status: "Pending", program: "BSIT", year: "1st Year", section: "A", proofImageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070" },
  { id: "5", studentId: "2021-0992", name: "Leonor Rivera", requirement: "Registrar Form", submittedAt: "Apr 10, 2026", status: "Approved", program: "BSCS", year: "4th Year", section: "B", proofImageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070" },
  { id: "6", studentId: "2022-0501", name: "Basilio Santos", requirement: "Laboratory Clearance", submittedAt: "Apr 08, 2026", status: "Pending", program: "BSCS", year: "3rd Year", section: "A", proofImageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080" },
];

export default function SignatoryTableWithDate() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [programFilter, setProgramFilter] = useState<Program | "All">("All");
  const [yearFilter, setYearFilter] = useState<Year | "All">("All");
  const [sectionFilter, setSectionFilter] = useState<Section | "All">("All");

  const [selectedRecord, setSelectedRecord] = useState<SubmissionRow | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = useMemo(() => {
    return MOCK_ROWS.filter(row => {
      const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase()) || row.studentId.includes(search);
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      const matchesProgram = programFilter === "All" || row.program === programFilter;
      const matchesYear = yearFilter === "All" || row.year === yearFilter;
      const matchesSection = sectionFilter === "All" || row.section === sectionFilter;
      return matchesSearch && matchesStatus && matchesProgram && matchesYear && matchesSection;
    });
  }, [search, statusFilter, programFilter, yearFilter, sectionFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- TOP FILTERS --- */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-violet-100 transition-all"
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

          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <div className="flex gap-2">
              {["All", "Pending", "Approved", "Rejected"].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s as any)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${statusFilter === s ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Student Information</th>
                  <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Classification</th>
                  <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Requirement</th>
                  <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Date Submitted</th>
                  <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                  <th className="px-10 py-6 text-right text-[11px] font-black uppercase text-slate-400 tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((row) => (
                  <tr key={row.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">{row.name.charAt(0)}</div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{row.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-slate-700">{row.program}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{row.year} • Sec {row.section}</p>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{row.requirement}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CalendarDays size={14} className="text-slate-300" />
                        <span className="text-[11px] font-bold uppercase">{row.submittedAt}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center"><StatusPill status={row.status} /></td>
                    <td className="px-10 py-6 text-right">
                      <button onClick={() => setSelectedRecord(row)} className="px-5 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-violet-600 hover:text-violet-600 transition-all active:scale-95">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
               <Info size={14} />
               <p className="text-[10px] font-black uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
            </div>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:text-violet-600 disabled:opacity-20 transition-all"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:text-violet-600 disabled:opacity-20 transition-all"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* --- REVIEW MODAL --- */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-7xl h-full md:h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20">
            <div className={`relative bg-slate-200 overflow-hidden transition-all duration-500 ${isFullscreen ? 'md:w-full' : 'md:w-2/3'}`}>
              <div className="absolute top-8 left-8 z-20 flex gap-2">
                <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 4))} className="p-3 bg-white/90 rounded-2xl shadow-xl"><ZoomIn size={20}/></button>
                <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))} className="p-3 bg-white/90 rounded-2xl shadow-xl"><ZoomOut size={20}/></button>
                <button onClick={() => setZoomLevel(1)} className="p-3 bg-white/90 rounded-2xl shadow-xl"><RotateCcw size={20}/></button>
              </div>
              <div className="absolute top-8 right-8 z-20">
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Maximize2 size={18}/> {isFullscreen ? "Restore" : "Full View"}
                </button>
              </div>
              <div className="w-full h-full flex items-center justify-center p-10 overflow-auto no-scrollbar">
                <img src={selectedRecord.proofImageUrl} style={{ transform: `scale(${zoomLevel})` }} className="max-w-full rounded-2xl shadow-2xl border-4 border-white origin-center transition-transform duration-200" alt="Proof" />
              </div>
            </div>

            {!isFullscreen && (
               <div className="flex-1 flex flex-col bg-white border-l border-slate-100">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-0.5">{selectedRecord.name}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedRecord.studentId} • {selectedRecord.program}</p>
                   </div>
                   <button onClick={() => setSelectedRecord(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
                </div>
                <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] relative">
                        <MessageSquare size={14} className="text-slate-300 absolute -top-1 -left-1" />
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Student's Remarks</label>
                        <p className="text-sm text-slate-600 leading-relaxed italic font-bold">"{selectedRecord.comment || "No specific remarks provided."}"</p>
                    </div>
                    <div className="space-y-4 text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-600 rounded-full">
                            <CalendarDays size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Submitted on {selectedRecord.submittedAt}</span>
                        </div>
                        <textarea placeholder="Reason for rejection or internal confirmation note..." className="w-full h-32 p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-medium outline-none focus:ring-4 ring-violet-500/5 transition-all resize-none" />
                    </div>
                </div>
                <div className="p-8 border-t border-slate-50 bg-slate-50/30 grid grid-cols-2 gap-4 shrink-0">
                  <button className="flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"><AlertCircle size={16} /> Reject</button>
                  <button className="flex items-center justify-center gap-3 py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-200 hover:bg-emerald-600 active:scale-95 transition-all"><CheckCircle2 size={16} /> Approve</button>
                </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ icon, value, onChange, options }: any) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-violet-500">{icon}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-[11px] font-black uppercase outline-none cursor-pointer">
                {options.map((opt: string) => <option key={opt} value={opt}>{opt === "All" ? `All ${opt}` : opt}</option>)}
            </select>
        </div>
    );
}

function StatusPill({ status }: { status: Status }) {
  const themes = { Pending: "bg-amber-50 text-amber-700 border-amber-100", Approved: "bg-emerald-50 text-emerald-700 border-emerald-100", Rejected: "bg-rose-50 text-rose-700 border-rose-100" };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${themes[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Pending' ? 'bg-amber-500 animate-pulse' : status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {status}
    </div>
  );
}