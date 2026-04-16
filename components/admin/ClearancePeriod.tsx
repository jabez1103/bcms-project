"use client";

import React, { useMemo, useState } from "react";
import {
  Search, Lock, Unlock, CheckCircle2, Clock3, X, AlertTriangle, Users,
  ShieldCheck, Library, Landmark, FileText, Ban, Filter, ChevronRight,
  RotateCcw, Save, Bell, Info
} from "lucide-react";

// ===============================
// TYPES
// ===============================

type ClearanceState = "Draft" | "Scheduled" | "Active" | "Closing Soon" | "Closed" | "Archived";
type StudentStatus = "Cleared" | "Pending" | "Not Cleared";
type RequirementStatus = "Completed" | "Pending" | "Rejected";

interface Requirement {
  id: string;
  name: string;
  icon: any;
  status: RequirementStatus;
  dependsOn?: string;
  reason?: string;
}

interface Student {
  id: string;
  name: string;
  program: string;
  year: number;
  section: string;
  status: StudentStatus;
  progress: number;
  requirements: Requirement[];
}

// ===============================
// INITIAL MOCK DATA
// ===============================

const INITIAL_STUDENTS: Student[] = [
  {
    id: "2024-0001",
    name: "Alice Johnson",
    program: "BSCS",
    year: 4,
    section: "A",
    status: "Cleared",
    progress: 100,
    requirements: [
      { id: "lib", name: "Library", icon: Library, status: "Completed" },
      { id: "acct", name: "Accounting", icon: Landmark, status: "Completed", dependsOn: "lib" },
      { id: "lab", name: "Laboratory", icon: FileText, status: "Completed", dependsOn: "acct" },
    ],
  },
  {
    id: "2024-0002",
    name: "Bob Smith",
    program: "BSIT",
    year: 3,
    section: "B",
    status: "Pending",
    progress: 33,
    requirements: [
      { id: "lib", name: "Library", icon: Library, status: "Completed" },
      { id: "acct", name: "Accounting", icon: Landmark, status: "Pending", dependsOn: "lib" },
      { id: "lab", name: "Laboratory", icon: FileText, status: "Rejected", reason: "Missing toolkit inventory" },
    ],
  },
];

// ===============================
// MAIN ENGINE
// ===============================

export default function AdvancedClearanceSystem() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [state, setState] = useState<ClearanceState>("Active");
  const [isLocked, setIsLocked] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  // Constants
  const isClosingSoon = state === "Closing Soon";
  const isClosed = state === "Closed" || state === "Archived";

  // Filter Logic
  const filtered = useMemo(() => {
    return students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
    );
  }, [students, search]);

  const handleToggle = (studentId: string, reqId: string, isRejecting: boolean = false) => {
  if (isLocked || isClosed) return;

  setStudents((prev) =>
    prev.map((s) => {
      if (s.id !== studentId) return s;

      const updatedReqs = s.requirements.map((r) => {
        if (r.id !== reqId) return r;

        // 1. Dependency Check
        if (!isRejecting && r.dependsOn && r.status !== "Completed") {
          const prereq = s.requirements.find((p) => p.id === r.dependsOn);
          if (prereq?.status !== "Completed") {
            alert(`Prerequisite Unmet: Please clear ${prereq?.name} first.`);
            return r;
          }
        }

        // 2. State Transition Logic
        if (isRejecting) {
          const note = prompt("Enter rejection reason:"); // Simple prompt for logic
          return { ...r, status: "Rejected" as RequirementStatus, reason: note || "No reason provided" };
        }

        const newStatus = r.status === "Completed" ? "Pending" : "Completed";
        return { ...r, status: newStatus as RequirementStatus, reason: undefined };
      });

      // 3. Recalculate Progress & Status
      const completed = updatedReqs.filter((r) => r.status === "Completed").length;
      const progress = Math.round((completed / updatedReqs.length) * 100);

      return {
        ...s,
        requirements: updatedReqs,
        progress,
        status: progress === 100 ? "Cleared" : progress > 0 ? "Pending" : "Not Cleared",
      };
    })
  );
};
    

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP NAV & CONTROLS */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" /> Clearance Engine v2
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Academic Year 2025-2026 • 1st Semester</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => { setState("Closing Soon"); setIsLocked(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${state === 'Closing Soon' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Closing Soon
            </button>
            <button 
              onClick={() => { setState("Closed"); setIsLocked(true); }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${state === 'Closed' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Close Period
            </button>
            <div className="w-[1px] bg-slate-200 mx-2" />
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className={`p-2 rounded-xl border transition-all ${isLocked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400'}`}
            >
              {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
          </div>
        </header>

        {/* STATS & WARNINGS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-black uppercase opacity-70 tracking-widest">Total Students</p>
            <p className="text-4xl font-black mt-2">{students.length}</p>
          </div>

          <div className={`p-6 rounded-[2rem] border-2 transition-all ${isClosingSoon ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Clock3 className={isClosingSoon ? 'text-amber-500' : 'text-slate-400'} size={20} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Lifecycle State</p>
            </div>
            <p className="text-2xl font-black tracking-tight">{state}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 italic">
              {isLocked ? "Modifications are currently locked." : "Accepting departmental clearances."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-center">
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Quick Bulk Actions</p>
            <button 
              disabled={isLocked}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 transition-all"
            >
              Approve All Cleared
            </button>
          </div>
        </div>

        {/* SEARCH & TABLE */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm font-bold"
                placeholder="Search by Student ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors">
              <Filter size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Record</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Clearance Progress</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 tracking-tight">{s.name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.id} • {s.program} YR {s.year}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full max-w-[150px] overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase ${s.progress === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {s.progress}% {s.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => setSelected(s)}
                        className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">{selected.name}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selected.id} • {selected.program}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={16} className="text-indigo-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Departmental Requirements</p>
                </div>

                <div className="space-y-4">
                  {selected.requirements.map((r) => (
                    <div 
                      key={r.id} 
                      className={`p-4 rounded-2xl border-2 transition-all ${r.status === 'Rejected' ? 'border-rose-100 bg-rose-50/30' : 'border-white bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${r.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <r.icon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{r.name}</p>
                            {r.reason && <p className="text-[10px] text-rose-500 font-bold mt-1 italic">Note: {r.reason}</p>}
                          </div>
                        </div>

                        <button 
                          disabled={isLocked || isClosed}
                          onClick={() => handleToggle(selected.id, r.id)}
                          className={`p-2 rounded-xl transition-all ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                        >
                          {r.status === 'Completed' ? <CheckCircle2 size={22} /> : <RotateCcw size={22} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AUDIT LOG MOCKUP */}
              <div className="px-6 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Activity</p>
                <div className="border-l-2 border-slate-100 pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" />
                    <p className="text-[11px] font-bold text-slate-700">Library cleared by Admin_01</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black">10:45 AM Today</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-3">
              <button 
                disabled={isLocked || selected.progress < 100}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                Approve Master Clearance
              </button>
              <button 
                onClick={() => setSelected(null)}
                className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}