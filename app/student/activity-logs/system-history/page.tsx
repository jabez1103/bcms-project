"use client";
import React from 'react';
import { Search, ChevronDown, Clock, Filter, History, ArrowUpRight, ShieldCheck, UserCog, Key, ShieldAlert } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
}
interface PaginationButtonProps {
  children: React.ReactNode;
}

const StudentAuditTrail = () => {
  // Logic-focused data reflecting User Activities & Record Changes
  const auditLogs = [
    {
      id: 1,
      user: "Monique Cantarona",
      email: "monique.cantarona@bisu.edu.ph",
      role: "Student",
      type: "Security",
      action: "User logged in: Successful session established via Web (Chrome/Windows)",
      status: "Success",
      timestamp: "Apr 11, 2026 • 02:30 PM",
      avatar: "/monique.png", // Ensure this path is correct in your public folder
      statusStyles: "bg-emerald-50 text-emerald-700 border-emerald-100",
      accent: "hover:border-emerald-500",
      icon: <ShieldCheck className="w-3 h-3" />
    },
    {
      id: 2,
      user: "Monique Cantarona",
      email: "monique.cantarona@bisu.edu.ph",
      role: "Student",
      type: "Data",
      action: "Student information updated: Profile contact details modified by user",
      status: "Updated",
      timestamp: "Apr 11, 2026 • 10:15 AM",
      avatar: "/monique.png",
      statusStyles: "bg-blue-50 text-blue-700 border-blue-100",
      accent: "hover:border-blue-500",
      icon: <UserCog className="w-3 h-3" />
    },
    {
      id: 3,
      user: "Monique Cantarona",
      email: "monique.cantarona@bisu.edu.ph",
      role: "Student",
      type: "Security",
      action: "Password changed: User successfully updated account credentials",
      status: "Secured",
      timestamp: "Apr 09, 2026 • 04:50 PM",
      avatar: "/monique.png",
      statusStyles: "bg-indigo-50 text-indigo-700 border-indigo-100",
      accent: "hover:border-indigo-500",
      icon: <Key className="w-3 h-3" />
    },
    {
      id: 4,
      user: "Monique Cantarona",
      email: "monique.cantarona@bisu.edu.ph",
      role: "System",
      type: "Alert",
      action: "Failed login attempt: Multiple incorrect password entries detected",
      status: "Blocked",
      timestamp: "Apr 08, 2026 • 11:20 PM",
      avatar: "/monique.png",
      statusStyles: "bg-rose-50 text-rose-700 border-rose-100",
      accent: "hover:border-rose-500",
      icon: <ShieldAlert className="w-3 h-3" />
    }
  ];

  return (
    <div className="w-full p-1 lg:p-2 bg-transparent font-sans">
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        
        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
               <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <History className="w-4 h-4 text-indigo-600" />
               </div>
               <h1 className="text-lg font-bold text-slate-900 tracking-tight">System History</h1>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 pl-9 font-medium uppercase tracking-wider">
              System Audit — Tracking logins and record modifications
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-center">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search history logs..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/5 text-black"
              />
            </div>
            <FilterDropdown label="All Activities" />
            <FilterDropdown label="Date Range" />
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50 bg-slate-50/30">
                <th className="px-6 py-4 font-black">User Account</th>
                <th className="px-6 py-4 font-black">Category</th>
                <th className="px-6 py-4 font-black">Activity Description</th>
                <th className="px-6 py-4 font-black">Result</th>
                <th className="px-6 py-4 font-black text-right">Timestamp</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {auditLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className={`group transition-all duration-200 border-l-[4px] border-transparent ${log.accent} hover:bg-slate-50/80`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {/* HD Profile Shape */}
                        <div className="w-10 h-10 rounded-xl border-2 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform duration-300">
                           <img src={log.avatar} className="w-full h-full object-cover antialiased" alt={log.user} />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          log.type === 'Alert' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[13px] leading-tight group-hover:text-indigo-600 transition-colors">{log.user}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{log.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        log.type === 'Security' ? 'bg-slate-100 text-slate-600' : 
                        log.type === 'Data' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {log.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                        {log.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 max-w-[340px] leading-relaxed font-medium">
                      {log.action}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm ${log.statusStyles}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors">
                        {log.timestamp.split('•')[1]}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />
                      </div>
                      <div className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">{log.timestamp.split('•')[0]}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-100 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Security logs are encrypted and verified by <span className="text-indigo-600">BISU-IT Center</span>
          </p>
          
          <div className="flex items-center gap-2">
            <PaginationButton>Prev</PaginationButton>
            <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-[10px] font-black shadow-lg shadow-indigo-200 active:scale-90 transition-transform">1</button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-white hover:shadow-sm transition-all">2</button>
            <PaginationButton>Next</PaginationButton>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const FilterDropdown = ({ label }: FilterDropdownProps) => (
  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
    {label}
    <ChevronDown className="w-3 h-3 text-slate-400" />
  </button>
);

const PaginationButton = ({ children }: PaginationButtonProps) => (
  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 shadow-sm">
    {children}
  </button>
);

export default StudentAuditTrail;