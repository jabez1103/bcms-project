"use client";
import React, { useState, useEffect } from 'react';
import { Info, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from "next/navigation";


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
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('All Statuses');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const filters = ['All Statuses', 'Approved', 'Pending', 'Not Submitted'];

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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading clearance status...</p>
    </div>
  );


  return (
    <div className="bg-[#F8FAFC] min-h-screen min-w-full relative font-sans">
      {/* --- STICKY HEADER --- */}
      <div
        className={`sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 md:px-10 py-4 transition-all duration-500 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clerance Statuses</h2>
            <p className="text-[11px] text-slate-500 font-medium">Clearance Progress 2026</p>
          </div>

          <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-purple-600 shadow-sm scale-105'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {filteredData.length === 0 ? (
            <p>No results found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredData.map((person) => (
                <SignatoryCard key={person.id} person={person} />
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

function SignatoryCard({ person }: { person: Signatory }) {
  const router = useRouter();
  const currentStatus = normalizedStatus(person.status); //person.status?.trim();
  const isApproved = currentStatus === 'Approved';
  const isPending = currentStatus === 'Pending';
  const isNotSubmitted = currentStatus === 'Not Submitted';

  const getTheme = () => {
    if (isApproved) return { color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', icon: <CheckCircle2 size={12}/> };
    if (isPending) return { color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', icon: <Clock size={12}/> };
    if (isNotSubmitted) return { color: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', icon: <AlertCircle size={12}/> };
    return { color: 'bg-slate-400', light: 'bg-slate-50', text: 'text-slate-500', icon: null };
  };

  const theme = getTheme();

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 group">
      {/* --- HEADER --- */}
      <div className={`${theme.color} p-5 flex justify-between items-center text-white`}>
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-bold text-[14px] tracking-tight leading-tight uppercase">{person.role}</h3>
            <Info size={14} className="opacity-60" />
          </div>
          <p className="text-[12px] font-medium opacity-80 truncate">{person.name}</p>
        </div>
        <div className="w-11 h-11 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm overflow-hidden shrink-0 transform group-hover:scale-110 transition-transform duration-500">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${person.name}&backgroundColor=f8fafc`}
            alt="avatar"
            className="w-full h-full object-cover"
          />1
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="p-6 flex-1 min-h-[110px]">
        <p className="text-slate-500 text-xs leading-relaxed font-medium line-clamp-3">
          {person.description}
        </p>
      </div>

      {/* --- FOOTER --- */}
      <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.light} ${theme.text} font-bold text-[10px] tracking-wider uppercase`}>
          {theme.icon}
          {currentStatus === 'Not Submitted' ? 'NOT SUBMITTED' : currentStatus}
        </div>

        <button 
          onClick={() => router.push(`/student/signatories/${person.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:text-purple-600 hover:border-purple-200 hover:shadow-sm transition-all active:scale-95 group/btn"
        >
          DETAILS
          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
}