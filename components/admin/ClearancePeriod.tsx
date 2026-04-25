"use client";

import React, { useState, useEffect } from 'react';
import { SkeletonPeriodForm, SkeletonPeriodRow, SkeletonMobileCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarRange } from "lucide-react";

type Period = {
  period_id: number;
  academic_year: string;
  semester: string | null;
  start_date: string;
  end_date: string;
  period_status: string;
  set_by: string;
};

const ACADEMIC_YEARS = ["2024-2025", "2025-2026", "2026-2027", "2027-2028"];
const SEMESTERS = [
  { value: "1st",    label: "1st Semester" },
  { value: "2nd",    label: "2nd Semester" },
  { value: "Summer", label: "Summer Term" },
  { value: "",       label: "Not Applicable" },
];

const emptyForm = {
  academic_year: "2025-2026",
  semester: "1st",
  start_date: "",
  end_date: "",
};

const STATUS_STYLES: Record<string, string> = {
  live:      "bg-emerald-100 text-emerald-700 border-emerald-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  ended:     "bg-rose-100 text-rose-700 border-rose-200",
  disabled:  "bg-slate-100 text-slate-500 border-slate-200",
};

export default function ClearancePeriodPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── FETCH ── */
  const fetchPeriods = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/clearance-periods");
    const data = await res.json();
    if (data.success) setPeriods(data.periods);
    setLoading(false);
  };

  useEffect(() => { fetchPeriods(); }, []);

  /* ── SUBMIT ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.start_date || !formData.end_date) {
      setError("Please select both dates."); return;
    }
    if (formData.end_date <= formData.start_date) {
      setError("End date must be after start date."); return;
    }

    setSubmitting(true);
    const url = editingId
      ? `/api/admin/clearance-periods/${editingId}`
      : "/api/admin/clearance-periods";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Something went wrong"); setSubmitting(false); return; }

    setFormData(emptyForm);
    setEditingId(null);
    setSubmitting(false);
    fetchPeriods();
  };

  /* ── EDIT ── */

  const normalizeSemester = (sem: string | null) => {
    if (sem === "1") return "1st";
    if (sem === "2") return "2nd";
    return sem || "";
  };

  const handleEdit = (p: Period) => {
    setEditingId(p.period_id);
    setFormData({
      academic_year: p.academic_year,
      semester: normalizeSemester(p.semester), // p.semester || "",
      start_date: p.start_date.split("T")[0],
      end_date: p.end_date.split("T")[0],
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── DELETE ── */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this clearance period?")) return;
    await fetch(`/api/admin/clearance-periods/${id}`, { method: "DELETE" });
    fetchPeriods();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-pulse">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-10 w-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Form panel skeleton */}
          <section className="lg:col-span-4">
            <SkeletonPeriodForm />
          </section>

          {/* Table skeleton */}
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl">

              {/* Table header */}
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30 animate-pulse">
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>

              {/* Mobile Skeleton */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonMobileCard key={i} />
                ))}
              </div>

              {/* Desktop Skeleton */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonPeriodRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <PageHeader
        title="Clearance Management"
        description="Define and enforce submission timelines."
        icon={CalendarRange}
        actions={
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
            <div className="flex -space-x-1">
              <span className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              <span className="h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></span>
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Auto-Status Active</span>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto p-4 md:p-10">
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* FORM */}
          <section className="lg:col-span-4 space-y-6">
            <div className={`rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border p-8 transition-all duration-300 ${editingId ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-500/30 ring-2 ring-brand-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {editingId ? 'Modify Period' : 'New Timeline'}
                </h2>
                {editingId && (
                  <button onClick={cancelEdit} className="text-xs font-bold text-brand-600 hover:text-brand-800 underline">
                    Cancel
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs font-bold">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* ACADEMIC YEAR */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Academic Year</label>
                  <select
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 p-4 text-slate-700 dark:text-slate-200 font-medium outline-none shadow-sm"
                  >
                    {ACADEMIC_YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* SEMESTER */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Semester / Term</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 p-4 text-slate-700 dark:text-slate-200 font-medium outline-none shadow-sm"
                  >
                    {SEMESTERS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* DATES */}
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 p-4 text-slate-700 dark:text-slate-200 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      min={formData.start_date} // Prevents selecting end before start
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 p-4 text-slate-700 dark:text-slate-200 outline-none shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full text-white font-extrabold py-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 ${editingId ? 'bg-brand-600 shadow-brand-200 hover:bg-brand-700' : 'bg-slate-800 shadow-slate-200 hover:bg-slate-900'}`}
                >
                  {submitting ? "Saving..." : editingId ? "Update Timeline" : "Set Timeline"}
                </button>
              </form>
            </div>
          </section>

          {/* TABLE */}
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">History & Status</h2>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{periods.length} Periods</span>
              </div>

              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <>
                    <SkeletonMobileCard />
                    <SkeletonMobileCard />
                    <SkeletonMobileCard />
                  </>
                ) : periods.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-400">No clearance periods found.</div>
                ) : periods.map((item) => {
                  const isEditing = editingId === item.period_id;
                  const statusStyle = STATUS_STYLES[item.period_status] ?? STATUS_STYLES.disabled;

                  return (
                    <div key={item.period_id} className={`p-6 space-y-4 transition-colors ${isEditing ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{item.academic_year}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.semester ? item.semester + " Semester" : "No semester"}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyle}`}>
                          {item.period_status}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-slate-400 uppercase tracking-widest">Timeline</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {item.start_date?.split("T")[0]} — {item.end_date?.split("T")[0]}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-slate-400 uppercase tracking-widest">Set By</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {item.set_by || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        {item.period_status !== "ended" && (
                          <button
                            onClick={() => handleEdit(item)}
                            className={`flex-1 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${isEditing ? 'text-brand-600 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-brand-200 dark:ring-brand-500/20' : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'}`}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.period_id)}
                          className="flex-1 py-3 text-slate-500 dark:text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Year</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Set By</th>
                      <th className="px-8 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {loading ? (
                      <>
                        <SkeletonPeriodRow />
                        <SkeletonPeriodRow />
                        <SkeletonPeriodRow />
                        <SkeletonPeriodRow />
                      </>
                    ) : periods.length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-400">No clearance periods found.</td></tr>
                    ) : periods.map((item) => {
                      const isEditing = editingId === item.period_id;
                      const statusStyle = STATUS_STYLES[item.period_status] ?? STATUS_STYLES.disabled;

                      return (
                        <tr key={item.period_id} className={`group transition-colors ${isEditing ? 'bg-brand-50/50 dark:bg-brand-900/10' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/80'}`}>
                          <td className="px-8 py-6">
                            <p className="font-bold text-slate-700 dark:text-slate-200">{item.academic_year}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{item.semester ? item.semester + " Semester" : "No semester"}</p>
                          </td>
                          <td className="px-8 py-6 text-sm font-semibold text-slate-500">
                            {item.start_date?.split("T")[0]} — {item.end_date?.split("T")[0]}
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyle}`}>
                              {item.period_status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-xs text-slate-400 font-medium">
                            {item.set_by || "—"}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              {/*  Disable edit if ended */}
                              {item.period_status !== "ended" && (
                                <button
                                  onClick={() => handleEdit(item)}
                                  className={`p-2 rounded-xl transition-all ${isEditing ? 'text-brand-600 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-brand-200 dark:ring-brand-500/20' : 'text-slate-400 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'}`}
                                  title="Edit Period"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(item.period_id)}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                title="Delete Period"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
