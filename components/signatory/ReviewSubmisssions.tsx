"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, X, CheckSquare, Square, 
  Eye, LayoutGrid, Table as TableIcon, 
  Calendar, MessageSquare, User,
  GraduationCap, Layers, Hash, Bell, ChevronDown
} from "lucide-react";

/* ================= TYPES ================= */
type SubmissionStatus = "Pending" | "Approved" | "Rejected";
type Program = "BSCS" | "BSIT";
type Year = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
type Section = "A" | "B";

interface Student {
  id: string;
  name: string;
  program: Program;
  year: Year;
  section: Section;
  requirement: string;
  status: SubmissionStatus;
  fileUrl: string;
  submittedAt: string;
  studentComment: string;
}

/* ================= MOCK DATA ================= */
const MOCK_STUDENTS: Student[] = Array.from({ length: 6 }, (_, i) => ({
  id: `2022-${1000 + i}`,
  name: i === 0 ? "Jabez Bautista" : `Student User ${i + 1}`,
  program: i % 2 === 0 ? "BSCS" : "BSIT",
  year: "4th Year",
  section: "A",
  requirement: "Laboratory Clearance",
  status: "Pending",
  fileUrl: "https://images.unsplash.com/photo-1606326666490-457569d4486d?q=80&w=2070",
  submittedAt: "APRIL 17, 2026",
  studentComment: i === 0 
    ? "I have already settled my laboratory fees. Please see attached receipt." 
    : "Resubmitting the signed document as requested by the department head."
}));

export default function UltimateClearancePortal() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<Program | "All">("All");

  const filteredData = useMemo(() => {
    return MOCK_STUDENTS.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
    );
  }, [search]);

  const isPageSelected = filteredData.length > 0 && filteredData.every(s => selectedIds.includes(s.id));
  
  const handleSelectPage = () => {
    const pageIds = filteredData.map(s => s.id);
    if (isPageSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      
      {/* SIDEBAR (Visual Placeholder based on screenshot) */}
      <aside className="w-20 hidden md:flex flex-col items-center py-8 border-r border-slate-100 bg-white shrink-0">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-12">
            <div className="w-6 h-6 border-2 border-emerald-600 rounded-md rotate-45 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            </div>
        </div>
        <div className="space-y-8">
            <div className="p-3 text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors"><LayoutGrid size={24} /></div>
            <div className="p-3 text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors"><User size={24} /></div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl cursor-pointer"><TableIcon size={24} /></div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-5xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* TOP NAV */}
        <header className="flex justify-between items-center">
            <div className="flex flex-col">
                <h2 className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase">BISU Clearance</h2>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Management System</span>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Bell size={20} className="text-slate-400" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">2</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-full border border-slate-100 shadow-sm">
                    <img src="https://i.pravatar.cc/150?u=admin" className="w-8 h-8 rounded-full object-cover" alt="Admin" />
                    <ChevronDown size={14} className="text-slate-400" />
                </div>
            </div>
        </header>

        {/* HEADER SECTION */}
        <section className="space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black tracking-tighter text-[#0F172A] uppercase">Clearance Audit</h1>
            <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-[0.25em]">Active Submissions • April 2026</p>
          </div>

          <div className="flex justify-center md:justify-start items-center gap-2 bg-white p-1.5 rounded-3xl border border-slate-100 shadow-sm w-fit mx-auto md:mx-0">
            <button onClick={() => setViewMode("grid")} className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${viewMode === "grid" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400"}`}>
              <LayoutGrid size={14} /> Grid
            </button>
            <button onClick={() => setViewMode("table")} className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${viewMode === "table" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400"}`}>
              <TableIcon size={14} /> Table
            </button>
          </div>
        </section>

        {/* --- SEARCH & SELECT ALL --- */}
        <section className="space-y-4">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-[2rem] text-xs font-bold shadow-sm focus:ring-4 ring-indigo-500/5 transition-all outline-none"
              placeholder="Filter submissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex items-center justify-between">
            <button onClick={handleSelectPage} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-700">
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isPageSelected ? 'bg-slate-900 border-slate-900' : 'border-slate-200'}`}>
                {isPageSelected && <CheckSquare size={14} className="text-white" />}
              </div>
              Select All Page
            </button>
            {selectedIds.length > 0 && (
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">{selectedIds.length} Selected</span>
            )}
          </div>
        </section>

        {/* MAIN LIST (MATCHING SCREENSHOT) */}
        <div className="space-y-6 pb-20">
          {filteredData.map((s) => (
            <div 
              key={s.id} 
              className={`bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden relative group ${
                selectedIds.includes(s.id) ? 'border-indigo-500 ring-8 ring-indigo-50' : 'border-slate-100 shadow-sm'
              }`}
            >
              {/* Card Header Logic */}
              <div className="p-8 md:p-10 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                    {s.submittedAt}
                  </span>
                  <StatusBadge status={s.status} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{s.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {s.program} • {s.year} • {s.requirement}
                  </p>
                </div>

                <div className="py-2">
                  <p className="text-base text-slate-400 italic font-medium leading-relaxed max-w-2xl">
                    "{s.studentComment}"
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedStudent(s)}
                  className="w-full py-5 bg-[#F8FAFC] hover:bg-indigo-600 hover:text-white text-slate-400 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300"
                >
                  View Submission
                </button>
              </div>

              {/* Individual Selection Dot */}
              <button 
                onClick={() => toggleSelect(s.id)}
                className={`absolute top-10 right-10 w-4 h-4 rounded-full border-2 transition-all ${selectedIds.includes(s.id) ? 'bg-indigo-600 border-indigo-600' : 'border-transparent opacity-0 group-hover:opacity-100 group-hover:border-slate-200'}`}
              />
            </div>
          ))}
        </div>
      </main>

      {/* INSPECTION MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black">JB</div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">{selectedStudent.name}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{selectedStudent.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-4 bg-slate-50 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col md:flex-row gap-10">
              <div className="flex-1">
                <img src={selectedStudent.fileUrl} className="w-full rounded-3xl shadow-lg border-8 border-slate-50" alt="Preview" />
              </div>
              <div className="w-full md:w-80 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Student Note</h4>
                  <p className="text-sm font-medium text-slate-600 italic leading-relaxed">"{selectedStudent.studentComment}"</p>
                </div>
                <div className="pt-8 border-t border-slate-50 grid grid-cols-1 gap-3">
                    <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Approve Document</button>
                    <button className="w-full py-5 bg-white text-rose-500 border border-rose-100 rounded-3xl text-[10px] font-black uppercase tracking-widest">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles = {
    Approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-[#EEF2FF] text-[#6366F1] border-[#E0E7FF]",
    Rejected: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}