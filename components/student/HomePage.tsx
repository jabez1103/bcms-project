"use client";
import React, { useState, useEffect } from 'react';
import { Info, CheckCircle2, Clock, AlertCircle, ArrowRight, LayoutGrid, List, Sparkles } from 'lucide-react';
import { useRouter } from "next/navigation";
import { SkeletonSignatoryCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";


/*
const signatories = [
  { id: 1, role: 'Cashier', name: 'Rebecca C. Remulta', status: 'Approved', description: 'Responsible for verifying tuition and miscellaneous payments and stamping cash clearance.' },
  { id: 2, role: 'Librarian', name: 'Carmella C. Sarabello', status: 'Pending', description: 'Oversees book returns, overdue fines, and issuance of library clearance slips.' },
  { id: 13, role: 'Guidance Counselor', name: 'Maria L. Santos', status: 'Not Submitted', description: 'Requires exit interview and personality assessment completion.' },
  { id: 14, role: 'Clinic / Medical', name: 'Dr. Jabez Bautista', status: 'Not Submitted', description: 'Verification of medical records and updated dental records.' },
  { id: 15, role: 'Sports Office', name: 'Coach Manny P.', status: 'Not Submitted', description: 'Return of borrowed sports equipment and uniforms.' },
  { id: 3, role: 'Director, SAS', name: 'Patricio S. Doroy, PhD', status: 'Approved', description: 'Leads Student Affairs Services review.' },
  { id: 4, role: 'Dean', name: 'Rey Anthony G. Godmalin', status: 'Pending', description: 'Responsible for endorsing graduation eligibility.' },
];
*/

type Signatory = {
  id: number;
  role: string;
  name: string;
  description: string;
  status: string;
  title?: string;
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('All Statuses');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const filters = ['All Statuses', 'Approved', 'Pending', 'Rejected', 'Not Submitted'];

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/student/clearance-status");
      const data = await res.json();
      if (data.success) setSignatories(data.signatories);
      setLoading(false);
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  const filteredData = signatories.filter(item => {
    if (activeFilter === 'All Statuses') return true;
    const normalized = normalizedStatus(item.status);
    return normalized === activeFilter;
  });
    //activeFilter === 'All Statuses' ? true : item.status.trim() === activeFilter

  if (loading) return (
    <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen min-w-full relative font-sans">
      <div className="p-2 sm:p-4 md:p-10 pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-950 min-h-screen relative font-sans transition-colors duration-300">
      <PageHeader
        title="Clearance Status"
        description="Monitor your institutional clearances and department approvals in real-time."
        icon={Sparkles}
        actions={
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <List size={18} />
            </button>
          </div>
        }
      />

      <div className="max-w-[1600px] mx-auto p-2 sm:p-4 md:p-10">
        {/* --- FILTERS --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit shadow-inner">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm scale-105'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        <div className="max-w-7xl mx-auto">
          {filteredData.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No requirements found.</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
              {/* Mobile-first table list (no horizontal scroll) */}
              <div className="block md:hidden divide-y divide-slate-50 dark:divide-slate-800/60">
                {filteredData.map((req) => (
                  <MobileRequirementRow key={req.id} requirement={req} />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Requirement</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Office / Department</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredData.map((req) => (
                      <RequirementRow key={req.id} requirement={req} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredData.map((req) => (
                <SignatoryCard key={req.id} person={req} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizedStatus(status: string): string {
  switch (status?.toLowerCase()) {
    case 'approved': return 'Approved';
    case 'pending': return 'Pending';
    case 'rejected': return 'Rejected';
    case 'not_submitted': return 'Not Submitted';
    default: return 'Not Submitted';
  }
}

function RequirementRow({ requirement }: { requirement: Signatory }) {
  const router = useRouter();
  const currentStatus = normalizedStatus(requirement.status);

  const getTheme = () => {
    if (currentStatus === 'Approved') return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    if (currentStatus === 'Pending') return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    if (currentStatus === 'Rejected') return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
    return "bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  };

  const getIndicator = () => {
    if (currentStatus === 'Approved') return "bg-emerald-500";
    if (currentStatus === 'Pending') return "bg-amber-500 animate-pulse";
    if (currentStatus === 'Rejected') return "bg-rose-500";
    return "bg-slate-400";
  };

  return (
    <tr className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all">
      <td className="px-8 py-5">
        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {requirement.title || "Requirement"}
        </p>
        {requirement.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{requirement.description}</p>
        )}
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-[10px] border border-brand-100 dark:border-brand-500/20">
            {(requirement.role || "U").charAt(0)}
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{requirement.role || "Unknown Office"}</p>
        </div>
      </td>
      <td className="px-8 py-5 text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getTheme()}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${getIndicator()}`} />
          {currentStatus === 'Not Submitted' ? 'NOT SUBMITTED' : currentStatus}
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <button 
          onClick={() => router.push(`/student/signatories/${requirement.id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-500/50 hover:shadow-sm transition-all active:scale-95 group/btn"
        >
          VIEW DETAILS
          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
      </td>
    </tr>
  );
}

function MobileRequirementRow({ requirement }: { requirement: Signatory }) {
  const router = useRouter();
  const currentStatus = normalizedStatus(requirement.status);

  const getTheme = () => {
    if (currentStatus === 'Approved') return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    if (currentStatus === 'Pending') return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    if (currentStatus === 'Rejected') return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
    return "bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  };

  const getIndicator = () => {
    if (currentStatus === 'Approved') return "bg-emerald-500";
    if (currentStatus === 'Pending') return "bg-amber-500 animate-pulse";
    if (currentStatus === 'Rejected') return "bg-rose-500";
    return "bg-slate-400";
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
            {requirement.title || "Requirement"}
          </p>
          {requirement.description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">
              {requirement.description}
            </p>
          )}
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shrink-0 ${getTheme()}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${getIndicator()}`} />
          {currentStatus === 'Not Submitted' ? 'NOT SUBMITTED' : currentStatus}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-[10px] border border-brand-100 dark:border-brand-500/20 shrink-0">
            {(requirement.role || "U").charAt(0)}
          </div>
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide truncate">
            {requirement.role || "Unknown Office"}
          </p>
        </div>

        <button
          onClick={() => router.push(`/student/signatories/${requirement.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[9px] font-bold text-slate-700 dark:text-slate-200 uppercase"
        >
          DETAILS
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function SignatoryCard({ person }: { person: Signatory }) {
  const router = useRouter();
  const currentStatus = normalizedStatus(person.status);
  const isApproved = currentStatus === 'Approved';
  const isPending = currentStatus === 'Pending';
  const isRejected = currentStatus === 'Rejected';
  const isNotSubmitted = currentStatus === 'Not Submitted';

  const getTheme = () => {
    if (isApproved) return { color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', icon: <CheckCircle2 size={12}/> };
    if (isPending) return { color: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', icon: <Clock size={12}/> };
    if (isRejected) return { color: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400', icon: <AlertCircle size={12}/> };
    if (isNotSubmitted) return { color: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400', icon: <AlertCircle size={12}/> };
    return { color: 'bg-slate-400 dark:bg-slate-600', light: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', icon: null };
  };

  const theme = getTheme();
  const fallbackRole = person.role || "Unknown Office";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 group">
      {/* --- HEADER --- */}
      <div className={`${theme.color} p-5 flex justify-between items-center text-white`}>
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-bold text-[14px] tracking-tight leading-tight uppercase">{fallbackRole}</h3>
            <Info size={14} className="opacity-60" />
          </div>
          <p className="text-[12px] font-medium opacity-80 truncate">{person.name || "N/A"}</p>
        </div>
        <div className="w-11 h-11 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm overflow-hidden shrink-0 flex items-center justify-center font-black text-lg shadow-inner">
          {(person.name || fallbackRole).charAt(0)}
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="p-6 flex-1 min-h-[110px]">
        <h4 className="text-slate-800 dark:text-slate-100 font-bold text-sm mb-1.5">
          {person.title || "Requirement"}
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium line-clamp-4">
          {person.description || "No description provided."}
        </p>
      </div>

      {/* --- FOOTER --- */}
      <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.light} ${theme.text} font-bold text-[10px] tracking-wider uppercase`}>
          {theme.icon}
          {currentStatus === 'Not Submitted' ? 'NOT SUBMITTED' : currentStatus}
        </div>

        <button 
          onClick={() => router.push(`/student/signatories/${person.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-500/50 hover:shadow-sm transition-all active:scale-95 group/btn"
        >
          DETAILS
          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
