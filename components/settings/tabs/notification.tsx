"use client";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShieldCheck, Lock, UserIcon, MapPin, Mail, Phone, Megaphone, FileCheck, Activity, Bell, Shield } from "lucide-react";



export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: true,
    system: true,
    status: true,
    approval: true,
    announcements: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationOptions = [
    {
      id: "email",
      label: "Email Notifications",
      desc: "Receive clearance updates via jabez@bisu.edu.ph",
      icon: <Mail size={18} />,
    },
    {
      id: "system",
      label: "System Notifications",
      desc: "In-app alerts for real-time clearance movements",
      icon: <Bell size={18} />,
    },
    {
      id: "status",
      label: "Request Status Updates",
      desc: "Alerts when your request moves to the next signatory",
      icon: <Activity size={18} />,
    },
    {
      id: "approval",
      label: "Certificate Approval Alerts",
      desc: "Instant notification when your clearance certificate is ready",
      icon: <FileCheck size={18} />,
    },
    {
      id: "announcements",
      label: "Announcement Alerts",
      desc: "Important campus-wide news and policy changes",
      icon: <Megaphone size={18} />,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1 px-1">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Notification Preferences</h3>
        <p className="text-xs text-slate-400 font-medium">Choose how you want to be alerted about your clearance progress.</p>
      </div>

      {/* OPTIONS LIST */}
      <div className="grid grid-cols-1 gap-3">
        {notificationOptions.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => toggleSetting(opt.id as keyof typeof settings)}
            className="group flex items-center justify-between p-4 md:p-5 bg-white border border-slate-200 rounded-2xl hover:border-purple-200 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-all ${
                settings[opt.id as keyof typeof settings] 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
                : 'bg-slate-50 text-slate-400'
              }`}>
                {opt.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">{opt.desc}</p>
              </div>
            </div>

            {/* TOGGLE SWITCH */}
            <div className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${
              settings[opt.id as keyof typeof settings] ? 'bg-purple-600' : 'bg-slate-200'
            }`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                settings[opt.id as keyof typeof settings] ? 'left-6' : 'left-1'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER ACTION */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Protected</span>
        </div>
        <button className="px-8 py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200">
          Save Preferences
        </button>
      </div>
    </div>
  );
}