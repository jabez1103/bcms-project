"use client";
import React, { useState } from "react";
import {
  X, Paperclip, MessageSquare, Settings2,
  HardDrive, HandMetal, Building2,
  Calendar, Eye, CheckCircle2, AlertTriangle
} from "lucide-react";
import type { Requirement, ReqStatus } from "./types";

const inp = "w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-500 rounded-2xl text-sm font-bold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";
const lbl = "text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1";
const smInp = "w-full p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:border-brand-500 rounded-xl text-xs font-bold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className={lbl}>{label}</label>{children}</div>;
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-brand-500">{icon}</div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</h4>
    </div>
  );
}

export function RequirementModal({
  editingId,
  formData,
  setFormData,
  onSave,
  onClose,
  permission,
  signatories,
}: {
  editingId: string | null;
  formData: Omit<Requirement, "id">;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Requirement, "id">>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  permission: { scope: "normal" | "director_sds" | "dean"; canUseConditional: boolean };
  signatories: Array<{ signatoryId: number; name: string; department: string }>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const set = (patch: Partial<typeof formData>) => setFormData(p => ({ ...p, ...patch }));
  const setAllowFileUpload = (next: boolean) => {
    setFormData((p) => ({
      ...p,
      allowFileUpload: next,
      // Business rule: comments cannot be enabled when upload is disabled.
      allowStudentNotes: next ? p.allowStudentNotes : false,
    }));
  };
  const setAllowStudentNotes = (next: boolean) => {
    setFormData((p) => ({
      ...p,
      // Business rule: comments require uploads to be enabled.
      allowStudentNotes: p.allowFileUpload ? next : false,
    }));
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (formData.format === "Conditional" && permission.scope === "director_sds" && (formData.conditionalSignatoryIds?.length ?? 0) === 0) {
      setFormError("Select at least one dependent signatory for a Conditional requirement.");
      return;
    }
    if (!editingId) { setShowConfirm(true); return; }
    handleConfirmed();
  };

  const handleConfirmed = async () => {
    setSaving(true);
    await onSave({ preventDefault: () => {} } as any);
    setSaving(false);
    setShowConfirm(false);
  };


  const STATUS_OPTIONS: { val: ReqStatus; dot: string; label: string }[] = [
    { val: "active",   dot: "bg-emerald-500", label: "Active — visible to students" },
    { val: "draft",    dot: "bg-amber-400",   label: "Draft — not yet published" },
    { val: "archived", dot: "bg-slate-400",   label: "Archived — hidden from students" },
  ];
  const formatOptions = permission.canUseConditional
    ? (["Digital", "Physical", "Conditional"] as const)
    : (["Digital", "Physical"] as const);
  const selectedConditionalIds = formData.conditionalSignatoryIds ?? [];
  const directorSds = signatories.find((s) => {
    const normalized = s.department.toLowerCase();
    return normalized.includes("director, student development services") || normalized.includes("director sds");
  });

  const setFormat = (type: "Digital" | "Physical" | "Conditional") => {
    if (type === "Conditional") {
      const deanDefault = permission.scope === "dean" && directorSds ? [directorSds.signatoryId] : [];
      setFormData((p) => ({
        ...p,
        format: "Conditional",
        allowFileUpload: false,
        allowStudentNotes: false,
        conditionalPolicy: permission.scope === "dean" ? "director_sds" : "manual_signatories",
        conditionalSignatoryIds: permission.scope === "dean" ? deanDefault : (p.conditionalSignatoryIds ?? []),
      }));
      return;
    }

    if (type === "Physical") {
      setFormData((p) => ({
        ...p,
        format: "Physical",
        allowFileUpload: false,
        allowStudentNotes: false,
        conditionalPolicy: null,
        conditionalSignatoryIds: [],
      }));
      return;
    }

    setFormData((p) => ({
      ...p,
      format: "Digital",
      allowFileUpload: true,
      allowStudentNotes: p.allowStudentNotes,
      conditionalPolicy: null,
      conditionalSignatoryIds: [],
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* PREVIEW PANEL */}
      {showPreview && (
        <div className="relative z-10 bg-brand-950 text-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl mx-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-300">Requirement Preview</h3>
            <button onClick={() => setShowPreview(false)} className="text-brand-300 hover:text-white"><X size={18} /></button>
          </div>
          <h2 className="text-2xl font-black leading-tight">{formData.title || "Untitled Requirement"}</h2>
          <p className="text-sm text-brand-200 leading-relaxed">{formData.description || "No description provided."}</p>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-brand-800">
            <div><p className="text-[9px] text-brand-400 font-black uppercase tracking-widest">Type</p><p className="font-bold text-sm">{formData.format}</p></div>
            <div><p className="text-[9px] text-brand-400 font-black uppercase tracking-widest">Target</p><p className="font-bold text-sm">{formData.targetYear}</p></div>
            <div><p className="text-[9px] text-brand-400 font-black uppercase tracking-widest">Status</p><p className="font-bold text-sm capitalize">{formData.reqStatus}</p></div>
          </div>
          {formData.format === "Physical" && formData.officeLocation && (
            <div className="bg-brand-900/50 rounded-2xl p-4 space-y-2 text-sm">
              <p className="text-[9px] text-brand-400 font-black uppercase tracking-widest mb-2">📋 Physical Info</p>
              {formData.officeLocation && <p><span className="text-brand-300">Location:</span> {formData.officeLocation}</p>}
              {formData.roomNumber && <p><span className="text-brand-300">Room:</span> {formData.roomNumber}</p>}
              {formData.availableSchedule && <p><span className="text-brand-300">Schedule:</span> {formData.availableSchedule}</p>}
            </div>
          )}
          <button onClick={() => setShowPreview(false)} className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors">Close Preview</button>
        </div>
      )}

      {/* CONFIRM DIALOG */}
      {showConfirm && (
        <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl mx-4 text-center space-y-5 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle size={30} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Are you sure?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This requirement will be <strong>assigned to students immediately</strong> upon confirmation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowConfirm(false)} className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            <button onClick={handleConfirmed} disabled={saving} className="py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
              {saving ? "Saving…" : <><CheckCircle2 size={14} /> Confirm</>}
            </button>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      {!showPreview && !showConfirm && (
        <form onSubmit={handleSubmitClick} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300 border border-transparent dark:border-slate-800">

          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{editingId ? "Update Requirement" : "Define Requirement"}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">
                <Eye size={13} /> Preview
              </button>
              <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><X size={20} /></button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6 overflow-y-auto">

            {/* Format toggle */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              {formatOptions.map(type => (
                <button key={type} type="button" onClick={() => setFormat(type)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.format === type ? "bg-white dark:bg-slate-700 shadow-md text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-600" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                  {type === "Digital" ? <HardDrive size={15} /> : type === "Physical" ? <HandMetal size={15} /> : <Settings2 size={15} />} {type}
                </button>
              ))}
            </div>
            {!permission.canUseConditional && (
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Conditional requirements are restricted to Director SDS and Dean accounts.
              </p>
            )}

            {formData.format === "Conditional" && (
              <div className="p-5 bg-brand-50/50 dark:bg-brand-500/5 rounded-2xl border border-brand-100 dark:border-brand-500/20 space-y-4 animate-in fade-in duration-200">
                <SectionHeader icon={<Settings2 size={14} />} title="Conditional Rules" />
                {permission.scope === "director_sds" ? (
                  <>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Select signatories that must be approved first. This requirement auto-approves once all selected signatories are approved.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {signatories.map((sig) => {
                        const checked = selectedConditionalIds.includes(sig.signatoryId);
                        return (
                          <button
                            key={sig.signatoryId}
                            type="button"
                            onClick={() => {
                              const next = checked
                                ? selectedConditionalIds.filter((id) => id !== sig.signatoryId)
                                : [...selectedConditionalIds, sig.signatoryId];
                              set({ conditionalSignatoryIds: next, conditionalPolicy: "manual_signatories" });
                            }}
                            className={`text-left px-3 py-2 rounded-xl border text-xs transition-colors ${
                              checked
                                ? "bg-brand-50 dark:bg-brand-500/10 border-brand-300 dark:border-brand-500/40 text-brand-700 dark:text-brand-300"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <p className="font-black">{sig.department}</p>
                            <p className="text-[10px] font-medium opacity-80">{sig.name}</p>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Conditional requirement will automatically depend on Director SDS approval. Manual signatory selection is disabled for Dean.
                    {directorSds ? ` Linked office: ${directorSds.department}.` : " Director SDS is not yet configured."}
                  </p>
                )}
              </div>
            )}

            {/* ── SECTION 1: BASIC INFO ── */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <SectionHeader icon={<Settings2 size={14} />} title="📋 Requirement Details" />
              <Field label="Target Year">
                <select className={inp} value={formData.targetYear} onChange={e => set({ targetYear: e.target.value })}>
                  <option>All Years</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                </select>
              </Field>
              <Field label="Requirement Title">
                <input required type="text" placeholder="e.g. Laboratory Clearance Form" className={inp} value={formData.title} onChange={e => set({ title: e.target.value })} />
              </Field>
              <Field label="Description / Student Instructions">
                <textarea rows={3} placeholder="Provide clear instructions for the student..." className={inp + " resize-none"} value={formData.description} onChange={e => set({ description: e.target.value })} />
              </Field>
            </div>



            {/* ── SECTION 3: STATUS ── */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <SectionHeader icon={<CheckCircle2 size={14} />} title="● Requirement Status" />
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.val} type="button" onClick={() => set({ reqStatus: s.val })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${formData.reqStatus === s.val ? "bg-white dark:bg-slate-900 border-slate-900 dark:border-brand-500 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── SECTION 4: PHYSICAL LOGISTICS ── */}
            {formData.format === "Physical" && (
              <div className="p-5 bg-brand-50/50 dark:bg-brand-500/5 rounded-2xl border border-brand-100 dark:border-brand-500/20 space-y-4 animate-in fade-in duration-200">
                <SectionHeader icon={<Building2 size={14} />} title="🏢 Physical Logistics" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="📍 Office Location">
                    <input type="text" placeholder="e.g. Science Building" className={smInp} value={formData.officeLocation || ""} onChange={e => set({ officeLocation: e.target.value })} />
                  </Field>
                  <Field label="🚪 Room Number">
                    <input type="text" placeholder="e.g. Lab 203" className={smInp} value={formData.roomNumber || ""} onChange={e => set({ roomNumber: e.target.value })} />
                  </Field>

                  <Field label="📅 Available Schedule">
                    <input type="text" placeholder="e.g. Mon–Fri 8AM–5PM" className={smInp} value={formData.availableSchedule || ""} onChange={e => set({ availableSchedule: e.target.value })} />
                  </Field>
                  <Field label="📅 Deadline">
                    <input type="date" className={smInp} value={formData.endDate || ""} onChange={e => set({ endDate: e.target.value })} />
                  </Field>
                </div>
                <Field label="📋 Required Documents (comma-separated)">
                  <textarea rows={2} placeholder="e.g. Original receipt, Signed form, ID" className={smInp + " resize-none"} value={formData.requiredDocuments || ""} onChange={e => set({ requiredDocuments: e.target.value })} />
                </Field>
              </div>
            )}

            {/* ── SECTION 5: FEATURE TOGGLES ── */}
            {formData.format !== "Conditional" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ToggleBtn active={formData.allowFileUpload} onClick={() => setAllowFileUpload(!formData.allowFileUpload)} icon={<Paperclip size={18} />} label="Allow Uploads" />
                  <ToggleBtn active={formData.allowStudentNotes} onClick={() => setAllowStudentNotes(!formData.allowStudentNotes)} icon={<MessageSquare size={18} />} label="Allow Comments" disabled={!formData.allowFileUpload} />
                </div>
                {!formData.allowFileUpload && (
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2">
                    Upload is disabled, so comments are automatically disabled too.
                  </p>
                )}
              </>
            )}
            {formData.format === "Conditional" && (
              <p className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 rounded-xl px-3 py-2">
                Conditional requirements are system-based: no student upload and no manual signatory review action.
              </p>
            )}
            {formError && (
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3 py-2">
                {formError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-brand-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 dark:hover:bg-brand-500 transition-all active:scale-95">
              {editingId ? "Save Modifications" : "Confirm Requirement"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ToggleBtn({ active, onClick, icon, label, disabled = false }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${active ? "bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"}`}>
      <div className={`p-2 rounded-xl shadow-sm ${active ? "bg-brand-600 dark:bg-brand-500 text-white border border-transparent" : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"}`}>{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
