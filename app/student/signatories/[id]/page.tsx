"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, BookOpen, Info, AlertCircle,
  XCircle, Clock, Send, MessageSquare, Building2, MapPin,
  Calendar, FileText, GraduationCap, HardDrive, HandMetal,
  CalendarDays, ClipboardList,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SkeletonDetailView } from "@/components/ui/Skeleton";
import ProfileAvatar from "@/components/ui/ProfileAvatar";

type SignatoryDetail = {
  id: number;
  role: string;           // requirement_name (title)
  department: string;     // office/department
  description: string;
  requirement_type: string; // 'physical' | 'digital'
  target_year: string;
  signatory_name: string;
  academic_credentials: string | null;
  signatory_avatar: string | null;
  status: string;
  signatory_feedback: string | null;
  file_path: string | null;
  comment: string | null;
  submission_id: number | null;
  allow_comment: number;
  allow_file_upload: number;
  // Physical logistics
  office_location: string | null;
  room_number: string | null;
  available_schedule: string | null;
  required_documents: string | null;
  // Dates
  start_date: string | null;
  end_date: string | null;
};

/* ── tiny helper ── */
function InfoRow({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

export default function SignatoryDetails() {
  const params  = useParams();
  const router  = useRouter();

  const [signatory, setSignatory]     = useState<SignatoryDetail | null>(null);
  const [loading, setLoading]         = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment]         = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      const res  = await fetch(`/api/student/clearance-status/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setSignatory(data.signatory);
        if (data.signatory?.comment) setComment(data.signatory.comment);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [params.id]);

  if (loading)   return <SkeletonDetailView />;
  if (!signatory) return <NotFound router={router} />;

  /* ── Status helpers ── */
  const normalizeStatus = (s: string) => {
    switch (s?.toLowerCase()) {
      case "approved":  return "Approved";
      case "pending":   return "Pending";
      case "rejected":  return "Rejected";
      default:          return "Not Submitted";
    }
  };

  const status     = normalizeStatus(signatory.status);
  const isApproved = status === "Approved";
  const isPending  = status === "Pending";
  const isRejected = status === "Rejected";

  const getStatusUI = () => {
    if (isApproved) return { label: "Approved",      icon: CheckCircle2, bg: "bg-emerald-500" };
    if (isPending)  return { label: "In Queue",       icon: Clock,        bg: "bg-amber-500"  };
    if (isRejected) return { label: "Rejected",       icon: XCircle,      bg: "bg-red-500"    };
    return            { label: "Not Submitted",   icon: Info,         bg: "bg-slate-400"  };
  };
  const ui = getStatusUI();

  const isPhysical = signatory.requirement_type?.toLowerCase() === "physical";
  const showCommentBox = selectedFile !== null && Boolean(signatory.allow_comment);
  const uploadAllowed = Boolean(signatory.allow_file_upload);
  const commentAllowed = Boolean(signatory.allow_comment);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uploadAllowed) {
      setErrorMsg("Upload is disabled for this requirement.");
      return;
    }
    setErrorMsg("");
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (!file) setComment("");
  };

  const handleRemoveFile = () => { setSelectedFile(null); setComment(""); };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    setErrorMsg("");
    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("requirement_id", String(signatory.id));
    if (commentAllowed && showCommentBox && comment.trim()) fd.append("comment", comment.trim());

    const res  = await fetch("/api/student/submit", { method: "POST", body: fd });
    const data = await res.json();

    if (data.success) {
      setSuccessMsg("Submitted successfully! Awaiting review.");
      setSelectedFile(null);
      const updated     = await fetch(`/api/student/clearance-status/${params.id}`);
      const updatedData = await updated.json();
      if (updatedData.success) {
        setSignatory(updatedData.signatory);
        setComment(updatedData.signatory?.comment ?? "");
      }
    } else {
      setErrorMsg(data.error || "Submission failed.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors text-slate-900 dark:text-slate-100">

      {/* NAV */}
      <nav className="sticky top-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center z-20 transition-colors">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to Portal
        </button>

        {/* Type badge */}
        <div className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border ${
          isPhysical
            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
            : "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400"
        }`}>
          {isPhysical ? <HandMetal size={14} /> : <HardDrive size={14} />}
          {isPhysical ? "Physical Submission" : "Digital Submission"}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* Identity card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 ${ui.bg} text-white shadow-sm`}>
                {ui.icon && <ui.icon size={12} />}
                {ui.label}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {signatory.role}
              </h1>
             
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                {signatory.description || "No additional description."}
              </p>

              {/* Signatory */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <ProfileAvatar
                  src={signatory.signatory_avatar}
                  fullName={signatory.signatory_name}
                  alt="Signatory profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md shrink-0"
                  initialsClassName="text-sm border-2 border-white dark:border-slate-800 shadow-md shrink-0"
                />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Authorized Signatory</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{signatory.signatory_name} {signatory.academic_credentials}</p>
                  {signatory.department && (
                    <p className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mt-0.5">
                      {signatory.department}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Meta tags */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Requirement Info</p>
              {signatory.target_year && (
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">For:</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{signatory.target_year}</span>
                </div>
              )}
              {signatory.start_date && (
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opens:</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{signatory.start_date}</span>
                </div>
              )}
              {signatory.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-rose-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deadline:</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-black">{signatory.end_date}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Success message */}
            {successMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500 p-5 rounded-r-xl flex gap-4">
                <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border-l-4 border-rose-500 p-5 rounded-r-xl flex gap-4">
                <AlertCircle className="text-rose-500 shrink-0" />
                <p className="text-sm font-bold text-rose-800 dark:text-rose-300">{errorMsg}</p>
              </div>
            )}

            {/* Signatory feedback */}
            {signatory.signatory_feedback && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border-l-4 border-rose-500 p-5 rounded-r-xl flex gap-4">
                <AlertCircle className="text-rose-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-400">
                    {isRejected ? "Correction Required" : "Signatory Feedback"}
                  </h4>
                  <p className="text-sm text-rose-700 dark:text-rose-300 mt-1 italic">
                    "{signatory.signatory_feedback}"
                  </p>
                </div>
              </div>
            )}

            {/* ── PHYSICAL INFO PANEL ── */}
            {isPhysical && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-100 dark:border-indigo-500/20 shadow-xl overflow-hidden">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 px-8 py-4 border-b border-indigo-100 dark:border-indigo-500/20 flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Where to Go</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Physical clearance logistics</p>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoRow
                    icon={<Building2 size={14} className="text-indigo-500" />}
                    label="Office / Building"
                    value={signatory.office_location}
                  />
                  <InfoRow
                    icon={<MapPin size={14} className="text-sky-500" />}
                    label="Room Number"
                    value={signatory.room_number}
                  />
                  <InfoRow
                    icon={<Clock size={14} className="text-amber-500" />}
                    label="Available Schedule"
                    value={signatory.available_schedule}
                  />
                  <InfoRow
                    icon={<Calendar size={14} className="text-rose-500" />}
                    label="Deadline"
                    value={signatory.end_date}
                  />
                </div>
                {signatory.required_documents && (
                  <div className="px-8 pb-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList size={14} className="text-slate-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Required Documents / Items to Bring</p>
                      </div>
                      <ul className="space-y-1.5">
                        {signatory.required_documents.split(",").map((doc, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            {doc.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── DIGITAL INFO PANEL ── */}
            {!isPhysical && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-sky-100 dark:border-sky-500/20 shadow-xl overflow-hidden">
                <div className="bg-sky-50 dark:bg-sky-500/10 px-8 py-4 border-b border-sky-100 dark:border-sky-500/20 flex items-center gap-3">
                  <div className="p-2 bg-sky-600 rounded-lg text-white shadow-lg shadow-sky-200 dark:shadow-none">
                    <HardDrive size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Digital Submission Info</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {uploadAllowed ? "Upload your file below" : "Submission details"}
                    </p>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {signatory.end_date && (
                    <InfoRow
                      icon={<Calendar size={14} className="text-rose-500" />}
                      label="Submission Deadline"
                      value={signatory.end_date}
                    />
                  )}
                  {signatory.start_date && (
                    <InfoRow
                      icon={<CalendarDays size={14} className="text-emerald-500" />}
                      label="Opens On"
                      value={signatory.start_date}
                    />
                  )}
                  {signatory.required_documents && (
                    <div className="sm:col-span-2">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText size={14} className="text-slate-500" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Required Documents</p>
                        </div>
                        <ul className="space-y-1.5">
                          {signatory.required_documents.split(",").map((doc, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                              {doc.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── UPLOAD CARD ── */}
            {uploadAllowed && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-slate-800 dark:bg-indigo-600 rounded-lg text-white shadow-sm">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {isApproved ? "Submission Approved" : isPending ? "Awaiting Review" : "Upload Your File"}
                  </h3>
                </div>

                <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6">
                  {/* Current file */}
                  {signatory.file_path && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Submission</p>
                      <a href={signatory.file_path} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline break-all">
                        {signatory.file_path.split("/").pop()}
                      </a>
                    </div>
                  )}

                  {/* Previous comment read-only */}
                  {!selectedFile && signatory.comment && (
                    <div className="bg-indigo-50/60 dark:bg-indigo-500/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-500/20 space-y-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={12} className="text-indigo-500" />
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Your Previous Comment</p>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{signatory.comment}"</p>
                      <p className="text-[10px] text-slate-400 mt-1">Select a new file above to update this comment.</p>
                    </div>
                  )}

                  {/* Upload area (hidden when approved) */}
                  {!isApproved && (
                    <>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50 group text-center">
                        <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" accept=".pdf,.jpg,.jpeg,.png" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Send size={28} className="text-indigo-500 dark:text-indigo-400 rotate-[-45deg]" />
                          </div>
                          <span className="text-base font-bold text-slate-900 dark:text-slate-100">Drag &amp; Drop or Click to browse</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-widest">PDF, JPG, PNG (Max 10MB)</span>
                        </label>
                      </div>

                      {selectedFile && (
                        <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 size={16} className="shrink-0" />
                            <span className="text-xs font-bold truncate">{selectedFile.name}</span>
                          </div>
                          <button onClick={handleRemoveFile} className="shrink-0 text-[10px] font-black uppercase hover:underline text-indigo-100 ml-3">Remove</button>
                        </div>
                      )}

                      {showCommentBox && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <label className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                            <MessageSquare size={13} className="text-indigo-500" />
                            Comment
                            <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
                          </label>
                          <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Add a note for the signatory..."
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all resize-none"
                          />
                          <p className="text-[10px] text-slate-400 text-right">{comment.length}/500</p>
                        </div>
                      )}

                      {!commentAllowed && (
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3">
                          Comments are disabled for this requirement.
                        </p>
                      )}

                      <button
                        onClick={handleSubmit}
                        disabled={!selectedFile || isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 dark:bg-brand-500 text-white font-black rounded-2xl shadow-lg shadow-brand-200 dark:shadow-none hover:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 transition-all active:scale-95"
                      >
                        {isSubmitting ? "Uploading..." : (isPending || isRejected) ? "Resubmit File" : "Submit File"}
                        {!isSubmitting && <Send size={18} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {!uploadAllowed && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 p-5 rounded-r-xl flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">Upload Disabled</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    File upload is disabled for this requirement. Please follow the signatory instructions above.
                  </p>
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-6 flex gap-4">
              <Info className="text-indigo-500 dark:text-indigo-400 shrink-0" size={20} />
              <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                {isPhysical
                  ? "Visit the office listed above during the available schedule. Bring all required documents and have this clearance stamped."
                  : "Upload your file below. It will be reviewed by the signatory in the order received. You will be notified once your status is updated."}
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function NotFound({ router }: { router: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-200 dark:text-slate-800 uppercase tracking-tighter">Not Found</h1>
        <button onClick={() => router.back()} className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
          Return to Portal
        </button>
      </div>
    </div>
  );
}