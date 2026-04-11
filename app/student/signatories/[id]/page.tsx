"use client";

import { useParams, useRouter } from "next/navigation";
import { signatories } from "@/lib/mock-data/signatories"; 
import { ArrowLeft, CheckCircle2, BookOpen, Info, AlertCircle, XCircle, Clock, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";

export default function SignatoryDetails() {
  const params = useParams();
  const router = useRouter();
  const signatory = signatories.find((s) => s.id === Number(params.id));

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRequirement, setActiveRequirement] = useState<string | null>(null);

  const [windowSize, setWindowSize] = useState<{ width: number; height: number } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      const modalW = Math.min(420, width * 0.95);
      setPosition({
        x: (width / 2) - (modalW / 2),
        y: (height / 2) - 200,
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveRequirement(null);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!signatory) return <NotFound router={router} />;

  const status = signatory.status || "Not Submitted";
  const subStatus = signatory.subStatus || "";

  const isApproved = status === 'Approved';
  const isPending = status === 'Pending' && subStatus === 'In Queue';
  const isRejected = status === 'Pending' && subStatus === 'Rejected';

  const getStatusUI = () => {
    if (isApproved) return { color: 'green', label: 'Approved', icon: CheckCircle2, bg: 'bg-green-500' };
    if (isPending) return { color: 'amber', label: 'In Queue', icon: Clock, bg: 'bg-amber-500' };
    if (isRejected) return { color: 'red', label: 'Rejected', icon: XCircle, bg: 'bg-red-500' };
    return { color: 'slate', label: 'Not Submitted', icon: Info, bg: 'bg-slate-400' };
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
    <div className="min-h-screen bg-white relative">
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
        
      {/* MAIN CONTENT */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Single Signatory Profile */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 ${ui.bg} text-white shadow-sm`}>
                <ui.icon size={12} />
                {ui.label}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{signatory.role}</h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{signatory.description}</p>
              
              {/* --- SINGLE PROFILE SECTION --- */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {signatory.person.avatar ? (
                      <img 
                        src={signatory.person.avatar} 
                        alt={signatory.person.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-lg ring-1 ring-gray-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-1 ring-gray-100">
                        {signatory.person.name.charAt(0)}
                      </div>
                    )}
                    {/* Pulsing Online Indicator */}
                    <span className="absolute bottom-1 right-1 block h-5 w-5 rounded-full bg-green-500 ring-4 ring-white" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">
                      Authorized Signatory
                    </p>
                    <p className="text-xl font-bold text-gray-900 leading-tight">
                      {signatory.person.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Available Now</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info Card */}
                <div className="mt-8 space-y-3">
                    <div className="px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Official Email</span>
                        <span className="text-xs font-bold text-gray-700">{signatory.person.email || "dept@bisu.edu.ph"}</span>
                    </div>
                    <div className="px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Response Time</span>
                        <span className="text-xs font-bold text-indigo-600">~1 Hour</span>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Requirements List */}
          <div className="lg:col-span-8 space-y-6">
            {isRejected && (
              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl flex gap-4 animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Correction Required</h4>
                  <p className="text-sm text-red-700 mt-1 italic font-medium">
                    "{signatory.rejectionComment || "Uploaded file is incorrect. Please re-check."}"
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900">Submission Requirements</h3>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                  {signatory.requirements?.length} Documents
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {signatory.requirements?.map((req, i) => (
                    <div 
                      key={i} 
                      onClick={() => !isApproved && setActiveRequirement(req)}
                      className={`flex items-center gap-4 p-6 rounded-2xl border transition-all ${
                        isApproved 
                          ? 'bg-green-50/30 border-green-100 cursor-default' 
                          : 'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-md cursor-pointer group'
                      }`}
                    >
                      {isApproved ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <CheckCircle2 size={14} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-indigo-500 transition-colors" />
                      )}
                      <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-700 transition-colors">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* DRAGGABLE UPLOAD MODAL */}
      {activeRequirement && windowSize && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={() => setActiveRequirement(null)} />
          <Rnd
            size={{ width: Math.min(420, windowSize.width * 0.95), height: "auto" }}
            position={position}
            onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
            bounds="window"
            dragHandleClassName="handle"
            style={{ zIndex: 50, position: "fixed" }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden border border-gray-200">
              <div className="handle bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center cursor-move select-none">
                <span className="font-bold text-gray-900">Upload Document</span>
                <button onClick={() => setActiveRequirement(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">✕</button>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-sm text-gray-600">
                  Submit documents for <span className="font-bold text-gray-900 italic">"{activeRequirement}"</span>.
                </p>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors bg-gray-50/50">
                  <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-3">
                      <Send size={20} className="text-indigo-500 rotate-[-45deg]" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">Click to browse files</span>
                    <span className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Max 10MB per file</span>
                  </label>
                </div>

                {selectedFiles && (
                  <div className="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 flex items-center justify-between animate-in fade-in zoom-in-95">
                    <span className="text-xs font-bold text-indigo-700">{selectedFiles.length} file(s) ready</span>
                    <button onClick={() => setSelectedFiles(null)} className="text-[10px] font-bold uppercase text-indigo-400 hover:text-indigo-600">Clear</button>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!selectedFiles || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSubmitting ? "Uploading..." : "Submit to Signatory"}
                  <Send size={18} />
                </button>
              </div>
            </div>
          </Rnd>
        </>
      )}
    </div>
  );
}

function NotFound({ router }: { router: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-200">404</h1>
        <p className="text-gray-500 mt-2 font-medium">Record Missing</p>
        <button onClick={() => router.back()} className="mt-6 text-indigo-600 font-bold underline decoration-2 underline-offset-4">Go Back</button>
      </div>
    </div>
  );
}