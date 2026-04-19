"use client";

import React, { useState, useEffect, useMemo } from 'react';

/* ================= TYPES ================= */

type StudentStatus = "Completed" | "Pending" | "Incomplete";

interface Student {
  id: number;
  name: string;
  program: string;
  year_level: number;
  status: "Cleared" | "Not Cleared";
  approved: number;
  total: number;
}

const YEAR_LABELS: Record<number, string> = {
  1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year"
};

const PROGRAMS = ["BSIT", "BSCS", "BSES", "BEED", "BEEDMATH", "BTLED", "HM"];

/* ================= COMPONENT ================= */

export default function ClearanceProgress() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    program: "All Programs",
    yearLevel: "All Years",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  /* ── FETCH ── */
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/clearance-progress");
      const data = await res.json();
      if (data.success) setStudents(data.students);
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
      const matchYear = filters.yearLevel === "All Years" ||
        YEAR_LABELS[s.year_level] === filters.yearLevel;
      return matchProgram && matchYear;
    });
  }, [students, filters]);

  useEffect(() => { setCurrentPage(1); }, [filters]);

  /* ── STATS ── */
  const stats = useMemo(() => {
    const completed  = filteredStudents.filter(s => getStudentStatus(s) === "Completed").length;
    const pending    = filteredStudents.filter(s => getStudentStatus(s) === "Pending").length;
    const incomplete = filteredStudents.filter(s => getStudentStatus(s) === "Incomplete").length;
    return [
      { label: "Total Students",  value: filteredStudents.length, icon: "👥", color: "bg-blue-50 text-blue-600" },
      { label: "Completed",       value: completed,               icon: "✅", color: "bg-emerald-50 text-emerald-600" },
      { label: "Pending Review",  value: pending,                 icon: "⏳", color: "bg-amber-50 text-amber-600" },
      { label: "Incomplete",      value: incomplete,              icon: "❌", color: "bg-rose-50 text-rose-600" },
    ];
  }, [filteredStudents]);

  /* ── PAGINATION ── */
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginated = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-400 text-sm font-bold">Loading clearance progress...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Clearance Progress</h1>
          <p className="text-slate-500 mt-1 text-lg">Real-time overview of student requirement fulfillment.</p>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
              <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">

              {/* Real program options */}
              <select
                className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.program}
                onChange={(e) => setFilters({ ...filters, program: e.target.value })}
              >
                <option>All Programs</option>
                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
              </select>

              <select
                className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.yearLevel}
                onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value })}
              >
                <option>All Years</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>

            {/* Generate Report — downloads CSV */}
            <button
              onClick={() => {
                const csv = [
                  ["ID", "Name", "Program", "Year", "Progress", "Status"],
                  ...filteredStudents.map(s => [
                    s.id, s.name, s.program,
                    YEAR_LABELS[s.year_level],
                    `${getProgress(s)}%`,
                    getStudentStatus(s)
                  ])
                ].map(r => r.join(",")).join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "clearance_progress.csv";
                a.click();
              }}
              className="w-full lg:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200"
            >
              Generate Report
            </button>
          </div>
        </section>

        {/* TABLE */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year / Program</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
                      No students found
                    </td>
                  </tr>
                ) : paginated.map((student) => {
                  const status   = getStudentStatus(student);
                  const progress = getProgress(student);

                  return (
                    <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-xs font-medium text-slate-400">ID: {student.id}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600">{YEAR_LABELS[student.year_level]}</p>
                        <p className="text-xs text-slate-400">{student.program}</p>
                      </td>
                      <td className="px-8 py-6 w-64">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                progress === 100 ? 'bg-emerald-500' :
                                progress > 0    ? 'bg-indigo-500'  : 'bg-slate-300'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-slate-400 w-8">{progress}%</span>
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
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center text-xs font-bold text-slate-400">
            <p>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStudents.length)}–{Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students</p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-md shadow-sm hover:text-indigo-600 transition-colors disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-md shadow-sm hover:text-indigo-600 transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}