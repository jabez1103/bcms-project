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

  // Responsive modal state
  const [windowSize, setWindowSize] = useState<{ width: number; height: number } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Handle window resize & Escape key
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      const modalW = Math.min(400, width * 0.9);
      const modalH = 400;

      setPosition({
        x: (width / 2) - (modalW / 2),
        y: (height / 2) - (modalH / 2),
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
    alert(`Submitted ${selectedFiles.length} file(s) for "${activeRequirement}" successfully!`);
    setSelectedFiles(null);
    setIsSubmitting(false);
    setActiveRequirement(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] relative">
      {/* NAV */}
      <nav className="sticky top-0 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center z-20">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm sm:text-base font-medium text-black hover:text-purple-600 transition-colors group"
        >
          <ArrowLeft size={18} className="transition-transform text-black group-hover:-translate-x-1" />
          Back to Dashboard
        </button>
      </nav>
        
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 ${ui.bg} text-white`}>
                <ui.icon size={12} />
                {ui.label}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{signatory.role}</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2 leading-relaxed">{signatory.description}</p>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200">
                  {signatory.person.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Authorized Signatory</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">{signatory.person.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            {isRejected && (
              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl flex gap-4">
                <AlertCircle className="text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-red-900">Correction Required</h4>
                  <p className="text-sm sm:text-base text-red-700 mt-1 italic font-medium">
                    "{signatory.rejectionComment || "Uploaded file is incorrect. Please re-check."}"
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg text-white">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Submission Requirements</h3>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">{signatory.requirements?.length} Documents</span>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {signatory.requirements?.map((req, i) => (
                    <div 
                      key={i} 
                      onClick={() => setActiveRequirement(req)}
                      className={`cursor-pointer flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isApproved ? 'bg-green-50/50 border-green-100' : 'bg-white border-gray-100 hover:border-purple-200'
                      }`}
                    >
                      {isApproved ? (
                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                      )}
                      <span className="text-sm sm:text-base font-medium text-gray-700 leading-tight">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* --- DRAGGABLE MODAL --- */}
      {activeRequirement && windowSize && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setActiveRequirement(null)}
          />

          <Rnd
            size={{
              width: Math.min(400, windowSize.width * 0.9),
              height: "auto",
            }}
            position={position}
            onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
            bounds="window"
            minWidth={280}
            minHeight={300}
            dragHandleClassName="handle"
            style={{ zIndex: 50, position: "fixed" }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full p-4 sm:p-6 flex flex-col overflow-auto max-h-[90vh] border border-gray-200 text-black">
              {/* Drag handle */}
              <div className="handle bg-gray-50 border-b px-4 py-3 flex justify-between items-center cursor-move select-none">
                <span className="font-semibold text-black text-sm sm:text-base">Upload Requirement</span>
                <button
                  onClick={() => setActiveRequirement(null)}
                  className="text-black hover:text-gray-700 px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Modal content */}
              <div className="flex flex-col mt-4 gap-4">
                <p className="text-black text-sm sm:text-base">
                  Please upload the required documents for "{activeRequirement}".
                </p>

                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="bg-purple-50/50 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFiles || isSubmitting}
                  className="w-full flex justify-center gap-2 px-4 py-2 sm:py-3 font-bold rounded-xl shadow transition-all active:scale-95 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                  <Send size={16} />
                </button>
            </div>
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
        <p className="text-gray-500 mt-2">Signatory Record Missing</p>
        <button onClick={() => router.back()} className="mt-6 text-purple-600 font-bold underline">Go Back</button>
      </div>
    </div>
  );
}