"use client";

import React, { useState } from "react";
import {
  User, Mail, Phone, MapPin, Building2, 
  CheckCircle2, KeyRound, BookOpen, Layers, 
  CreditCard, ShieldCheck, Clock, AlertCircle, 
  XCircle, Lock, Edit2, Save, X
} from "lucide-react";

/* ---------------- MOCK DATA ---------------- */
const INITIAL_DATA = {
  fullName: "Monique Cantarona",
  schoolId: "BCMS-2024-0047",
  campus: "Clarin Campus",
  program: "BSCS",
  yearLevel: "3rd Year",
  section: "B",
  isEligible: false,
  email: "monique.cantarona@bisu.edu.ph",
  phone: "+63 917 555 0123",
  address: "Bongtoongbod, Clarin, Bohol",
  birthdate: "October 27, 2005",
  gender: "Female",
  joinedDate: "Aug 12, 2021",
  lastLogin: "Apr 8, 2026 • 09:14 AM",
};

export default function ProfilePage() {
  // State for editable fields
  const [email, setEmail] = useState(INITIAL_DATA.email);
  const [phone, setPhone] = useState(INITIAL_DATA.phone);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for password change (simple simulation)
  const [showPassModal, setShowPassModal] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "" });

  const handleSave = () => {
    // Logic to save to database would go here
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-white pb-6 sm:pb-12 font-sans text-slate-900">
      <div className="w-full h-24 sm:h-40 bg-gradient-to-r from-indigo-500 to-purple-600" />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-10 -mt-12 sm:-mt-16 relative z-10">
        
        {/* HEADER CARD */}
        <header className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img src="/monique.png" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 sm:border-4 border-white shadow-sm" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-3xl font-bold text-slate-800 tracking-tight">{INITIAL_DATA.fullName}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
                  Student Account
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Since {INITIAL_DATA.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Save size={14} /> Save Changes
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4 px-1 text-slate-800">
                <User className="text-indigo-500" size={18} />
                <h2 className="text-md sm:text-lg font-bold uppercase tracking-tight">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* READ ONLY FIELDS (Admin only/Static) */}
                <InfoItem label="School ID" value={INITIAL_DATA.schoolId} icon={<CreditCard size={14}/>} />
                <InfoItem label="Program" value={INITIAL_DATA.program} icon={<BookOpen size={14}/>} />
                <InfoItem label="Year & Section" value={`${INITIAL_DATA.yearLevel} - ${INITIAL_DATA.section}`} icon={<Layers size={14}/>} />
                <InfoItem label="Campus" value={INITIAL_DATA.campus} icon={<Building2 size={14}/>} />
                
                {/* EDITABLE FIELDS */}
                <div className={`p-3 sm:p-4 rounded-xl border transition-all ${isEditing ? "bg-white border-indigo-300 ring-2 ring-indigo-50" : "bg-slate-50/50 border-slate-100"}`}>
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-indigo-400" />
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-700 outline-none"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-bold text-slate-700">{email}</p>
                    )}
                  </div>
                </div>

                <div className={`p-3 sm:p-4 rounded-xl border transition-all ${isEditing ? "bg-white border-indigo-300 ring-2 ring-indigo-50" : "bg-slate-50/50 border-slate-100"}`}>
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-indigo-400" />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-700 outline-none"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-bold text-slate-700">{phone}</p>
                    )}
                  </div>
                </div>

                <InfoItem label="Address" value={INITIAL_DATA.address} icon={<MapPin size={14}/>} colSpan={2} />
              </div>
            </section>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* ELIGIBILITY CARD */}
            <div className={`p-4 sm:p-6 rounded-2xl border-2 flex items-center gap-4 ${INITIAL_DATA.isEligible ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
               <div className={`p-3 rounded-full ${INITIAL_DATA.isEligible ? "bg-emerald-500" : "bg-rose-500"} text-white shadow-lg`}>
                {INITIAL_DATA.isEligible ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div>
                <h3 className={`font-black uppercase tracking-widest text-[9px] ${INITIAL_DATA.isEligible ? "text-emerald-600" : "text-rose-600"}`}>Clearance Status</h3>
                <p className="text-lg font-bold text-slate-800">{INITIAL_DATA.isEligible ? "Eligible" : "Not Eligible"}</p>
              </div>
            </div>

            {/* SECURITY BOX */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-3 text-slate-800">
                  <ShieldCheck size={16} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Security</span>
                </div>
                
                <button 
                  onClick={() => setShowPassModal(true)}
                  className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl group active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <KeyRound size={16} className="text-slate-400 group-hover:text-indigo-500" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700">Update Password</span>
                  </div>
                  <Lock size={12} className="text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PASSWORD MODAL (Simple UI) */}
      {showPassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800">Change Password</h3>
              <button onClick={() => setShowPassModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 text-sm outline-indigo-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 text-sm outline-indigo-500" />
              </div>
              <button 
                onClick={() => setShowPassModal(false)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, icon, colSpan = 1 }: { label: string; value: string; icon?: React.ReactNode; colSpan?: number }) {
  return (
    <div className={`bg-slate-50/50 p-3 sm:p-4 rounded-xl border border-slate-100 ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        {icon && <span className="text-indigo-400/70 shrink-0">{icon}</span>}
        <p className="text-xs sm:text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}