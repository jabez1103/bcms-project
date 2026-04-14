"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import React from "react";
import {
  User, Mail, Phone, MapPin, Calendar,
  ShieldCheck, Clock, CreditCard, Edit3, Lock, KeyRound, CheckCircle2, 
  History,
  XCircle
} from "lucide-react";


/* ---------------- MOCK DATA ---------------- */
/*
const userData = {
  fullName: "Monique Cantarona",
  role: "Student",
  status: "Verified",
  username: "monique.cantarona",
  email: "monique.cantarona@bisu.edu.ph",
  phone: "+63 917 555 0123",
  address: "Bongtoongbod, Clarin, Bohol",
  birthdate: "October 27, 2005",
  gender: "Female",
  civilStatus: "Single",
  barangayId: "BCMS-2024-0047",
  joinedDate: "Aug 12, 2021",
  lastLogin: "Apr 8, 2026 • 09:14 AM",
};
*/

const recentActivities = [
  { id: "1", type: "Clearance Requirements", status: "Approved", date: "Oct 12, 2025" },
  { id: "2", type: "Clearance Requirements", status: "Pending", date: "Nov 05, 2025" },
  { id: "3", type: "Clearance Requirements", status: "Approved", date: "Jan 20, 2026" },
];

export default function ProfilePage() {

  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-sm">Not logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 ">

      <main className="w-full ">

        {/* HERO */}
        <div className="w-full h-24 sm:h-28 md:h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />

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
                    src={`${user.avatar}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-4 border-white" />
              </div>

              {/* NAME */}
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                  {user.full_name as string}
                </h1>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {user.role as string}
                  </span>

                  <span className="text-xs text-slate-400">
                    Member since {"N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* EDIT BUTTON */}
            <button className="
              flex items-center gap-2
              px-5 sm:px-6
              py-2.5
              bg-indigo-600 hover:bg-indigo-700
              text-white rounded-xl
              transition shadow-md
              text-sm font-semibold
              w-full sm:w-auto
              justify-center
            ">
              <Edit3 size={16} /> Edit Profile
            </button>

          </header>

          {/* MAIN GRID */}
          <div className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-6 sm:gap-8
          ">

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* PERSONAL INFO */}
              <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                  <User className="text-indigo-500" size={20} />
                  <h2 className="text-lg font-bold">Personal Information</h2>
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
                  <InfoItem label="Full Name" value={user.full_name as string} icon={<User size={16}/>} />
                  <InfoItem label="School ID" value={user.user_id as string} icon={<CreditCard size={16}/>} />
                  <InfoItem label="Email Address" value={user.email as string} icon={<Mail size={16}/>} />
                  <InfoItem label="Contact Number" value={"N/A"} icon={<Phone size={16}/>} />
                  <InfoItem label="Current Address" value={"N/A"} icon={<MapPin size={16}/>} />
                  <InfoItem label="Birthdate" value={"N/A"} icon={<Calendar size={16}/>} />
                  <InfoItem label="Gender" value={"N/A"} />
                  <InfoItem label="Civil Status" value={"Palautog"} />
                </div>
              </section>
              
            <div className="space-y-4 sm:space-y-6">
             {/* ELIGIBILITY CARD */}
            <div className={`p-4 sm:p-6 rounded-2xl border-2 flex items-center gap-4 ${false ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
               <div className={`p-3 rounded-full ${false? "bg-emerald-500" : "bg-rose-500"} text-white shadow-lg`}>
                {false ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div>
                <h3 className={`font-black uppercase tracking-widest text-[9px] ${false ? "text-emerald-600" : "text-rose-600"}`}>Clearance Status</h3>
                <p className="text-lg font-bold text-slate-800">{false ? "Eligible" : "Not Eligible"}</p>
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

           

          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- REUSABLE ---------- */

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon && <span className="text-indigo-500/70">{icon}</span>}
        <p className="text-sm font-semibold text-slate-700 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Rejected: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${styles[status]}`}>
      {status}
    </span>
  );
}