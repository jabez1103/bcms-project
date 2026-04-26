"use client";
import { useEffect, useState } from "react";
import { Megaphone, FileCheck, Activity, Bell, Shield } from "lucide-react";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  setNotificationPreferences,
} from "@/lib/userPreferences";



export default function NotificationSettings() {
  const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getNotificationPreferences());
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    setSaved(false);
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setNotificationPreferences(next);
      return next;
    });
  };

  const notificationOptions = [
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
      id: "adminAnnouncements",
      label: "Admin Announcements",
      desc: "Important campus-wide news and policy changes",
      icon: <Megaphone size={18} />,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-0.5 px-1">
        <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight">Notification Preferences</h3>
        <p className="text-xs text-slate-400 font-medium">Choose how you want to be alerted about your clearance progress.</p>
      </div>

      {/* OPTIONS LIST */}
      <div className="grid grid-cols-1 gap-2.5 md:gap-3">
        {notificationOptions.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => toggleSetting(opt.id as keyof typeof settings)}
            className="group flex items-center justify-between p-3.5 md:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-200 dark:hover:border-brand-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`p-2.5 md:p-3 rounded-xl transition-all ${
                settings[opt.id as keyof typeof settings] 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}>
                {opt.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-[13px] md:text-sm font-bold text-slate-800 dark:text-slate-200">{opt.label}</p>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">{opt.desc}</p>
              </div>
            </div>

            {/* TOGGLE SWITCH */}
            <div className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${
              settings[opt.id as keyof typeof settings] ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                settings[opt.id as keyof typeof settings] ? 'left-6' : 'left-1'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER ACTION */}
      <div className="pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Protected</span>
        </div>
        <button
          onClick={() => {
            setNotificationPreferences(settings);
            setSaved(true);
          }}
          className="px-6 py-2.5 md:px-8 md:py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
        >
          {saved ? "Saved" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
