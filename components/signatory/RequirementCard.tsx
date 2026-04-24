"use client";
import React from "react";
import {
  HardDrive, HandMetal, GraduationCap, MapPin, Calendar,
  Clock, Building2, FileText, Edit3, Trash2
} from "lucide-react";
import type {Requirement} from "./types";

const STATUS_STYLE: Record<string, string> = {
  active:   "bg-emerald-500",
  draft:    "bg-amber-400",
  archived: "bg-slate-400",
};

const INFO_ROW = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 text-xs">
      <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
        <p className="font-bold text-slate-700 dark:text-slate-300">{value}</p>
      </div>
    </div>
  );
};

export function RequirementCard({
  req,
  onEdit,
  onDelete,
}: {
  req: Requirement;
  onEdit: (r: Requirement) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

        {/* Format icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${req.format === "Digital" ? "bg-sky-50 dark:bg-sky-500/10 text-sky-500" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"}`}>
          {req.format === "Digital" ? <HardDrive size={26} /> : <HandMetal size={26} />}
        </div>

        {/* Main info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-indigo-500"><GraduationCap size={12} /> {req.targetYear}</span>
            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <span className={`w-2 h-2 rounded-full ${STATUS_STYLE[req.reqStatus]}`} />
              {req.reqStatus}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{req.title}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{req.description}</p>
        </div>

        {/* Physical logistics panel */}
        {req.format === "Physical" && (
          <div className="grid grid-cols-1 gap-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 lg:w-72 shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">📋 Physical Logistics</p>
            <INFO_ROW icon={<Building2 size={12} className="text-indigo-500" />} label="Office Location" value={req.officeLocation} />
            <INFO_ROW icon={<MapPin size={12} className="text-sky-500" />} label="Room" value={req.roomNumber} />
            <INFO_ROW icon={<Clock size={12} className="text-amber-500" />} label="Schedule" value={req.availableSchedule} />
            <INFO_ROW icon={<Calendar size={12} className="text-rose-400" />} label="Deadline" value={req.endDate} />
            <INFO_ROW icon={<FileText size={12} className="text-slate-400" />} label="Required Documents" value={req.requiredDocuments} />
          </div>
        )}

        {/* Actions */}
        <div className="flex lg:flex-col gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-6">
          <button onClick={() => onEdit(req)} className="flex-1 lg:flex-none p-3.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all flex justify-center"><Edit3 size={20} /></button>
          <button onClick={() => onDelete(req.id)} className="flex-1 lg:flex-none p-3.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all flex justify-center"><Trash2 size={20} /></button>
        </div>
      </div>
    </div>
  );
}
