"use client";
import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Info } from 'lucide-react';
import { useRouter } from "next/navigation";

const signatories = [
  { id: 1, role: 'Cashier', name: 'Rebecca C. Remulta', status: 'Approved', description: 'Responsible for verifying tuition and miscellaneous payments and stamping cash clearance.' },
  { id: 2, role: 'Librarian', name: 'Carmella C. Sarabello', status: 'Pending', description: 'Oversees book returns, overdue fines, and issuance of library clearance slips.' },
  { id: 13, role: 'Guidance Counselor', name: 'Maria L. Santos', status: 'Not Submitted', description: 'Requires exit interview and personality assessment completion.' },
  { id: 14, role: 'Clinic / Medical', name: 'Dr. Jose Rizal', status: 'Not Submitted', description: 'Verification of medical records and updated dental records.' },
  { id: 15, role: 'Sports Office', name: 'Coach Manny P.', status: 'Not Submitted', description: 'Return of borrowed sports equipment and uniforms.' },
  { id: 3, role: 'Director, SAS', name: 'Patricio S. Doroy, PhD', status: 'Approved', description: 'Leads Student Affairs Services review.' },
  { id: 4, role: 'Dean', name: 'Rey Anthony G. Godmalin', status: 'Pending', description: 'Responsible for endorsing graduation eligibility.' },
];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('All Statuses');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

  const filters = ['All Statuses', 'Approved', 'Pending', 'Not Submitted'];

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

  const filteredData = signatories.filter(item =>
    activeFilter === 'All Statuses' ? true : item.status.trim() === activeFilter
  );

  return (
    <div className="bg-gray-50 min-h-screen min-w-full relative">
      {/* --- STICKY HEADER --- */}
      <div
        className={`sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 md:px-10 py-4 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <h2 className="text-xl font-bold text-gray-800">Signatories Dashboard</h2>

          {/* --- FILTER BUTTONS --- */}
          <div className="flex flex-wrap gap-2 relative z-50">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              const isNotSubmitted = filter === 'Not Submitted';

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    color: !isActive && isNotSubmitted ? '#dc2626' : undefined,
                    borderColor: !isActive && isNotSubmitted ? '#dc2626' : undefined
                  }}
                  className={`px-4 py-1 rounded-full border text-xs font-semibold transition-all shadow-sm ${
                    isActive
                      ? 'bg-[#A855F7] text-white border-[#A855F7]'
                      : filter === 'Approved'
                      ? 'bg-white text-green-600 border-green-500'
                      : filter === 'Pending'
                      ? 'bg-white text-orange-500 border-orange-400'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((person) => (
              <SignatoryCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignatoryCard({ person }: { person: any }) {
  const router = useRouter();
  const currentStatus = person.status?.trim();
  const isApproved = currentStatus === 'Approved';
  const isPending = currentStatus === 'Pending';
  const isNotSubmitted = currentStatus === 'Not Submitted';

  const getHeaderStyle = () => {
    if (isApproved) return { backgroundColor: '#10B981' };
    if (isPending) return { backgroundColor: '#F59E0B' };
    if (isNotSubmitted) return { backgroundColor: '#ef4444' };
    return { backgroundColor: '#9ca3af' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden transition-all hover:shadow-md group">
      <button 
        onClick={() => router.push(`/student/signatories/${person.id}`)}
        style={getHeaderStyle()}
        className="p-4 flex justify-between items-center text-white text-left w-full transition-opacity hover:opacity-95"
      >
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-base leading-tight truncate">{person.role}</h3>
            <Info size={14} className="opacity-70" />
          </div>
          <p className="text-[11px] opacity-90 truncate">{person.name}</p>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-white/40 bg-gray-100 overflow-hidden shrink-0 shadow-sm">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      <div className="p-5 flex-1 min-h-[100px]">
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
          {person.description}
        </p>
      </div>

      <div className="p-4 border-t border-gray-50 flex justify-between items-center">
        <span 
          style={{ color: isNotSubmitted ? '#dc2626' : undefined }}
          className={`text-[10px] font-black tracking-widest uppercase ${
            isApproved ? 'text-green-600' : isPending ? 'text-amber-500' : ''
          }`}
        >
          {isApproved && '● APPROVED'}
          {isPending && '○ PENDING FOR APPROVAL'}
          {isNotSubmitted && '× NOT SUBMITTED'}
        </span>

        <div className="flex gap-1.5">
          <button className="p-1.5 bg-gray-50 rounded-md text-gray-400">
            <Search size={16} />
          </button>
          <button className="p-1.5 bg-gray-50 rounded-md text-gray-400">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}