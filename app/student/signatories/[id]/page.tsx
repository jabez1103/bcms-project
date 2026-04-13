"use client";

import { useParams, useRouter } from "next/navigation";
import { signatories } from "@/lib/mock-data/id/signatories"; 
import { ArrowLeft, CheckCircle2, BookOpen,  Info, AlertCircle, XCircle, Clock, Send, Upload, X } from "lucide-react";
import { useState } from "react";

export default function SignatoryDetails() {
  const params = useParams();
  const router = useRouter();
  const signatory = signatories.find((s) => s.id === Number(params.id));

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRequirement, setActiveRequirement] = useState<string | null>(null);

  if (!signatory) return <NotFound router={router} />;

  const status = signatory.status || "Not Submitted";
  const subStatus = signatory.subStatus || "";

  const isApproved = status === 'Approved';
  const isPending = status === 'Pending' && subStatus === 'In Queue';
  const isRejected = status === 'Pending' && subStatus === 'Rejected';

  const getStatusUI = () => {
    if (isApproved) return { label: 'Approved', icon: CheckCircle2, bg: 'bg-green-500' };
    if (isPending) return { label: 'In Queue', icon: Clock, bg: 'bg-amber-500' };
    if (isRejected) return { label: 'Rejected', icon: XCircle, bg: 'bg-red-500' };
    return { label: 'Not Submitted', icon: Info, bg: 'bg-slate-400' };
  };
  const ui = getStatusUI();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setIsSubmitting(true);
    await new Promise(res => setTimeout(res, 1500));
    alert(`Submitted successfully!`);
    setSelectedFiles(null);
    setIsSubmitting(false);
    setActiveRequirement(null);
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
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 ${ui.bg} text-white shadow-sm`}>
                <ui.icon size={12} />
                {ui.label}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{signatory.role}</h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{signatory.description}</p>
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {signatory.person.avatar ? (
                      <img src={signatory.person.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">{signatory.person.name.charAt(0)}</div>
                    )}
                    <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Authorized Signatory</p>
                    <p className="text-lg font-bold text-gray-900">{signatory.person.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. If Rejected, show comment */}
            {isRejected && (
              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl flex gap-4">
                <AlertCircle className="text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Correction Required</h4>
                  <p className="text-sm text-red-700 mt-1 italic">"{signatory.rejectionComment || "Uploaded file is incorrect."}"</p>
                </div>
              </div>
            )}

            {/* 2. REQUIREMENT PICKER OR UPLOAD SECTION */}
            {!activeRequirement ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                      <BookOpen size={18} />
                    </div>
                    <h3 className="font-bold text-gray-900">Requirements List</h3>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{signatory.requirements?.length} Documents</span>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-6 font-medium">Select a document type below to start your submission:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {signatory.requirements?.map((req, i) => (
                      <button 
                        key={i} 
                        disabled={isApproved}
                        onClick={() => setActiveRequirement(req)}
                        className={`flex items-center text-left gap-4 p-6 rounded-2xl border transition-all ${
                          isApproved 
                            ? 'bg-green-50/30 border-green-100 opacity-60 cursor-default' 
                            : 'bg-white border-gray-100 hover:border-indigo-400 hover:bg-indigo-50/30 group'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isApproved ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                           {isApproved ? <CheckCircle2 size={20} /> : <Upload size={20} />}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{req}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* THE UPLOAD INTERFACE (Centered in column, no modal) */
              <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-indigo-50/50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <Upload size={18} className="text-indigo-600" />
                     <span className="font-bold text-indigo-900">Document Upload</span>
                   </div>
                   <button 
                    onClick={() => setActiveRequirement(null)}
                    className="p-2 hover:bg-indigo-100 text-indigo-400 rounded-full transition-colors"
                   >
                     <X size={20} />
                   </button>
                </div>

                <div className="p-8 max-w-xl mx-auto text-center">
                  <div className="mb-8">
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                      Submit {activeRequirement}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                      Make sure your file is clear and readable before submitting.
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 hover:border-indigo-400 transition-colors bg-gray-50 group mb-6">
                    <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Send size={28} className="text-indigo-500 rotate-[-45deg]" />
                      </div>
                      <span className="text-base font-bold text-gray-900">Drag & Drop or Click to browse</span>
                      <span className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Supports PDF, JPG, PNG (Max 10MB)</span>
                    </label>
                  </div>

                  {selectedFiles && (
                    <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl flex items-center justify-between mb-8 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-bold">{selectedFiles.length} file(s) selected</span>
                      </div>
                      <button onClick={() => setSelectedFiles(null)} className="text-[10px] font-black uppercase hover:underline">Remove</button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setActiveRequirement(null)}
                      className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedFiles || isSubmitting}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isSubmitting ? "Uploading..." : "Submit File"}
                      {!isSubmitting && <Send size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-indigo-50 rounded-2xl p-6 flex gap-4">
              <Info className="text-indigo-500 shrink-0" size={20} />
              <p className="text-xs text-indigo-700 leading-relaxed font-medium">
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