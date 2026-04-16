"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Info } from "lucide-react";
//import { signatories } from "@/lib/mock-data/id/signatories";


type Signatory = {
  id: number;
  role: string;
  name: string;
  description: string;
  status: string;
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
    Approved:      { class: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <CheckCircle2 size={11} /> },
    Pending:       { class: "bg-amber-50 text-amber-600 border-amber-100",       icon: <Clock size={11} /> },
    Rejected:      { class: "bg-rose-50 text-rose-600 border-rose-100",          icon: <AlertCircle size={11} /> },
    "Not Submitted": { class: "bg-slate-50 text-slate-500 border-slate-100",     icon: <Info size={11} /> },
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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading signatories...</p>
    </div>
  );

  if (signatories.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-sm">No active clearance period found.</p>
    </div>
  );


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Signatories</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signatories.map((sig) => (
          <Link key={sig.id} href={`/student/signatories/${sig.id}`}>
            <div className="border border-slate-100 rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer bg-white group">

              <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {sig.role}
              </p>
              <p className="text-sm text-slate-500 mt-0.5 mb-3">
                {sig.name}
              </p>

              <StatusBadge status={sig.status} />

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}