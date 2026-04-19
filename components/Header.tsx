"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  ChevronDown,
  Settings as SettingsIcon,
  LogOut,
  MoreHorizontal,
  Check,
  X,
  User as UserIcon,
  Settings2,
} from "lucide-react";

import { PageType, UserRole } from "@/types/index";
import { LogoutModal } from "./LogoutModal";
import SettingsModal from "@/components/settings/page";

interface HeaderProps {
  role: UserRole;
  activePage: PageType;
  onPageClick: (page: PageType) => void;
}

export function Header({ role, activePage, onPageClick }: HeaderProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isNotifMenuOpen, setMenuOpen] = useState(false);

  // Modal States
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isNotifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("unread");

  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Student Registered", desc: "James Kyle completed enrollment.", time: "2m ago", isRead: false },
    { id: 2, title: "File Upload Success", desc: "Transcript_Final.pdf processed.", time: "1h ago", isRead: false },
    { id: 3, title: "System Update", desc: "Dashboard v2.0 is now live.", time: "Yesterday", isRead: true },
  ]);

  const { user, loading } = useCurrentUser();

  // Derived data
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifs = notifications.filter((n) =>
    activeTab === "all" ? true : !n.isRead
  );
  const userAvatar = user?.avatar || "/default-avatar.png";

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMenuOpen(false);
  };

  if (loading) {
    return (
      <header className="h-[10vh] flex items-center justify-center bg-white border-b border-gray-100">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </header>
    );
  }

  if (!user) return null;

  return (
    <>
      <header className="flex justify-between items-center px-4 md:px-8 h-[10vh] bg-white border-b border-slate-100 sticky top-0 z-40">
        {/* LEFT SIDE: BRANDING */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="BISU Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-xs md:text-sm font-black tracking-tighter text-slate-800 uppercase leading-none">
              BISU CLEARANCE
            </h1>
            <p className="text-[8px] md:text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              Management System
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: ACTIONS */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* SEARCH BAR */}
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-48 lg:w-72 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm text-black focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
            />
            {searchValue && (
              <button onClick={() => setSearchValue("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!isNotifOpen)}
              className={`p-2.5 rounded-xl transition-all relative ${
                isNotifOpen ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Bell size={20} fill={isNotifOpen ? "currentColor" : "none"} className={isNotifOpen ? "opacity-20" : ""} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-rose-500 border-2 border-white text-[9px] text-white font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              )}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => { setNotifOpen(false); setMenuOpen(false); }} />
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <div className="relative">
                      <button onClick={() => setMenuOpen(!isNotifMenuOpen)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal size={18} className="text-slate-500" />
                      </button>
                      
                      {isNotifMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 shadow-xl rounded-xl p-1.5 z-30">
                          <button onClick={markAllAsRead} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                            <Check size={14} className="text-emerald-500" /> Mark all as read
                          </button>
                          <button 
                            onClick={() => { setSettingsOpen(true); setMenuOpen(false); setNotifOpen(false); }} 
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                          >
                            <Settings2 size={14} className="text-indigo-500" /> Notification Settings
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 p-2 bg-slate-50/50">
                    {["all", "unread"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredNotifs.length > 0 ? (
                      filteredNotifs.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className="p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 relative"
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.isRead ? "bg-transparent" : "bg-indigo-500"}`} />
                          <div className="flex-1">
                            <p className={`text-sm leading-snug ${notif.isRead ? "text-slate-500" : "text-slate-900 font-semibold"}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{notif.desc}</p>
                            <p className="text-[10px] text-indigo-500 font-bold mt-2 uppercase">{notif.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-sm text-slate-400 italic">No notifications found</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* PROFILE */}
          <div className="relative border-l border-slate-100 pl-2 md:pl-6">
            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover border-2 border-transparent group-hover:border-indigo-100 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.full_name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  <Link href={`/${user.role}/profile`} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    <UserIcon size={16} /> Profile
                  </Link>
                  <button 
                    onClick={() => { setSettingsOpen(true); setDropdownOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
                  >
                 
                    <SettingsIcon size={16} /> Settings
                    
                  </button>
                  <div className="h-px bg-slate-50 my-1" />
                  <button 
                    onClick={() => { setLogoutOpen(true); setDropdownOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MODALS */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />

      

      <LogoutModal 
        isOpen={isLogoutOpen} 
        onClose={() => setLogoutOpen(false)} 
      />
    </>
  );
}