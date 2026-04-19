"use client";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ShieldCheck, 
  Smartphone, 
  LogOut, 
  Clock, 
  KeyRound, 
  Monitor,
  Fingerprint, 
  Bell,
  History,
  ChevronRight
} from "lucide-react";

export default function SecuritySettings() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [autoLogout, setAutoLogout] = useState("30m");

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. COMPACT STATUS HEADER */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Security Score: 85%</h2>
            <p className="text-slate-400 text-sm max-w-xs">
              Your account is almost fully protected. Just one more step to go!
            </p>
          </div>
          <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98]">
            Complete Security Audit
          </button>
        </div>
      </div>

      {/* 2. THE VERTICAL STACK (SETTING GROUPS) */}
      <div className="space-y-8">
        
        {/* ACCESS & AUTHENTICATION */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Access & Authentication</h4>
          <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
            
            {/* Password Item */}
            <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <KeyRound size={22} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Account Password</p>
                  <p className="text-xs text-slate-500">Updated 3 months ago</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            {/* 2FA Item */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors ${is2FAEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Fingerprint size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Two-Factor Auth</p>
                  <p className="text-xs text-slate-500">Highly recommended</p>
                </div>
              </div>
              <button 
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${is2FAEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${is2FAEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Preferences</h4>
          <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
            
            {/* Auto Logout */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Auto Logout</p>
                  <p className="text-xs text-slate-500">Inactivity period</p>
                </div>
              </div>
              <select 
                value={autoLogout}
                onChange={(e) => setAutoLogout(e.target.value)}
                className="bg-slate-100 border-none text-xs font-bold py-2 px-3 rounded-xl outline-none"
              >
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
              </select>
            </div>

            {/* Security Alerts */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Bell size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Security Alerts</p>
                  <p className="text-xs text-slate-500">Email & Push notifications</p>
                </div>
              </div>
              <button className="text-xs font-bold uppercase text-purple-600 px-4 py-2 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                Setup
              </button>
            </div>
          </div>
        </section>

        {/* ACTIVE DEVICES */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Devices</h4>
            <button className="text-rose-500 text-[10px] font-bold uppercase tracking-wider hover:underline">
              Logout All
            </button>
          </div>
          
          <div className="space-y-2">
            {[
              { device: "Asus Vivobook", location: "Clarin, Bohol", status: "Current", icon: <Monitor size={20} /> },
              { device: "iPhone 15 Pro", location: "Tagbilaran", status: "4h ago", icon: <Smartphone size={20} /> },
              { device: "Chrome Windows", location: "Cebu City", status: "2d ago", icon: <History size={20} /> }
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl group transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-slate-400 group-hover:text-slate-900 transition-colors">
                    {session.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{session.device}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{session.location} • {session.status}</p>
                  </div>
                </div>
                {i !== 0 && (
                  <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}