"use client";

import React, { useState } from 'react';

export default function ClearancePeriodS() {
  const [periods, setPeriods] = useState([
    { id: 1, term: "First Semester 2026", start: "2026-04-01", end: "2026-05-15" },
    { id: 2, term: "Summer Term 2026", start: "2026-06-10", end: "2026-07-20" },
  ]);

  const [formData, setFormData] = useState({
    term: "First Semester 2026",
    start: "",
    end: ""
  });

  // New state to track if we are editing an existing record
  const [editingId, setEditingId] = useState<number | null>(null);

  const getStatus = (start: string, end: string) => {
    const now = new Date().toISOString().split('T')[0];
    if (now < start) return { label: "Scheduled", color: "blue" };
    if (now > end) return { label: "Closed", color: "slate" };
    return { label: "Live", color: "emerald" };
  };

  // Load data into form for editing
  const handleEditClick = (period: any) => {
    setEditingId(period.id);
    setFormData({
      term: period.term,
      start: period.start,
      end: period.end
    });
    // Scroll to form on mobile for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.start || !formData.end) return alert("Please select both dates.");
    if (formData.end < formData.start) return alert("End date cannot be before start date.");

    if (editingId) {
      // UPDATE LOGIC
      setPeriods(periods.map(p => 
        p.id === editingId ? { ...p, ...formData } : p
      ));
      setEditingId(null);
    } else {
      // CREATE LOGIC
      const newPeriod = { id: Date.now(), ...formData };
      setPeriods([newPeriod, ...periods]);
    }

    setFormData({ ...formData, start: "", end: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ ...formData, start: "", end: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">Clearance Management</h1>
            <p className="text-slate-500 mt-1 text-lg">Define and enforce submission timelines.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
             <div className="flex -space-x-1">
                <span className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                <span className="h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></span>
             </div>
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Automated Enforcement Active</span>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <section className="lg:col-span-4 space-y-6">
            <div className={`rounded-3xl shadow-xl shadow-slate-200/50 border p-8 transition-all duration-300 ${editingId ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Modify Period' : 'New Timeline'}
                </h2>
                {editingId && (
                  <button onClick={cancelEdit} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline">
                    Cancel Edit
                  </button>
                )}
              </div>
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Academic Term</label>
                  <select 
                    value={formData.term}
                    onChange={(e) => setFormData({...formData, term: e.target.value})}
                    className="w-full bg-white border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 p-4 text-slate-700 font-medium appearance-none outline-none shadow-sm"
                  >
                    <option>First Semester 2026</option>
                    <option>Second Semester 2026</option>
                    <option>Summer Term 2026</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Start Date</label>
                    <input 
                      type="date" 
                      value={formData.start}
                      onChange={(e) => setFormData({...formData, start: e.target.value})}
                      className="w-full bg-white border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 p-4 text-slate-700 outline-none shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">End Date</label>
                    <input 
                      type="date" 
                      value={formData.end}
                      onChange={(e) => setFormData({...formData, end: e.target.value})}
                      className="w-full bg-white border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 p-4 text-slate-700 outline-none shadow-sm" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className={`w-full text-white font-extrabold py-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 ${editingId ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-800 shadow-slate-200 hover:bg-slate-900'}`}
                >
                  {editingId ? 'Update Timeline' : 'Set Timeline'}
                </button>
              </form>
            </div>
          </section>

          <section className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h2 className="text-xl font-bold text-slate-800">History & Status</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Term</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {periods.map((item) => {
                      const status = getStatus(item.start, item.end);
                      const isCurrentlyEditing = editingId === item.id;

                      return (
                        <tr key={item.id} className={`group transition-colors ${isCurrentlyEditing ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'}`}>
                          <td className="px-8 py-6">
                            <p className="font-bold text-slate-700">{item.term}</p>
                          </td>
                          <td className="px-8 py-6 text-sm font-semibold text-slate-500">
                            {item.start} — {item.end}
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${status.color}-100 text-${status.color}-700 border border-${status.color}-200/50`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                                {/* EDIT BUTTON */}
                                <button 
                                  onClick={() => handleEditClick(item)}
                                  className={`p-2 rounded-xl transition-all ${isCurrentlyEditing ? 'text-indigo-600 bg-white shadow-sm ring-1 ring-indigo-200' : 'text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm'}`}
                                  title="Extend or Shorten Time"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>

                                {/* DELETE BUTTON */}
                                <button 
                                  onClick={() => setPeriods(periods.filter(p => p.id !== item.id))}
                                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
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