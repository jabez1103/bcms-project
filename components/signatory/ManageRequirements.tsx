"use client";

import React, { useState } from "react";
import { 
  Plus, X, Paperclip, MessageSquare, Trash2, Edit3, 
  Settings2, Calendar, MapPin, HardDrive, HandMetal,
  Clock, AlertCircle, GraduationCap
} from "lucide-react";

/* ================= TYPES ================= */

type RequirementCategory = "Laboratory" | "Library" | "Financial" | "Departmental";
type RequirementFormat = "Physical" | "Digital";

interface Requirement {
  id: string;
  category: RequirementCategory;
  format: RequirementFormat;
  title: string;
  description: string;
  allowFileUpload: boolean;
  allowStudentNotes: boolean;
  targetYear: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  itemsToBring?: string;
}

const INITIAL_DATA: Requirement[] = [];

export default function EnhancedRequirementHub() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/signatory/requirements')
      .then(r => r.json())
      .then(data => { if (data.success) setRequirements(data.requirements) });
  }, []);

  const [formData, setFormData] = useState<Omit<Requirement, 'id'>>({
    category: "Laboratory",
    format: "Digital",
    title: "",
    description: "",
    allowFileUpload: true,
    allowStudentNotes: true,
    targetYear: "All Years",
    startDate: "",
    endDate: "",
    itemsToBring: "",
    location: ""
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ 
        category: "Laboratory", format: "Digital", title: "", description: "", 
        allowFileUpload: true, allowStudentNotes: true, targetYear: "All Years",
        startDate: "", endDate: "", itemsToBring: "", location: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (req: Requirement) => {
    setEditingId(req.id);
    setFormData({ ...req });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (editingId) {
          const res = await fetch(`/api/signatory/requirements/${editingId}`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(formData)
          });
          const data = await res.json();
          if (data.success) {
            setRequirements(prev => prev.map(r => r.id === editingId ? { ...formData, id: editingId } as Requirement : r));
            setIsModalOpen(false);
          } else {
            alert(data.error || "Failed to update requirement");
          }
        } else {
          const res = await fetch('/api/signatory/requirements', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(formData)
          });
          const data = await res.json();
          if (data.success) {
            setRequirements(prev => [{ ...formData, id: data.id } as Requirement, ...prev]);
            setIsModalOpen(false);
          } else {
            alert(data.error || "Failed to save requirement");
          }
        }
    } catch (err: any) {
        alert("An error occurred: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/signatory/requirements/${id}`, { method: 'DELETE' });
    if (res.ok) {
        setRequirements(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-10 transition-colors">      
      <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <Settings2 size={24} className="animate-spin-slow" />
             </div>
             <div>
               <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                 Manage Requirements
               </h1>
               <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Configure clearance forms</p>
             </div>
          </div>

          <button 
            onClick={handleOpenCreate}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all shadow-xl active:scale-95"
          >
            <Plus size={16} />
            <span>New Requirement</span>
          </button>
        </header>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Requirements" value={requirements.length} color="slate" />
            <StatCard label="Physical Subs" value={requirements.filter(r => r.format === 'Physical').length} color="indigo" />
            <StatCard label="Digital Subs" value={requirements.filter(r => r.format === 'Digital').length} color="sky" />
            <StatCard label="Active Items" value={requirements.length} color="emerald" />
        </div>

        {/* Requirement List */}
        <div className="space-y-4">
          {requirements.map((req) => (
            <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
              <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                
                {/* Format Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${req.format === 'Digital' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'}`}>
                  {req.format === 'Digital' ? <HardDrive size={28} /> : <HandMetal size={28} />}
                </div>

                {/* Content Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded border border-slate-200 dark:border-slate-700">{req.category}</span>
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                      <GraduationCap size={14} /> {req.targetYear}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{req.title}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{req.description}</p>
                </div>

                {/* Logistics View */}
                {req.format === 'Physical' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 lg:w-64">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600"><Calendar size={14} className="text-indigo-500 dark:text-indigo-400" /></div>
                      <span>{req.endDate || 'No Deadline'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600"><MapPin size={14} className="text-sky-500 dark:text-sky-400" /></div>
                      <span className="truncate">{req.location || 'Main Office'}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex lg:flex-col gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-6">
                  <button onClick={() => handleOpenEdit(req)} className="flex-1 lg:flex-none p-3.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all flex justify-center"><Edit3 size={20}/></button>
                  <button onClick={() => handleDelete(req.id)} className="flex-1 lg:flex-none p-3.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all flex justify-center"><Trash2 size={20}/></button>
                </div>
              </div>
            </div>
          ))}
          {requirements.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900">
                <Settings2 size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">No requirements defined</h3>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <form onSubmit={handleSave} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300 border border-transparent dark:border-slate-800">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{editingId ? "Update Requirement" : "Define Requirement"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all shadow-sm"><X size={20}/></button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              {/* Type Switch */}
              <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                {["Digital", "Physical"].map((type) => (
                  <button 
                    key={type}
                    type="button" 
                    onClick={() => setFormData({...formData, format: type as any})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.format === type ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-600' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    {type === "Digital" ? <HardDrive size={16} /> : <HandMetal size={16} />} {type}
                  </button>
                ))}
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Category</label>
                  <select className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl text-sm font-bold outline-none transition-all cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                    <option>Laboratory</option><option>Library</option><option>Financial</option><option>Departmental</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Target Year</label>
                  <select className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl text-sm font-bold outline-none transition-all cursor-pointer" value={formData.targetYear} onChange={e => setFormData({...formData, targetYear: e.target.value})}>
                    <option>All Years</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Requirement Title</label>
                <input required type="text" placeholder="e.g. Laboratory Clearance Form" className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl text-sm font-bold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Description</label>
                <textarea rows={3} placeholder="Provide instructions for the student..." className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl text-sm font-bold outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              {/* Physical Logistics Container */}
              {formData.format === 'Physical' && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Physical Logistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    <input type="date" className="p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Handover Location (e.g. Science Building, RM 402)" className="w-full p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              )}

              {/* Feature Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <ToggleButton active={formData.allowFileUpload} onClick={() => setFormData({...formData, allowFileUpload: !formData.allowFileUpload})} icon={<Paperclip size={18}/>} label="Allow Uploads" />
                <ToggleButton active={formData.allowStudentNotes} onClick={() => setFormData({...formData, allowStudentNotes: !formData.allowStudentNotes})} icon={<MessageSquare size={18}/>} label="Allow Notes" />
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <button type="submit" className="w-full py-4.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all active:scale-95">
                {editingId ? "Save Modifications" : "Confirm Requirement"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENT PIECES ================= */

function StatCard({ label, value, color }: any) {
    const colors = {
        indigo: 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none border-transparent',
        sky: 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border-slate-200 dark:border-slate-800',
        slate: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800',
        emerald: 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800'
    };
    return (
        <div className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all hover:-translate-y-1 shadow-sm ${colors[color as keyof typeof colors]}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${color === 'indigo' ? 'opacity-80' : 'text-slate-400 dark:text-slate-500'}`}>{label}</p>
            <p className="text-3xl md:text-4xl font-black">{value}</p>
        </div>
    );
}

function ToggleButton({ active, onClick, icon, label }: any) {
    return (
        <button type="button" onClick={onClick} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${active ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}`}>
            <div className={`p-2 rounded-xl shadow-sm ${active ? 'bg-indigo-600 dark:bg-indigo-500 text-white border border-transparent' : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700'}`}>{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}