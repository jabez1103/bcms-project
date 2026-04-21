"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, X, CheckSquare, Square, 
  Eye, LayoutGrid, Table as TableIcon, 
  Calendar, MessageSquare, User,
  GraduationCap, Layers, Hash, Bell, ChevronDown
} from "lucide-react";
import { SkeletonMobileCard, SkeletonTableRow } from "@/components/ui/Skeleton";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<Program | "All">("All");

  const [students, setStudents] = useState<Student[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<"Approve" | "Reject" | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  React.useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/signatory/submissions");
        const data = await res.json();
        if (data.success) {
            setStudents(data.submissions);
        }
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const filteredData = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
    );
  }, [search, students]);

  const handleBulkAction = async () => {
    if (!showBulkModal) return;
    const newStatus = showBulkModal === "Approve" ? "Approved" : "Rejected";
    
    try {
        const res = await fetch("/api/signatory/submissions/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionIds: selectedIds, status: showBulkModal.toLowerCase() }),
        });
        const data = await res.json();
        if (data.success) {
            setStudents(prev => prev.map(s => 
              selectedIds.includes(s.id) ? { ...s, status: newStatus } : s
            ));
        }
    } catch (error) {
        console.error("Failed to update status", error);
    }
    
    setSelectedIds([]);
    setShowBulkModal(null);
  };

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
    <div className="w-full h-full font-sans text-slate-900 dark:text-slate-100">
      
      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <section className="space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black tracking-tighter text-[#0F172A] dark:text-slate-100 uppercase">Clearance Audit</h1>
            <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.25em]">Active Submissions • April 2026</p>
          </div>
        </section>

        {/* --- SEARCH & SELECT ALL --- */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border-none rounded-[2rem] text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm focus:ring-4 ring-indigo-500/5 transition-all outline-none"
                placeholder="Filter submissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-sm shrink-0 items-center">
              <button onClick={() => setViewMode("grid")} className={`px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all ${viewMode === "grid" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600"}`}>
                <LayoutGrid size={16} /> <span className="hidden sm:inline">Grid</span>
              </button>
              <button onClick={() => setViewMode("table")} className={`px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all ${viewMode === "table" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600"}`}>
                <TableIcon size={16} /> <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-50 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <button onClick={handleSelectPage} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isPageSelected ? 'bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}>
                {isPageSelected && <CheckSquare size={14} className="text-white" />}
              </div>
              Select All Page
            </button>
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full">{selectedIds.length} Selected</span>
                  <button onClick={() => setShowBulkModal("Approve")} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Approve</button>
                  <button onClick={() => setShowBulkModal("Reject")} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Reject</button>
                </div>
            )}
          </div>
        </section>

        {/* MAIN LIST */}
        <div className="pb-20">
          {/* GRID VIEW */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "hidden"}>
            {loading ? (
              <>
                <SkeletonMobileCard />
                <SkeletonMobileCard />
                <SkeletonMobileCard />
              </>
            ) : filteredData.map((s) => (
              <div 
                key={s.id} 
                className={`bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 overflow-hidden relative group flex flex-col ${
                  selectedIds.includes(s.id) ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg'
                }`}
              >
                <div className="p-6 md:p-8 space-y-5 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">{s.name}</h3>
                       <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                         {s.program} • {s.year}
                       </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-2">
                     <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{s.requirement}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed line-clamp-3">
                       "{s.studentComment}"
                     </p>
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
                  <button 
                    onClick={() => setSelectedStudent(s)}
                    className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Review
                  </button>
                </div>

                <button 
                  onClick={() => toggleSelect(s.id)}
                  className={`absolute top-6 right-6 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${selectedIds.includes(s.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 opacity-0 group-hover:opacity-100 hover:border-indigo-400'}`}
                >
                  {selectedIds.includes(s.id) && <CheckSquare size={12} className="text-white" />}
                </button>
              </div>
            ))}
          </div>

          {/* TABLE VIEW */}
          <div className={viewMode === "table" ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm" : "hidden"}>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead>
                   <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                     <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Student</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Course/Year</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Requirement</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center">Status</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">Action</th>
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
                   ) : filteredData.map((s) => (
                     <tr key={s.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.includes(s.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                       <td className="px-6 py-5">
                         <div className="flex items-center gap-4">
                           <input 
                             type="checkbox" 
                             checked={selectedIds.includes(s.id)}
                             onChange={() => toggleSelect(s.id)}
                             className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                           />
                           <div>
                             <p className="font-bold text-slate-900 dark:text-slate-100">{s.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.id}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-5">
                          <p className="text-sm font-black text-slate-700 dark:text-slate-300">{s.program}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{s.year} • Sec {s.section}</p>
                       </td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-slate-300">{s.requirement}</td>
                       <td className="px-6 py-5 text-center"><StatusBadge status={s.status} /></td>
                       <td className="px-6 py-5 text-right">
                         <button 
                           onClick={() => setSelectedStudent(s)} 
                           className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
                         >
                           Review
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </main>

      {/* INSPECTION MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">JB</div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{selectedStudent.name}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{selectedStudent.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col md:flex-row gap-10">
              <div className="flex-1">
                <img src={selectedStudent.fileUrl} className="w-full rounded-3xl shadow-lg border-8 border-slate-50 dark:border-slate-800" alt="Preview" />
              </div>
              <div className="w-full md:w-80 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">Student Note</h4>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">"{selectedStudent.studentComment}"</p>
                </div>
                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-1 gap-3">
                    <button onClick={async () => {
                        await fetch("/api/signatory/submissions/review", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ submissionIds: [selectedStudent.id], status: "approved" }),
                        });
                        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, status: "Approved" } : s));
                        setSelectedStudent(null);
                    }} className="w-full py-5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none">Approve Document</button>
                    <button onClick={async () => {
                        await fetch("/api/signatory/submissions/review", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ submissionIds: [selectedStudent.id], status: "rejected" }),
                        });
                        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, status: "Rejected" } : s));
                        setSelectedStudent(null);
                    }} className="w-full py-5 bg-white dark:bg-slate-900 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 rounded-3xl text-[10px] font-black uppercase tracking-widest">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTION MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6 border border-transparent dark:border-slate-800">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${showBulkModal === "Approve" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"}`}>
              {showBulkModal === "Approve" ? <CheckSquare size={32} /> : <X size={32} />}
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Confirm {showBulkModal}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">Are you sure you want to {showBulkModal.toLowerCase()} <strong>{selectedIds.length}</strong> selected submissions? This action cannot be undone.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => setShowBulkModal(null)} className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleBulkAction} className={`py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95 ${showBulkModal === "Approve" ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600" : "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600"}`}>Yes, {showBulkModal}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles = {
    Approved: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
    Pending: "bg-[#EEF2FF] dark:bg-indigo-500/10 text-[#6366F1] dark:text-indigo-400 border-[#E0E7FF] dark:border-indigo-500/20",
    Rejected: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
  };
  return (
    <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}