"use client";

import React from "react";
import {
  User, Mail, Phone, MapPin, Building2, 
  CheckCircle2, KeyRound, BookOpen, Layers, 
  CreditCard, ShieldCheck, Clock, AlertCircle, 
  XCircle, Lock, Edit2, Save, X
} from "lucide-react";


/* ---------------- MOCK DATA ---------------- */

const userData = {
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

const recentActivities = [
  { id: "1", type: "Clearance Requirements", status: "Approved", date: "Oct 12, 2025" },
  { id: "2", type: "Clearance Requirements", status: "Pending", date: "Nov 05, 2025" },
  { id: "3", type: "Clearance Requirements", status: "Approved", date: "Jan 20, 2026" },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white pb-6 sm:pb-12 font-sans text-slate-900">
      <div className="w-full h-24 sm:h-40 bg-gradient-to-r from-indigo-500 to-purple-600" />

        {/* CONTENT */}
        <div className="
          px-4
          sm:px-6
          lg:px-10
          -mt-14 sm:-mt-16
          pb-10 sm:pb-14
          max-w-[1400px]
          mx-auto
        ">

          {/* PROFILE HEADER */}
          <header className="
            bg-white rounded-2xl
            p-4 sm:p-6
            shadow-lg border border-slate-100
            flex flex-col lg:flex-row
            items-center lg:items-center
            justify-between
            gap-5 sm:gap-6
            mb-8
          ">

            <div className="
              flex flex-col sm:flex-row
              items-center
              gap-4 sm:gap-6
              text-center sm:text-left
              w-full
            ">

              {/* AVATAR */}
              <div className="relative shrink-0">
                <div className="
                  w-20 h-20
                  sm:w-24 sm:h-24
                  md:w-28 md:h-28
                  rounded-full overflow-hidden
                  border-4 border-white shadow-md
                ">
                  <img
                    src="/monique.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-4 border-white" />
              </div>

              {/* NAME */}
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                  {userData.fullName}
                </h1>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {userData.role}
                  </span>

                  <span className="text-xs text-slate-400">
                    Member since {userData.joinedDate}
                  </span>
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

                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-4
                  bg-slate-50/50
                  p-4 sm:p-6
                  rounded-3xl border border-slate-100
                ">
                  <InfoItem label="Full Name" value={userData.fullName} icon={<User size={16}/>} />
                  <InfoItem label="School ID" value={userData.barangayId} icon={<CreditCard size={16}/>} />
                  <InfoItem label="Email Address" value={userData.email} icon={<Mail size={16}/>} />
                  <InfoItem label="Contact Number" value={userData.phone} icon={<Phone size={16}/>} />
                  <InfoItem label="Current Address" value={userData.address} icon={<MapPin size={16}/>} />
                  <InfoItem label="Birthdate" value={userData.birthdate} icon={<Calendar size={16}/>} />
                  <InfoItem label="Gender" value={userData.gender} />
                  <InfoItem label="Civil Status" value={userData.civilStatus} />
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

                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-4
                  bg-slate-50/50
                  p-4 sm:p-6
                  rounded-3xl border border-slate-100
                ">
                  <InfoItem label="Username" value={`@${userData.username}`} />
                  <InfoItem label="Verification" value={userData.status} />
                  <InfoItem label="Last Login" value={userData.lastLogin} />
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