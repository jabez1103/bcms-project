"use client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Rnd } from "react-rnd";
import { useEffect, useState } from "react";

import {
  Moon, Sun, Type, Eye, Languages, 
  LayoutTemplate, Check,
   Sidebar, Maximize,
  UserIcon,
  User,
  Lock, ShieldCheck, 
  Smartphone, 
  LogOut, 
  Clock, 
  KeyRound, 
  Monitor,
  Fingerprint, 
  Mail, Phone, MapPin, 
  Shield,
  Bell,
  History,
  Palette,
  X,
  ChevronRight,
  ArrowLeft,FileCheck, Megaphone, Activity
} from "lucide-react";
interface SettingsModalProps {
  isOpen: boolean; // Add this
  onClose: () => void;
}
export  function SettingsModal({ onClose, isOpen }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("Account");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileContent, setShowMobileContent] = useState(false);
  

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);

      if (width >= 768) {
        setPosition({ x: width / 2 - 360, y: height / 2 - 280 });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { id: "Account", icon: <User size={18} />, label: "Account" },
    { id: "Security", icon: <Shield size={18} />, label: "Security" },
    { id: "Notifications", icon: <Bell size={18} />, label: "Notifications" },
    { id: "Appearance", icon: <Palette size={18} />, label: "Appearance" },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (isMobile) setShowMobileContent(true);
  };
  // Helper to render content based on active tab
  const renderContent = () => {
      switch (activeTab) {
      case "Account":      
        return <ProfileContent />;
      case "Security":
        return <SecuritySettings/>;
      case  "Notifications":
       return <NotificationSettings/>;
      case "Appearance":
        return <AppearanceSettings/>

      default:
      const selectedItem = menuItems.find((item) => item.id === activeTab);
      const label = selectedItem?.label || activeTab;
        return <PlaceholderTab name={label} />;
    }
  };
  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col font-sans">
        <header className="p-4 border-b flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center gap-3">
            {showMobileContent && (
              <button
                onClick={() => setShowMobileContent(false)}
                className="p-1"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-bold text-gray-900">
              {showMobileContent
                ? menuItems.find((i) => i.id === activeTab)?.label
                : "Settings"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded-full"
          >
            Back
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {!showMobileContent ? (
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl active:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-purple-600">{item.icon}</span>
                    <span className="font-semibold text-gray-700">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))}
            </nav>
          ) : (
            <div className="animate-in slide-in-from-right duration-200">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <Rnd
        size={{ width: 720, height: 560 }}
        position={position}
        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
        bounds="window"
        enableResizing={false}
        dragHandleClassName="drag-handle"
        className="z-50"
      >
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl flex overflow-hidden border border-gray-200">
          <aside className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col">
            <div className="drag-handle p-6 cursor-move">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                BCMS Dashboard
              </h2>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                      : "text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 flex flex-col bg-white">
            <header className="px-8 py-5 flex justify-between items-center border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </header>
            <div className="px-8 py-6 overflow-y-auto flex-1">
              {renderContent()}
            </div>
          </main>
        </div>
      </Rnd>
    </>
  );
}
function ProfileContent() {
  const { user, loading } = useCurrentUser();
  
  // State for editable fields
  const [contactNumber, setContactNumber] = useState("09123456789");
  const [email, setEmail] = useState(user?.email || "jabez@bisu.edu.ph");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">Loading profile...</p>
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
      <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
        <div className="relative group">
          <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
            <img 
              src={(user as any).avatar || "/default-avatar.png"} 
              alt="Profile" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
         
        </div>
        
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h4 className="font-black text-2xl text-slate-800 tracking-tight">Jabez Bautista</h4>
            <ShieldCheck size={20} className="text-emerald-500" type="Verified Identity" />
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
              Student
            </span>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
              Year 3 • Section A
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">BS Computer Science • BISU Clarin Campus</p>
        </div>
      </div>

      {/* 2. VIEW-ONLY SYSTEM RECORDS (Locked) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Lock size={14} className="text-slate-400" />
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">System Records (Read-Only)</h4>
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
              <div className="mt-1.5 flex items-center justify-between w-full p-4 bg-slate-100/50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed">
                {field.value}
                <Lock size={14} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 3. EDITABLE CONTACT INFORMATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <UserIcon size={14} className="text-purple-500" />
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Editable Information</h4>
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
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-sm font-bold text-slate-700 transition-all"
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
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-sm font-bold text-slate-700 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button className="flex-1 sm:flex-none px-10 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all hover:bg-slate-800 shadow-xl shadow-slate-200">
          Save Changes
        </button>
        <button className="flex-1 sm:flex-none px-10 py-4 bg-white border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all hover:bg-slate-50">
          Reset
        </button>
      </div>
    </div>
  );

}

export function SecuritySettings() {
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

export function NotificationSettings() {
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
export default function AppearanceSettings() {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(1); // 0: Small, 1: Standard, 2: Large
  const [language, setLanguage] = useState('en');
  const [layout, setLayout] = useState('standard');
  const [highContrast, setHighContrast] = useState(false);

  const fontSizes = ["Small", "Standard", "Large"];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- VISUAL THEME & CONTRAST --- */}
      <section className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Visual Style</h4>
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          
          {/* Theme Switcher */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-amber-50 text-amber-500'}`}>
                {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div>
                <p className="font-bold text-slate-900">Interface Theme</p>
                <p className="text-xs text-slate-500">Light or Dark preference</p>
              </div>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              {['light', 'dark'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-6 py-2 text-xs font-bold rounded-xl transition-all capitalize ${theme === t ? 'bg-white shadow-md text-slate-900' : 'text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${highContrast ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Eye size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900">High Contrast</p>
                <p className="text-xs text-slate-500">Enhance visibility</p>
              </div>
            </div>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 rounded-full transition-all relative ${highContrast ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${highContrast ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* --- TYPOGRAPHY & REGIONAL --- */}
      <section className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Accessibility & Language</h4>
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          
          {/* Font Size Stepper */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Type size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Font Size</p>
                <p className="text-xs text-slate-500">{fontSizes[fontSize]} view</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button 
                disabled={fontSize === 0}
                onClick={() => setFontSize(fontSize - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm disabled:opacity-30 font-bold"
              >–</button>
              <span className="text-xs font-bold w-4 text-center">{fontSize + 1}</span>
              <button 
                disabled={fontSize === 2}
                onClick={() => setFontSize(fontSize + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm disabled:opacity-30 font-bold"
              >+</button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Languages size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Language</p>
                <p className="text-xs text-slate-500">{language === 'en' ? 'English (US)' : 'Filipino (PH)'}</p>
              </div>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-100 border-none text-xs font-bold py-2 px-4 rounded-xl outline-none appearance-none cursor-pointer hover:bg-slate-200 transition-colors"
            >
              <option value="en">English</option>
              <option value="fil">Filipino</option>
            </select>
          </div>
        </div>
      </section>

      {/* --- DASHBOARD PREFERENCE --- */}
      <section className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Dashboard Layout</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'standard', label: 'Sidebar', icon: <Sidebar size={20} />, desc: 'Classic navigation' },
            { id: 'compact', label: 'Expanded', icon: <Maximize size={20} />, desc: 'Focus on content' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLayout(item.id)}
              className={`p-5 rounded-[2rem] text-left border-2 transition-all space-y-3 relative overflow-hidden ${
                layout === item.id 
                ? 'border-purple-500 bg-white shadow-md' 
                : 'border-transparent bg-slate-100 hover:bg-slate-200 opacity-70'
              }`}
            >
              <div className={`p-2 w-fit rounded-lg ${layout === item.id ? 'bg-purple-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </div>
              {layout === item.id && (
                <div className="absolute top-4 right-4 text-purple-500">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
      <p className="text-sm italic">{name} settings coming soon...</p>
    </div>
  );
}
