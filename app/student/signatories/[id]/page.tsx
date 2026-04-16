"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, BookOpen,  Info, AlertCircle, XCircle, Clock, Send, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";


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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading details...</p>
    </div>
  );

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
    <div className="min-h-screen bg-white">
      {/* NAVIGATION */}
      <nav className="sticky top-0 border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center z-20">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to Portal
        </button>
      </nav>
        
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Profile Info */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              {/* Safety check on UI object */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 ${ui?.bg || 'bg-gray-500'} text-white shadow-sm`}>
                {ui?.icon && <ui.icon size={12} />}
                {ui?.label || 'Status'}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{signatory.role}</h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{signatory.description}</p>
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {signatory.signatory_avatar ? (
                      <img src={signatory.signatory_avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        {signatory.signatory_name?.charAt(0) || "S"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Authorized Signatory</p>
                    <p className="text-lg font-bold text-gray-900">{signatory.signatory_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Success message */}
            {successMsg && (
              <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-xl flex gap-4">
                <CheckCircle2 className="text-green-500 shrink-0" />
                <p className="text-sm font-bold text-green-800">{successMsg}</p>
              </div>
            )}

            {/* 1. If Rejected, show comment */}
            {isRejected && (
              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl flex gap-4">
                <AlertCircle className="text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Correction Required</h4>
                  <p className="text-sm text-red-700 mt-1 italic">"{signatory.rejection_comment || "Uploaded file is incorrect."}"</p>
                </div>
              </div>
            )}

            {/* 2. REQUIREMENT PICKER OR UPLOAD SECTION */}
            <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl overflow-hidden">
              <div className="bg-indigo-50/50 px-8 py-4 border-b border-indigo-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                  <BookOpen size={18} />
                </div>
                <h3 className="font-bold text-gray-900">
                  {isApproved ? "Submission Approved" : isPending ? "Awaiting Review" : "Upload Requirement"}
                </h3>
              </div>

              <div className="p-8 max-w-xl mx-auto text-center">
                {/* show existing file if already submitted */}
                {signatory.file_path && (
                  <div className="mb-6 bg-slate-50 rounded-2xl p-4 text-left border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Submission</p>
                    <a
                      href={signatory.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-indigo-600 hover:underline break-all"
                    >
                      {signatory.file_path.split("/").pop()}
                    </a>
                  </div>
                )}

                {/* Hide upload if approved */}
                {!isApproved && (
                  <>
                    <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 hover:border-indigo-400 transition-colors bg-gray-50 group mb-6">
                      <input 
                        type="file" 
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                        className="hidden" 
                        id="file-upload" 
                        accept=".pdf, .jpg, .jpeg, .png" 
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Send size={28} className="text-indigo-500 rotate-[-45deg]" />
                        </div>
                        <span className="text-base font-bold text-gray-900">Drag & Drop or Click to browse</span>
                        <span className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-widest">PDF, JPG, PNG (Max 10MB)</span>
                      </label>
                    </div>

                    {selectedFile && (
                      <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-bold">{selectedFile.name}</span>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-[10px] font-black uppercase hover:underline">Remove</button>
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={!selectedFile || isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isSubmitting ? "Uploading..." : (isPending || isRejected) ? "Resubmit File" : "Submit File"}
                      {!isSubmitting && <Send size={18} />}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-6 flex gap-4">
              <Info className="text-indigo-500 shrink-0" size={20} />
              <p className="text-sm text-indigo-900 leading-relaxed">
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-200 uppercase tracking-tighter">Not Found</h1>
        <button onClick={() => router.back()} className="mt-6 text-indigo-600 font-bold hover:underline">Return to Portal</button>
      </div>
    </div>
  );
}