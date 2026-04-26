"use client";
import React, { useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import { RequirementCard } from "./RequirementCard";
import { RequirementModal } from "./RequirementModal";
import type { Requirement } from "./types";
import { DEFAULT_FORM } from "./types";

type RequirementPermission = {
  scope: "normal" | "director_sds" | "dean";
  canUseConditional: boolean;
};

type SignatoryOption = {
  signatoryId: number;
  name: string;
  department: string;
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo:  "bg-brand-600 text-white border-transparent shadow-brand-200 dark:shadow-none",
    sky:     "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border-slate-200 dark:border-slate-800",
    slate:   "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800",
    emerald: "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800",
    amber:   "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-800",
  };
  return (
    <div className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all hover:-translate-y-1 shadow-sm ${colors[color]}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${color === "indigo" ? "opacity-80" : "text-slate-400 dark:text-slate-500"}`}>{label}</p>
      <p className="text-3xl md:text-4xl font-black">{value}</p>
    </div>
  );
}

export default function ManageRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingId,   setEditingId]     = useState<string | null>(null);
  const [formData,    setFormData]      = useState<Omit<Requirement, "id">>(DEFAULT_FORM);
  const [permission, setPermission] = useState<RequirementPermission>({ scope: "normal", canUseConditional: false });
  const [signatories, setSignatories] = useState<SignatoryOption[]>([]);

  React.useEffect(() => {
    fetch("/api/signatory/requirements")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRequirements(data.requirements);
          if (data.permission) setPermission(data.permission);
          if (Array.isArray(data.signatories)) setSignatories(data.signatories);
        }
      });
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (req: Requirement) => {
    setEditingId(req.id);
    setFormData({ ...req });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res  = await fetch(`/api/signatory/requirements/${editingId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setRequirements(prev => prev.map(r => r.id === editingId ? { ...formData, id: editingId } as Requirement : r));
          setIsModalOpen(false);
        } else { alert(data.error || "Failed to update"); }
      } else {
        const res  = await fetch("/api/signatory/requirements", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setRequirements(prev => [{ ...formData, id: data.id } as Requirement, ...prev]);
          setIsModalOpen(false);
        } else { alert(data.error || "Failed to save"); }
      }
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this requirement? This cannot be undone.")) return;
    const res = await fetch(`/api/signatory/requirements/${id}`, { method: "DELETE" });
    if (res.ok) setRequirements(prev => prev.filter(r => r.id !== id));
  };

  const active   = requirements.filter(r => r.reqStatus   === "active").length;
  const drafts   = requirements.filter(r => r.reqStatus   === "draft").length;
  const physical = requirements.filter(r => r.format      === "Physical").length;
  const digital  = requirements.filter(r => r.format      === "Digital").length;
  const conditional = requirements.filter(r => r.format   === "Conditional").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-10 transition-colors">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-[20] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 px-2 sm:px-4 py-4 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200 dark:shadow-none">
              <Settings2 size={20} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-none uppercase">
                Manage <span className="text-brand-600">Requirements</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Configure clearance workflow</p>
              </div>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-brand-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-brand-600 dark:hover:bg-brand-500 transition-all shadow-lg active:scale-95">
            <Plus size={15} /> New Requirement
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-2 sm:p-4 md:p-8 lg:p-12">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
          <StatCard label="Total"    value={requirements.length} color="indigo" />
          <StatCard label="Active"   value={active}              color="emerald" />
          <StatCard label="Drafts"   value={drafts}              color="amber" />
          <StatCard label="Physical" value={physical}            color="sky" />
          <StatCard label="Digital"  value={digital}             color="slate" />
          <StatCard label="Conditional" value={conditional}      color="sky" />
        </div>

        {/* List */}
        <div className="space-y-4">
          {requirements.map(req => (
            <RequirementCard key={req.id} req={req} onEdit={openEdit} onDelete={handleDelete} />
          ))}
          {requirements.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900">
              <Settings2 size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">No requirements defined</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Click "New Requirement" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <RequirementModal
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
          permission={permission}
          signatories={signatories}
        />
      )}
    </div>
  );
}
