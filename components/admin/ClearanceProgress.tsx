"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { SkeletonStatCard, SkeletonProgressRow, SkeletonMobileCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { BarChart3, FileDown, X } from "lucide-react";

/* ================= TYPES ================= */

type StudentStatus = "Completed" | "Pending" | "Incomplete";

interface Student {
  id: number;
  name: string;
  email?: string;
  program: string;
  year_level: number;
  section?: string;
  status: "Cleared" | "Not Cleared";
  approved: number;
  rejected?: number;
  pending?: number;
  total: number;
}

interface SignatoryProgress {
  signatory_id: number;
  signatory_name: string;
  department: string;
  approved: number;
  rejected: number;
  pending: number;
  total_reviews: number;
}

interface RequirementDetail {
  requirementId: number;
  requirementName: string;
  department: string;
  signatoryName: string;
  status: string;
}

const YEAR_LABELS: Record<number, string> = {
  1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year"
};

const PROGRAMS = ["BSIT", "BSCS", "BSES", "BEED", "BEEDMATH", "BTLED", "HM"];
const SECTION_OPTIONS = ["All Sections", "A"];

/* ================= COMPONENT ================= */

export default function ClearanceProgress() {
  const [students, setStudents] = useState<Student[]>([]);
  const [signatories, setSignatories] = useState<SignatoryProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    program: "All Programs",
    yearLevel: "All Years",
    section: "All Sections",
    role: "Student",
    department: "All Departments",
  });
  const [studentDetails, setStudentDetails] = useState<RequirementDetail[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  /* ── FETCH ── */
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/clearance-progress");
      const data = await res.json();
      if (data.success) {
        setStudents(data.students ?? []);
        setSignatories(data.signatories ?? []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  /* ── COMPUTE STATUS & PROGRESS ── */
  function getStudentStatus(s: Student): StudentStatus {
    if (s.total === 0) return "Incomplete";
    if (s.approved === s.total) return "Completed";
    if (s.approved > 0) return "Pending";
    return "Incomplete";
  }

  function getProgress(s: Student): number {
    if (!s.total) return 0;
    return Math.round((s.approved / s.total) * 100);
  }

  /* ── FILTER ── */
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchProgram = filters.program === "All Programs" || s.program === filters.program;
      const matchYear = filters.yearLevel === "All Years" || YEAR_LABELS[s.year_level] === filters.yearLevel;
      const matchSection = filters.section === "All Sections" || (s.section ?? "A") === filters.section;
      return matchProgram && matchYear && matchSection;
    });
  }, [students, filters.program, filters.yearLevel, filters.section]);

  const departmentOptions = useMemo(() => {
    const set = new Set(signatories.map((s) => s.department).filter(Boolean));
    return ["All Departments", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [signatories]);

  const filteredSignatories = useMemo(() => {
    return signatories.filter((s) => {
      if (filters.department === "All Departments") return true;
      return s.department === filters.department;
    });
  }, [signatories, filters.department]);

  useEffect(() => { setCurrentPage(1); }, [filters]);

  /* ── STATS ── */
  const stats = useMemo(() => {
    const studentMode = filters.role === "Student";
    const activeRows = studentMode ? filteredStudents : filteredSignatories;
    const completed  = studentMode
      ? filteredStudents.filter(s => getStudentStatus(s) === "Completed").length
      : filteredSignatories.filter((s) => s.approved > 0 && s.pending === 0 && s.rejected === 0).length;
    const pending    = studentMode
      ? filteredStudents.filter(s => getStudentStatus(s) === "Pending").length
      : filteredSignatories.filter((s) => s.pending > 0).length;
    const incomplete = studentMode
      ? filteredStudents.filter(s => getStudentStatus(s) === "Incomplete").length
      : filteredSignatories.filter((s) => s.approved === 0 && s.pending === 0 && s.rejected > 0).length;
    return [
      { label: studentMode ? "Total Students" : "Total Signatories", value: activeRows.length, icon: "👥", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      { label: "Completed",       value: completed,               icon: "✅", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
      { label: "Pending Review",  value: pending,                 icon: "⏳", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      { label: "Incomplete",      value: incomplete,              icon: "❌", color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    ];
  }, [filteredStudents, filteredSignatories, filters.role]);

  /* ── PAGINATION ── */
  const activeRows = filters.role === "Student" ? filteredStudents : filteredSignatories;
  const totalPages = Math.ceil(activeRows.length / itemsPerPage);
  const paginated = activeRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openStudentDetails = async (student: Student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/clearance-progress/student/${student.id}`, { cache: "no-store" });
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

  const exportAnalytics = () => {
    const safeRole = filters.role.toLowerCase();
    const dateStamp = new Date().toISOString().slice(0, 10);

    if (filters.role === "Signatory") {
      const csv = [
        ["Signatory ID", "Signatory Name", "Department", "Approved", "Pending", "Rejected", "Total Reviews"],
        ...filteredSignatories.map((s) => [
          s.signatory_id,
          s.signatory_name,
          s.department,
          s.approved,
          s.pending,
          s.rejected,
          s.total_reviews,
        ]),
      ]
        .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clearance_progress_${safeRole}_${dateStamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const csv = [
      ["ID", "Name", "Email", "Program", "Year", "Section", "Progress", "Status", "Approved", "Pending", "Rejected"],
      ...filteredStudents.map((s) => [
        s.id,
        s.name,
        s.email ?? "",
        s.program,
        YEAR_LABELS[s.year_level] ?? s.year_level,
        s.section ?? "A",
        `${getProgress(s)}%`,
        getStudentStatus(s),
        s.approved,
        s.pending ?? 0,
        s.rejected ?? 0,
      ]),
    ]
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clearance_progress_${safeRole}_${dateStamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header skeleton */}
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 animate-pulse flex gap-4">
          <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonMobileCard key={i} />
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonProgressRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-2 sm:p-4 md:p-10">
      <PageHeader
        title="Clearance Progress"
        description="Monitor real-time approval rates and identify bottlenecks across all departments."
        icon={BarChart3}
        actions={
          <button
            type="button"
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <FileDown size={14} />
            Export Analytics
          </button>
        }
      />

      <div className="max-w-[1600px] mx-auto p-2 sm:p-4 md:p-10">

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-6 md:mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3 sm:gap-4 md:gap-5">
              <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl ${stat.color} dark:bg-opacity-10`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-4 sm:p-5 md:p-6 mb-5 md:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">

              {/* Real program options */}
              <select
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <option>Student</option>
                <option>Signatory</option>
              </select>

              <select
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
                value={filters.program}
                onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                disabled={filters.role !== "Student"}
              >
                <option>All Programs</option>
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>

              <select
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
                value={filters.yearLevel}
                onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value })}
                disabled={filters.role !== "Student"}
              >
                <option>All Years</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>

              <select
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
                value={filters.section}
                onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                disabled={filters.role !== "Student"}
              >
                {SECTION_OPTIONS.map((sec) => <option key={sec}>{sec}</option>)}
              </select>

              <select
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                disabled={filters.role !== "Signatory"}
              >
                {departmentOptions.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

          </div>
        </section>

        {/* TABLE */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* MOBILE LIST VIEW */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {paginated.length === 0 ? (
              <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
                No records found
              </div>
            ) : filters.role === "Student" ? (paginated as Student[]).map((student) => {
              const status = getStudentStatus(student);
              const progress = getProgress(student);

              return (
                <div key={student.id} className="p-6 space-y-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{student.name}</p>
                      <p className="text-xs font-medium text-slate-400">ID: {student.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      status === 'Completed'  ? 'bg-emerald-100 text-emerald-700' :
                      status === 'Pending'    ? 'bg-amber-100 text-amber-700'    :
                                               'bg-rose-100 text-rose-700'
                    }`}>
                      {status}
                    </span>
                  </div>
                  
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-black text-slate-400 uppercase tracking-widest">Classification</span>
                      <span className="font-bold text-slate-600 dark:text-slate-300">{student.program} • {YEAR_LABELS[student.year_level]}</span>
                    </div>
                    
                      <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-600 dark:text-slate-300">{progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            progress === 100 ? 'bg-emerald-500' :
                            progress > 0    ? 'bg-brand-500'  : 'bg-slate-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Approved: {student.approved} • Pending: {student.pending ?? 0} • Rejected: {student.rejected ?? 0}
                      </div>
                  </div>
                    <button
                      onClick={() => openStudentDetails(student)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"
                    >
                      View Per Signatory
                    </button>
                </div>
              );
            }) : (paginated as SignatoryProgress[]).map((sig) => (
              <div key={sig.signatory_id} className="p-6 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <p className="font-bold text-slate-800 dark:text-slate-200">{sig.signatory_name}</p>
                <p className="text-xs font-medium text-slate-400">{sig.department}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Approved: {sig.approved} • Pending: {sig.pending} • Rejected: {sig.rejected}
                </p>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  {filters.role === "Student" ? (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year / Program</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Signatory Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Signatory</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejected</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
                      No records found
                    </td>
                  </tr>
                ) : filters.role === "Student" ? (paginated as Student[]).map((student) => {
                  const status   = getStudentStatus(student);
                  const progress = getProgress(student);

                  return (
                    <tr key={student.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{student.name}</p>
                        <p className="text-xs font-medium text-slate-400">ID: {student.id} • {student.email ?? "—"}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{YEAR_LABELS[student.year_level]}</p>
                        <p className="text-xs text-slate-400">{student.program}</p>
                      </td>
                      <td className="px-8 py-6 w-64">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                progress === 100 ? 'bg-emerald-500' :
                                progress > 0    ? 'bg-brand-500'  : 'bg-slate-300'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-slate-400 w-8">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 space-y-1">
                          <p>Approved: {student.approved}</p>
                          <p>Pending: {student.pending ?? 0}</p>
                          <p>Rejected: {student.rejected ?? 0}</p>
                          <button
                            onClick={() => openStudentDetails(student)}
                            className="mt-1 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px]"
                          >
                            Breakdown
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          status === 'Completed'  ? 'bg-emerald-100 text-emerald-700' :
                          status === 'Pending'    ? 'bg-amber-100 text-amber-700'    :
                                                   'bg-rose-100 text-rose-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (paginated as SignatoryProgress[]).map((sig) => (
                  <tr key={sig.signatory_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-800 dark:text-slate-200">{sig.signatory_name}</td>
                    <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-300">{sig.department}</td>
                    <td className="px-8 py-6 text-sm font-black text-emerald-600 dark:text-emerald-400">{sig.approved}</td>
                    <td className="px-8 py-6 text-sm font-black text-amber-600 dark:text-amber-400">{sig.pending}</td>
                    <td className="px-8 py-6 text-sm font-black text-rose-600 dark:text-rose-400">{sig.rejected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="px-8 py-4 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center text-xs font-bold text-slate-400">
            <p>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, activeRows.length)}–{Math.min(currentPage * itemsPerPage, activeRows.length)} of {activeRows.length} records
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:text-brand-600 transition-colors disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm hover:text-brand-600 transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Per Signatory Progress</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedStudent.name} · ID {selectedStudent.id}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {detailsLoading ? (
                <p className="text-sm font-bold text-slate-500">Loading breakdown...</p>
              ) : studentDetails.length === 0 ? (
                <p className="text-sm font-bold text-slate-500">No requirement details found.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    studentDetails.reduce((acc: Record<string, RequirementDetail[]>, row) => {
                      const key = `${row.department}|||${row.signatoryName}`;
                      (acc[key] ||= []).push(row);
                      return acc;
                    }, {})
                  ).map(([key, rows]) => {
                    const [department, signatoryName] = key.split("|||");
                    const approved = rows.filter((r) => r.status === "approved").length;
                    const rejected = rows.filter((r) => r.status === "rejected").length;
                    const pending = rows.filter((r) => r.status === "pending" || r.status === "not_submitted").length;
                    return (
                      <div key={key} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100">{department}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{signatoryName}</p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Approved: {approved} • Pending: {pending} • Rejected: {rejected}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
