"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import React, { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Calendar,
  CreditCard, Edit3, KeyRound, ChevronRight, 
  Save, X, ShieldCheck, BadgeCheck
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();
  
  /* --- UI States --- */
  const [isEditing, setIsEditing] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  
  /* --- Form States --- */
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");

  // Sync state when user data is available
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      // Set contact here if available in your user object
      setContact(""); 
    }
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">Loading Profile</span>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-rose-500 font-bold">
      AUTH ERROR
    </div>
  );

  const isEligible = false;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 selection:bg-indigo-100">
      {/* Banner - Dark Slate */}
      <div className="w-full h-48 bg-[#0F172A]" />
      
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <header className="relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-36 h-36 rounded-2xl overflow-hidden border-[6px] border-white shadow-xl bg-slate-200">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            
            {/* Identity Text */}
            <div className="text-center md:text-left pb-1">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <span className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                  {user.role as string}
                </span>
              </div>
              
              {/* text-white for visibility on banner, md:text-slate-900 for below banner */}
              <h1 className="text-3xl font-bold text-blacks md:text-slate-900 tracking-tight">
                {user.full_name as string}
              </h1>
              <p className="text-slate-400 md:text-slate-500 text-sm mt-1 font-medium">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
          
          {/* Action Buttons for Profile Edit */}
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-white text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  <X size={16} className="inline mr-1" /> Cancel
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${isEditing ? "border-indigo-200 ring-4 ring-indigo-50" : "border-slate-200"}`}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <User size={18} className={isEditing ? "text-indigo-500" : "text-slate-400"} />
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    {isEditing ? "Editing Account Details" : "Personal Information"}
                  </h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2">
                <StaticField label="Legal Name" value={user.full_name as string} icon={<User size={14}/>} />
                <StaticField label="University ID" value={user.user_id as string} icon={<CreditCard size={14}/>} />
                
                <EditableField 
                  label="Primary Email" 
                  value={email} 
                  editable={isEditing}
                  onChange={(e: any) => setEmail(e.target.value)} 
                  icon={<Mail size={14}/>} 
                  placeholder="Enter email address"
                />

                <EditableField 
                  label="Contact Number" 
                  value={contact} 
                  editable={isEditing}
                  onChange={(e: any) => setContact(e.target.value)} 
                  icon={<Phone size={14}/>} 
                  placeholder="+63 000 000 0000"
                />

                <StaticField label="Home Address" value="Not Provided" icon={<MapPin size={14}/>} />
                <StaticField label="Date of Birth" value="Not Provided" icon={<Calendar size={14}/>} />
              </div>
            </div>

            <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Account Privacy</h3>
                <p className="text-xs text-slate-500">Only you and authorized administrators can view this information.</p>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border shadow-sm ${isEligible ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-200"}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Account Status</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-slate-800">
                  {isEligible ? "Verified Eligible" : "Pending Review"}
                </p>
                <div className={`w-3 h-3 rounded-full ${isEligible ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              </div>
            </div>

            {/* Password Section - Always Enabled */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Security Settings</p>
              
              {!showPassForm ? (
                <button 
                  onClick={() => setShowPassForm(true)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl group transition-all hover:bg-white hover:border-indigo-200"
                >
                  <div className="flex items-center gap-3">
                    <KeyRound size={16} className="text-slate-400 group-hover:text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-700">Update Password</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <input type="password" placeholder="Current Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all" />
                    <input type="password" placeholder="New Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPassForm(false)} className="flex-1 py-2 text-[10px] font-bold text-slate-400 uppercase">Cancel</button>
                    <button className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors">Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* --- Internal Components --- */

function StaticField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 border-b border-slate-100 md:even:border-l last:border-b-0">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-500">{value}</p>
    </div>
  );
}

function EditableField({ label, value, editable, onChange, icon, placeholder }: any) {
  return (
    <div className={`p-6 border-b border-slate-100 md:even:border-l last:border-b-0 transition-all ${editable ? "bg-indigo-50/20" : "bg-transparent"}`}>
      <div className={`flex items-center gap-2 mb-2 ${editable ? "text-indigo-600" : "text-slate-400"}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <input 
        type="text" 
        value={value}
        disabled={!editable}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-transparent text-sm font-semibold outline-none transition-all ${
          editable 
          ? "text-slate-900 border-b border-indigo-300 pb-1" 
          : "text-slate-700 cursor-not-allowed"
        }`}
      />
    </div>
  );
}