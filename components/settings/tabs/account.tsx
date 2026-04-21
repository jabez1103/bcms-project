"use client";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShieldCheck, Lock, UserIcon, MapPin, Mail, Phone } from "lucide-react";
import { SkeletonDetailView } from "@/components/ui/Skeleton";

export default function ProfileContent() {
  const { user, loading } = useCurrentUser();
  
  // State for editable fields
  const [contactNumber, setContactNumber] = useState("09123456789");
  const [email, setEmail] = useState(user?.email || "jabez@bisu.edu.ph");

  if (loading) {
    return (
      <div className="py-8">
        <SkeletonDetailView />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-sm font-medium">Not logged in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. IDENTITY HEADER (Editable Photo) */}
      <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div className="relative group">
          <div className="w-28 h-28 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
            <img 
              src={(user as any).avatar || "/default-avatar.png"} 
              alt="Profile" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
         
        </div>
        
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h4 className="font-black text-2xl text-slate-800 dark:text-slate-100 tracking-tight">Jabez Bautista</h4>
            <ShieldCheck size={20} className="text-emerald-500" type="Verified Identity" />
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
              Student
            </span>
            <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
              Year 3 • Section A
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">BS Computer Science • BISU Clarin Campus</p>
        </div>
      </div>

      {/* 2. VIEW-ONLY SYSTEM RECORDS (Locked) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Lock size={14} className="text-slate-400" />
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">System Records (Read-Only)</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Legal Name", value: "Jabez Bautista", icon: <UserIcon size={16}/> },
            { label: "University ID", value: "2024-CLAR-0123", icon: <Lock size={14}/> },
            { label: "Program", value: "Bachelor of Science in Computer Science", icon: <Lock size={14}/> },
            { label: "Barangay", value: "Poblacion, Clarin", icon: <MapPin size={16}/> },
          ].map((field) => (
            <div key={field.label} className="group transition-all">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                {field.label}
              </label>
              <div className="mt-1.5 flex items-center justify-between w-full p-4 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed">
                {field.value}
                <Lock size={14} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* 3. EDITABLE CONTACT INFORMATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <UserIcon size={14} className="text-purple-500" />
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">Editable Information</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1 flex items-center gap-1">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-sm font-bold text-slate-700 dark:text-slate-200 transition-all"
            />
            <p className="text-[9px] text-slate-400 italic font-medium ml-1">* Changes may require Registrar approval</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1 flex items-center gap-1">
              <Phone size={12} /> Contact Number
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="09XXXXXXXXX"
              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-sm font-bold text-slate-700 dark:text-slate-200 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button className="flex-1 sm:flex-none px-10 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all hover:bg-slate-800 dark:hover:bg-slate-200 shadow-xl shadow-slate-200 dark:shadow-none">
          Save Changes
        </button>
        <button className="flex-1 sm:flex-none px-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
          Reset
        </button>
      </div>
    </div>
  );

}
