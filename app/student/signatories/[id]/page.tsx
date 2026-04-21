"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, BookOpen,  Info, AlertCircle, XCircle, Clock, Send, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { SkeletonDetailView } from "@/components/ui/Skeleton";


type SignatoryDetail = {
  id: number;
  role: string;
  description: string;
  signatory_name: string;
  signatory_avatar: string | null;
  status: string;
  rejection_comment: string | null;
  file_path: string | null;
  submission_id: number | null;
}

export default function SignatoryDetails() {
  const params = useParams();
  const router = useRouter();

  //const signatory = signatories.find((s) => s.id === Number(params.id));

  const [signatory, setSignatory] = useState<SignatoryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  //const [activeRequirement, setActiveRequirement] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const res = await fetch(`/api/student/clearance-status/${params.id}`);
      const data = await res.json();
      if (data.success) setSignatory(data.signatory);
      setLoading(false);
    };
    fetchDetail();
  }, [params.id]);

  if (loading) return <SkeletonDetailView />;

  if (!signatory) return <NotFound router={router} />;

  const normalizeStatus = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return 'Not Submitted';
    }
  };

  //const status = signatory.status || "Not Submitted";
  //const subStatus = signatory.subStatus || "";

  const status = normalizeStatus(signatory.status);
  const isApproved = status === 'Approved';
  const isPending = status === 'Pending' // && subStatus === 'In Queue';
  const isRejected = status === 'Rejected' // && subStatus === 'Rejected';

  const getStatusUI = () => {
    if (isApproved) return { label: 'Approved', icon: CheckCircle2, bg: 'bg-green-500' };
    if (isPending) return { label: 'In Queue', icon: Clock, bg: 'bg-amber-500' };
    if (isRejected) return { label: 'Rejected', icon: XCircle, bg: 'bg-red-500' };
    return { label: 'Not Submitted', icon: Info, bg: 'bg-slate-400' };
  };
  const ui = getStatusUI();
  /*
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };
  */

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("requirement_id", String(signatory.id));

    const res = await fetch("/api/student/submit", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setSuccessMsg("Submitted successfully! Awaiting review.");
      setSelectedFile(null);

      const updated = await fetch(`/api/student/clearance-status/${params.d}`);
      const updatedData = await updated.json();
      if (updatedData.success) setSignatory(updatedData.signatory);
    } else {
      alert(data.error || "Submission failed.");
    }

    setIsSubmitting(false);

    /*
    await new Promise(res => setTimeout(res, 1500));
    alert(`Submitted successfully!`);
    setSelectedFiles(null);
    setIsSubmitting(false);
    setActiveRequirement(null);
    */

  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors text-slate-900 dark:text-slate-100">
      {/* NAVIGATION */}
      <nav className="sticky top-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center z-20 transition-colors">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to Portal
        </button>
      </nav>
        
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Profile Info */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors">
              {/* Safety check on UI object */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 ${ui?.bg || 'bg-slate-500'} text-white shadow-sm`}>
                {ui?.icon && <ui.icon size={12} />}
                {ui?.label || 'Status'}
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{signatory.role}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{signatory.description}</p>
              
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {signatory.signatory_avatar ? (
                      <img src={signatory.signatory_avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        {signatory.signatory_name?.charAt(0) || "S"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Authorized Signatory</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{signatory.signatory_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Success message */}
            {successMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500 p-5 rounded-r-xl flex gap-4 transition-colors">
                <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{successMsg}</p>
              </div>
            )}

            {/* 1. If Rejected, show comment */}
            {isRejected && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border-l-4 border-rose-500 p-5 rounded-r-xl flex gap-4 transition-colors">
                <AlertCircle className="text-rose-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-400">Correction Required</h4>
                  <p className="text-sm text-rose-700 dark:text-rose-300 mt-1 italic">"{signatory.rejection_comment || "Uploaded file is incorrect."}"</p>
                </div>
              </div>
            )}

            {/* 2. REQUIREMENT PICKER OR UPLOAD SECTION */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
              <div className="bg-indigo-50/50 dark:bg-slate-800/50 px-8 py-4 border-b border-indigo-100 dark:border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                  <BookOpen size={18} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {isApproved ? "Submission Approved" : isPending ? "Awaiting Review" : "Upload Requirement"}
                </h3>
              </div>

              <div className="p-8 max-w-xl mx-auto text-center">
                {/* show existing file if already submitted */}
                {signatory.file_path && (
                  <div className="mb-6 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-left border border-slate-100 dark:border-slate-700 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Current Submission</p>
                    <a
                      href={signatory.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                    >
                      {signatory.file_path.split("/").pop()}
                    </a>
                  </div>
                )}

                {/* Hide upload if approved */}
                {!isApproved && (
                  <>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50 group mb-6">
                      <input 
                        type="file" 
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                        className="hidden" 
                        id="file-upload" 
                        accept=".pdf, .jpg, .jpeg, .png" 
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Send size={28} className="text-indigo-500 dark:text-indigo-400 rotate-[-45deg]" />
                        </div>
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">Drag & Drop or Click to browse</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-widest">PDF, JPG, PNG (Max 10MB)</span>
                      </label>
                    </div>

                    {selectedFile && (
                      <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-3 rounded-2xl flex items-center justify-between mb-6 shadow-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-bold">{selectedFile.name}</span>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-[10px] font-black uppercase hover:underline text-indigo-100">Remove</button>
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={!selectedFile || isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isSubmitting ? "Uploading..." : (isPending || isRejected) ? "Resubmit File" : "Submit File"}
                      {!isSubmitting && <Send size={18} />}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-6 flex gap-4 transition-colors">
              <Info className="text-indigo-500 dark:text-indigo-400 shrink-0" size={20} />
              <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                Files submitted are reviewed by the signatory in the order they are received. You will be notified via the portal dashboard once your status is updated.
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-200 dark:text-slate-800 uppercase tracking-tighter">Not Found</h1>
        <button onClick={() => router.back()} className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Return to Portal</button>
      </div>
    </div>
  );
}