"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, X, CheckSquare, 
  Eye, LayoutGrid, Table as TableIcon, 
  Calendar, MessageSquare, User,
  GraduationCap, Layers, Hash, Bell, ChevronDown,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { SkeletonMobileCard, SkeletonTableRow } from "@/components/ui/Skeleton";

/* ================= TYPES ================= */
type SubmissionStatus = "Pending" | "Approved" | "Rejected";
type Program = string;
type Year = string;
type Section = string;

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
  signatoryComment?: string | null;
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
  const [levelFilter, setLevelFilter] = useState<Year | "All">("All");
  const [sectionFilter, setSectionFilter] = useState<Section | "All">("All");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "All">("All");

  const [students, setStudents] = useState<Student[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<"Approve" | "Reject" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDean, setIsDean] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  /* --- PAGINATION --- */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPagePartiallySelected, setIsPagePartiallySelected] = useState(false);

  React.useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/signatory/submissions");
        const data = await res.json();
        if (data.success) {
            setStudents(data.submissions);
            setIsDean(data.isDean || false);
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
    if (selectedStudent) {
      setFeedback(selectedStudent.signatoryComment?.trim() || "");
      return;
    }
    setFeedback("");
  }, [selectedStudent]);

  const filteredData = useMemo(() => {
    const normalizedSearch = String(search ?? "").toLowerCase().trim();
    return students.filter(s => {
      const matchesProgram = programFilter === "All" || String(s.program ?? "") === programFilter;
      const matchesLevel = levelFilter === "All" || String(s.year ?? "") === levelFilter;
      const matchesSection = sectionFilter === "All" || String(s.section ?? "") === sectionFilter;
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      const matchesMeta = matchesProgram && matchesLevel && matchesSection && matchesStatus;

      if (!normalizedSearch) {
        return matchesMeta;
      }
      const normalizedName = String(s.name ?? "").toLowerCase();
      const normalizedId = String(s.id ?? "").toLowerCase();
      const matchesSearch =
        normalizedName.includes(normalizedSearch) || normalizedId.includes(normalizedSearch);
      return matchesSearch && matchesMeta;
    });
  }, [search, statusFilter, programFilter, levelFilter, sectionFilter, students]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, programFilter, levelFilter, sectionFilter]);

  const programOptions = useMemo(
    () =>
      Array.from(new Set(students.map((s) => String(s.program ?? "").trim()).filter(Boolean))).sort(),
    [students]
  );
  const levelOptions = useMemo(
    () =>
      Array.from(new Set(students.map((s) => String(s.year ?? "").trim()).filter(Boolean))).sort(),
    [students]
  );
  const sectionOptions = useMemo(
    () =>
      Array.from(new Set(students.map((s) => String(s.section ?? "").trim()).filter(Boolean))).sort(),
    [students]
  );

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
            setStudents(prev => prev.map(s => 
              selectedIds.includes(String(s.id)) ? { ...s, status: newStatus } : s
            ));
        }
    } catch (error) {
        console.error("Failed to update status", error);
    }
    
    setSelectedIds([]);
    setFeedback("");
    setShowBulkModal(null);
  };

  const pageIds = useMemo(
    () => paginatedData.map((s) => String(s.id)),
    [paginatedData]
  );

  const isPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  useEffect(() => {
    const selectedOnPageCount = pageIds.filter((id) => selectedIds.includes(id)).length;
    setIsPagePartiallySelected(
      selectedOnPageCount > 0 && selectedOnPageCount < pageIds.length
    );
  }, [pageIds, selectedIds]);
  
  const handleSelectPage = () => {
    if (isPageSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelect = (id: string | number) => {
    const normalizedId = String(id);
    setSelectedIds(prev => prev.includes(normalizedId) ? prev.filter(i => i !== normalizedId) : [...prev, normalizedId]);
  };

  return (
    <div className="w-full h-full px-3 sm:px-4 lg:px-6 font-sans text-slate-900 dark:text-slate-100">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-[20] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 px-2 py-3 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 dark:bg-slate-800 rounded-lg sm:rounded-xl items-center justify-center text-white shadow-lg shadow-slate-200 dark:shadow-none">
              <Eye size={16} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-[13px] sm:text-2xl font-black tracking-tight leading-none uppercase">
                Review <span className="text-brand-600">Submissions</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <p className="text-[8px] font-black uppercase tracking-[0.17em]">Clearance Audit</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-0 py-4 md:py-8 space-y-8">
        
        {/* SEARCH & SELECT ALL */}
        <section className="space-y-4">
          <div className="text-center md:text-left">
            <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.25em]">Active Submissions • April 2026</p>
          </div>
        </section>

        {/* --- SEARCH & SELECT ALL --- */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={16} />
              <input 
                className="w-full pl-11 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-5 bg-white dark:bg-slate-900 border-none rounded-xl sm:rounded-[2rem] text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm focus:ring-4 ring-brand-500/5 transition-all outline-none"
                placeholder="Filter submissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  // Guard against accidental parent form submission/navigation.
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              />
            </div>
            <div className="hidden sm:flex bg-white dark:bg-slate-900 p-1.5 sm:p-2 rounded-xl sm:rounded-[2rem] shadow-sm shrink-0 items-center">
              <button onClick={() => setViewMode("grid")} className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold transition-all ${viewMode === "grid" ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400" : "text-slate-400 hover:text-slate-600"}`}>
                <LayoutGrid size={16} /> <span className="hidden sm:inline">Grid</span>
              </button>
              <button onClick={() => setViewMode("table")} className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold transition-all ${viewMode === "table" ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400" : "text-slate-400 hover:text-slate-600"}`}>
                <TableIcon size={16} /> <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {!isDean && (
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="h-10 sm:h-11 rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] px-3 outline-none"
              >
                <option value="All">All Programs</option>
                {programOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-10 sm:h-11 rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] px-3 outline-none"
            >
              <option value="All">All Levels</option>
              {levelOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="h-10 sm:h-11 rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] px-3 outline-none"
            >
              <option value="All">All Sections</option>
              {sectionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* MOBILE QUICK CONTROLS */}
          <div className="grid grid-cols-4 gap-2 sm:hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`h-10 rounded-lg border flex items-center justify-center transition-all ${
                viewMode === "grid"
                  ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-500/30"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`h-10 rounded-lg border flex items-center justify-center transition-all ${
                viewMode === "table"
                  ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-500/30"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              aria-label="Table view"
            >
              <TableIcon size={15} />
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | "All")}
              className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-[0.1em] px-2 outline-none"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              onClick={handleSelectPage}
              className={`h-10 rounded-lg border text-[9px] font-black uppercase tracking-[0.1em] transition-all ${
                isPageSelected || isPagePartiallySelected
                  ? "bg-slate-900 dark:bg-brand-600 text-white border-slate-900 dark:border-brand-600"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {isPageSelected ? "Unselect All" : "Select All"}
            </button>
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="hidden sm:flex flex-wrap gap-1.5 sm:gap-2">
            {(["All", "Pending", "Approved", "Rejected"] as const).map((s) => {
              const count = s === "All" ? students.length : students.filter(x => x.status === s).length;
              const active = statusFilter === s;
              const colors: Record<string, string> = {
                All:      active ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md" : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400",
                Pending:  active ? "bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-none" : "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:border-amber-400",
                Approved: active ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none" : "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400",
                Rejected: active ? "bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none" : "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:border-rose-400",
              };
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-widest transition-all active:scale-95 ${colors[s]}`}
                >
                  {s}
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black ${
                    active ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-slate-50 dark:border-slate-800 shadow-sm flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:justify-between sticky top-0 z-10">
            <button onClick={handleSelectPage} className="flex items-center gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-widest text-slate-700 dark:text-slate-300">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all ${isPageSelected || isPagePartiallySelected ? 'bg-slate-900 dark:bg-brand-600 border-slate-900 dark:border-brand-600' : 'border-slate-200 dark:border-slate-700'}`}>
                {isPageSelected && <CheckSquare size={14} className="text-white" />}
                {!isPageSelected && isPagePartiallySelected && (
                  <div className="w-2.5 h-0.5 rounded bg-white" />
                )}
              </div>
              {isPageSelected ? "Unselect Page" : "Select All Page"}
            </button>
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <span className="text-[9px] sm:text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full">{selectedIds.length} Selected</span>
                  <button onClick={() => setShowBulkModal("Approve")} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-widest transition-all active:scale-95">Approve</button>
                  <button onClick={() => setShowBulkModal("Reject")} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-widest transition-all active:scale-95">Reject</button>
                </div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="sm:hidden flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-2.5">
              <span className="text-[9px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-full">{selectedIds.length} Selected</span>
              <button onClick={() => setShowBulkModal("Approve")} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.12em] transition-all active:scale-95">Approve</button>
              <button onClick={() => setShowBulkModal("Reject")} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.12em] transition-all active:scale-95">Reject</button>
            </div>
          )}
        </section>

        {/* MAIN LIST — single card wraps both views + pagination */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">

          {/* GRID VIEW */}
          <div className={viewMode === "grid" ? "p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "hidden"}>
            {loading ? (
              <>
                <SkeletonMobileCard />
                <SkeletonMobileCard />
                <SkeletonMobileCard />
              </>
            ) : paginatedData.map((s) => (
              <div 
                key={s.id} 
                className={`bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 overflow-hidden relative group flex flex-col ${
                  selectedIds.includes(String(s.id)) ? 'border-brand-500 ring-4 ring-brand-50 dark:ring-brand-500/10' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg'
                }`}
              >
                <div className="p-4 sm:p-5 md:p-8 space-y-3 sm:space-y-4 md:space-y-5 flex-1">
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
                     <div className="flex items-center justify-between gap-2">
                       <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{s.requirement}</p>
                       {s.studentComment && (
                         <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-[9px] font-black text-brand-500 uppercase shrink-0">
                           <MessageSquare size={9} /> Note
                         </span>
                       )}
                     </div>
                     <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed line-clamp-3">
                       {s.studentComment ? `"${s.studentComment}"` : <span className="not-italic text-slate-300 dark:text-slate-600">No comment added</span>}
                     </p>
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
                  <button 
                    onClick={() => setSelectedStudent(s)}
                    className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Review
                  </button>
                </div>

                <button 
                  onClick={() => toggleSelect(s.id)}
                  className={`absolute top-6 right-6 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${selectedIds.includes(String(s.id)) ? 'bg-brand-600 border-brand-600' : 'border-slate-300 dark:border-slate-600 opacity-0 group-hover:opacity-100 hover:border-brand-400'}`}
                >
                  {selectedIds.includes(String(s.id)) && <CheckSquare size={12} className="text-white" />}
                </button>
              </div>
            ))}
          </div>

          {/* MOBILE TABLE VIEW */}
          <div className={viewMode === "table" ? "block xl:hidden border-t border-slate-100 dark:border-slate-800" : "hidden"}>
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                     <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.12em]">Student</th>
                     <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.12em] text-center">Status</th>
                     <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.12em] text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                   {loading ? (
                     <>
                       <SkeletonTableRow cols={3} />
                       <SkeletonTableRow cols={3} />
                       <SkeletonTableRow cols={3} />
                     </>
                   ) : paginatedData.length === 0 ? (
                     <tr>
                       <td colSpan={3} className="px-3 py-16 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                         Table is empty.
                       </td>
                     </tr>
                   ) : paginatedData.map((s) => (
                     <tr key={s.id} className={`transition-colors ${selectedIds.includes(String(s.id)) ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                       <td className="px-3 py-3 align-top">
                         <div className="flex items-start gap-2.5">
                           <input
                             type="checkbox"
                             checked={selectedIds.includes(String(s.id))}
                             onChange={() => toggleSelect(s.id)}
                             className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-brand-600 focus:ring-brand-500 dark:focus:ring-brand-400 cursor-pointer"
                           />
                           <div className="min-w-0">
                             <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{s.name}</p>
                             <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5 truncate">{s.id} • {s.program} • {s.year}</p>
                             <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate">{s.requirement}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-3 py-3 text-center align-top"><div className="inline-flex"><StatusBadge status={s.status} /></div></td>
                       <td className="px-3 py-3 text-right align-top">
                         <button
                           onClick={() => setSelectedStudent(s)}
                           className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[9px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all active:scale-95"
                         >
                           Review
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
          </div>

          {/* TABLE VIEW */}
          <div className={viewMode === "table" ? "hidden xl:block overflow-x-auto border-t border-slate-100 dark:border-slate-800" : "hidden"}>
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
                   ) : paginatedData.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="px-6 py-16 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                         Table is empty.
                       </td>
                     </tr>
                   ) : paginatedData.map((s) => (
                     <tr key={s.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.includes(String(s.id)) ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                       <td className="px-6 py-5">
                         <div className="flex items-center gap-4">
                           <input 
                             type="checkbox" 
                             checked={selectedIds.includes(String(s.id))}
                             onChange={() => toggleSelect(s.id)}
                             className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-brand-600 focus:ring-brand-500 dark:focus:ring-brand-400 cursor-pointer"
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
                           className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all active:scale-95"
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
          <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Rows</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 text-[11px] font-black outline-none cursor-pointer shadow-sm"
                >
                  {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {paginatedData.length} of {filteredData.length} results
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white dark:hover:bg-brand-600 transition-all text-slate-600 dark:text-slate-400 shadow-sm active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1 mx-1">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(currentPage - p) > 1) {
                    if (p === 2 || p === totalPages - 1) return <span key={i} className="px-2 text-slate-300 dark:text-slate-600 font-black self-center">···</span>;
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                        currentPage === p
                          ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-lg shadow-slate-900/20'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white dark:hover:bg-brand-600 transition-all text-slate-600 dark:text-slate-400 shadow-sm active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
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
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 font-black">JB</div>
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
                  {selectedStudent.studentComment ? (
                    <div className="bg-brand-50 dark:bg-brand-500/10 rounded-2xl p-4 border border-brand-100 dark:border-brand-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={13} className="text-brand-500 shrink-0" />
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Comment from Student</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed">
                        "{selectedStudent.studentComment}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">No comment was added by the student.</p>
                  )}
                </div>
                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-1 gap-3">
                    <button onClick={async () => {
                        await fetch("/api/signatory/submissions/review", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              submissionIds: [selectedStudent.id],
                              status: "approved",
                              feedback,
                            }),
                        });
                        setStudents(prev =>
                          prev.map(s =>
                            s.id === selectedStudent.id
                              ? { ...s, status: "Approved", signatoryComment: feedback.trim() || null }
                              : s
                          )
                        );
                        setFeedback("");
                        setSelectedStudent(null);
                    }} className="w-full py-5 bg-brand-600 dark:bg-brand-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-100 dark:shadow-none">Approve Document</button>
                    <button onClick={async () => {
                        await fetch("/api/signatory/submissions/review", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              submissionIds: [selectedStudent.id],
                              status: "rejected",
                              feedback,
                            }),
                        });
                        setStudents(prev =>
                          prev.map(s =>
                            s.id === selectedStudent.id
                              ? { ...s, status: "Rejected", signatoryComment: feedback.trim() || null }
                              : s
                          )
                        );
                        setFeedback("");
                        setSelectedStudent(null);
                    }} className="w-full py-5 bg-white dark:bg-slate-900 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 rounded-3xl text-[10px] font-black uppercase tracking-widest">Reject</button>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {selectedStudent.signatoryComment?.trim() && (
                    <div className="mb-3 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                        Existing Feedback
                      </p>
                      <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                        {selectedStudent.signatoryComment}
                      </p>
                    </div>
                  )}
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

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles = {
    Approved: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
    Pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
    Rejected: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
  };
  return (
    <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}
