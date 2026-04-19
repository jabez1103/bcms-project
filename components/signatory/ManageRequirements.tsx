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

const INITIAL_DATA: Requirement[] = [
  { 
    id: "REQ-01", 
    category: "Laboratory", 
    format: "Physical",
    title: "Apparatus Clearance", 
    description: "Submit the signed inventory form to the lab head to verify no breakage occurred.", 
    allowFileUpload: false, 
    allowStudentNotes: true, 
    targetYear: "4th Year",
    startDate: "2024-05-01",
    endDate: "2024-05-15",
    itemsToBring: "Original Receipt, Signed Inventory Sheet",
    location: "Science Building, RM 402"
  },
];

export default function EnhancedRequirementHub() {
  const [requirements, setRequirements] = useState<Requirement[]>(INITIAL_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setRequirements(prev => prev.map(r => r.id === editingId ? { ...formData, id: editingId } as Requirement : r));
    } else {
      setRequirements(prev => [...prev, { ...formData, id: `REQ-${Date.now()}` } as Requirement]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-10">      
      <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
        {/* Responsive Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 md:mb-16">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full w-fit mx-auto md:mx-0 border border-violet-200">
              <Settings2 size={12} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">Signatory Control</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-sky-500">Requirements</span>
            </h1>
          </div>

          <button 
            onClick={handleOpenCreate}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-violet-600 transition-all shadow-xl active:scale-95"
          >
            <Plus size={20} />
            <span>Create New</span>
          </button>
        </header>

        {/* Responsive Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-10">
            <StatCard label="Total" value={requirements.length} color="slate" />
            <StatCard label="Physical" value={requirements.filter(r => r.format === 'Physical').length} color="violet" />
            <StatCard label="Digital" value={requirements.filter(r => r.format === 'Digital').length} color="sky" />
            <StatCard label="Active" value={requirements.length} color="emerald" />
        </div>

        {/* Requirement List */}
        <div className="space-y-4">
          {requirements.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 p-5 md:p-8 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                
                {/* Format Icon - Smaller on Mobile */}
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${req.format === 'Digital' ? 'bg-sky-50 text-sky-500' : 'bg-violet-50 text-violet-500'}`}>
                  {req.format === 'Digital' ? <HardDrive size={24} className="md:w-8 md:h-8" /> : <HandMetal size={24} className="md:w-8 md:h-8" />}
                </div>

                {/* Content Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-md">{req.category}</span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-violet-500 uppercase">
                      <GraduationCap size={12} /> {req.targetYear}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-violet-600 transition-colors">{req.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{req.description}</p>
                </div>

                {/* Logistics View - Stacks on mobile */}
                {req.format === 'Physical' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 lg:w-64">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Calendar size={14} className="text-violet-400" />
                      <span>{req.endDate || 'No Deadline'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <MapPin size={14} className="text-sky-400" />
                      <span className="truncate">{req.location || 'Main Office'}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex lg:flex-col gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
                  <button onClick={() => handleOpenEdit(req)} className="flex-1 lg:flex-none p-3 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all flex justify-center"><Edit3 size={18}/></button>
                  <button onClick={() => setRequirements(requirements.filter(r => r.id !== req.id))} className="flex-1 lg:flex-none p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex justify-center"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Optimized for Small Screens */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <form onSubmit={handleSave} className="relative bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-6 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl md:text-2xl font-black text-slate-800">{editingId ? "Update" : "Define"} Requirement</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200"><X size={20}/></button>
            </div>

            <div className="p-6 md:p-10 space-y-6 overflow-y-auto">
              {/* Type Switch */}
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                {["Digital", "Physical"].map((type) => (
                  <button 
                    key={type}
                    type="button" 
                    onClick={() => setFormData({...formData, format: type as any})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.format === type ? 'bg-white shadow-md text-violet-600' : 'text-slate-400'}`}
                  >
                    {type === "Digital" ? <HardDrive size={14} /> : <HandMetal size={14} />} {type}
                  </button>
                ))}
              </div>

              {/* Responsive Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-100 rounded-2xl text-sm font-bold outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                    <option>Laboratory</option><option>Library</option><option>Financial</option><option>Departmental</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Year</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-100 rounded-2xl text-sm font-bold outline-none" value={formData.targetYear} onChange={e => setFormData({...formData, targetYear: e.target.value})}>
                    <option>All Years</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Requirement Title</label>
                <input required type="text" placeholder="e.g. Laboratory Clearance" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-100 rounded-2xl text-sm font-bold outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              {/* Physical Logistics Container */}
              {formData.format === 'Physical' && (
                <div className="p-6 bg-violet-50/50 rounded-[2rem] border border-violet-100 space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="p-3 bg-white rounded-xl text-xs font-bold border border-violet-100 outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    <input type="date" className="p-3 bg-white rounded-xl text-xs font-bold border border-violet-100 outline-none" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Handover Location" className="w-full p-3 bg-white rounded-xl text-xs font-bold border border-violet-100 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              )}

              {/* Feature Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <ToggleButton active={formData.allowFileUpload} onClick={() => setFormData({...formData, allowFileUpload: !formData.allowFileUpload})} icon={<Paperclip size={16}/>} label="Uploads" />
                <ToggleButton active={formData.allowStudentNotes} onClick={() => setFormData({...formData, allowStudentNotes: !formData.allowStudentNotes})} icon={<MessageSquare size={16}/>} label="Notes" />
              </div>
            </div>

            <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-100">
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-violet-600 transition-all active:scale-[0.98]">
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
        violet: 'bg-violet-600 text-white shadow-violet-200',
        sky: 'bg-white text-sky-500 border-slate-200',
        slate: 'bg-white text-slate-800 border-slate-200',
        emerald: 'bg-white text-emerald-600 border-slate-200'
    };
    return (
        <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all hover:translate-y-[-2px] shadow-sm ${colors[color as keyof typeof colors]}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${color === 'violet' ? 'opacity-80' : 'text-slate-400'}`}>{label}</p>
            <p className="text-2xl md:text-3xl font-black">{value}</p>
        </div>
    );
}

function ToggleButton({ active, onClick, icon, label }: any) {
    return (
        <button type="button" onClick={onClick} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-violet-50 border-violet-200 text-violet-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <div className={`p-2 rounded-lg ${active ? 'bg-violet-600 text-white' : 'bg-slate-100'}`}>{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-wide">{label}</span>
        </button>
    );
}