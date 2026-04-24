"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Info } from "lucide-react";
import { SkeletonSignatoryCard } from "@/components/ui/Skeleton";


type Signatory = {
  id: number;
  role: string;
  name: string;
  academic_credentials: string | null;  
  description: string;
  status: string;
  title?: string;
}

function normalizeStatus(status: string) {
  switch (status?.toLowerCase()) {
    case 'approved': return 'Approved';
    case 'pending': return 'Pending';
    case 'rejected': return 'Rejected';
    default: return 'Not Submitted';
  }
}

function StatusBadge({ status }: { status: string }){
  const normalized = normalizeStatus(status);
  const styles: Record<string, { class: string; icon: React.ReactNode }> = {
    Approved:      { class: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20", icon: <CheckCircle2 size={11} /> },
    Pending:       { class: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",       icon: <Clock size={11} /> },
    Rejected:      { class: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",          icon: <AlertCircle size={11} /> },
    "Not Submitted": { class: "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800",     icon: <Info size={11} /> },
  };

  const s = styles[normalized] ?? styles["Not Submitted"];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${s.class}`}>
      {s.icon}
      {normalized}
    </span>
  );
}

export default function SignatoriesPage() {
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_signatories = async () => {
      const res = await fetch("/api/student/clearance-status");
      const data = await res.json();
      if (data.success) setSignatories(data.signatories);
      setLoading(false);
    };
    fetch_signatories();
  }, []);

  if (loading) return (
    <div className="p-6 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      <h1 className="text-2xl font-black mb-6 tracking-tight text-slate-900 dark:text-white uppercase">Signatories</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonSignatoryCard key={i} />
        ))}
      </div>
    </div>
  );

  if (signatories.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-sm">No active clearance period found.</p>
    </div>
  );


  return (
    <div className="p-6 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      <h1 className="text-2xl font-black mb-6 tracking-tight text-slate-900 dark:text-white uppercase">Signatories</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signatories.map((sig) => (
          <Link key={sig.id} href={`/student/signatories/${sig.id}`}>
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-5 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all cursor-pointer bg-white dark:bg-slate-900 group flex flex-col h-full">

              <div className="mb-4">
                <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase text-[14px]">
                  {sig.role}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {sig.name}
                </p>
              </div>

              <div className="flex-1 mb-5">
                {sig.title && <h4 className="text-slate-800 dark:text-slate-100 font-bold text-sm mb-1.5">{sig.title}</h4>}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {sig.description}
                </p>
              </div>

              <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                <StatusBadge status={sig.status} />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">DETAILS &rarr;</span>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}