"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  FileText, 
  CheckCheck, 
  Search, 
  ChevronDown,
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { PageType, UserRole } from "@/types/index";
import { SettingsModal } from "./SettingsModal";
import { LogoutModal } from "./LogoutModal";

interface HeaderProps {
  role: UserRole;
  activePage: PageType;
  onPageClick: (page: PageType) => void;
}

interface NotificationItem {
  id: number;
  title: string;
  content: string;
  read: boolean;
  type: "request" | "approval" | "reminder";
}

const user = {
  avatar: "/monique.png",
  name: "Monique Cantarona",
};

export function Header({ role, activePage, onPageClick }: HeaderProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  
  // Modal States
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  const [notifTab, setNotifTab] = useState<"All" | "Unread">("Unread");
  const [searchValue, setSearchValue] = useState("");

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: "New Clearance Request", content: "Student John submitted a request.", read: false, type: "request" },
    { id: 2, title: "Approved Request", content: "Your request has been approved.", read: false, type: "approval" },
    { id: 3, title: "Reminder", content: "Complete your pending approvals.", read: true, type: "reminder" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClickNotification = (id: number) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const displayedNotifications = notifications.filter(n => notifTab === "All" ? true : !n.read);

  return (
    <>
      <header className="flex justify-between items-center px-4 md:px-8 h-[10vh] bg-white border-b border-gray-200 sticky top-0 z-40">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="flex items-center gap-3 md:gap-4">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-xs md:text-sm font-black tracking-tighter leading-none text-slate-800 uppercase">
              BISU CLEARANCE
            </h1>
            <p className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.25em] text-slate-500 uppercase">
              Management System
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: ACTIONS */}
        <div className="flex items-center space-x-2 md:space-x-6">
          
          {/* SEARCH BAR */}
          <div className="relative flex items-center">
            {/* The container is now visible on all screens (flex) */}
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" 
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="
                bg-gray-50 text-black border border-gray-200 rounded-xl 
                pl-10 pr-4 py-2 text-sm outline-none transition-all
                focus:bg-white focus:ring-2 focus:ring-purple-100
                w-32 
                md:w-48 
                lg:w-64
              "
            />
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-xl transition-all relative ${isNotifOpen ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 border-2 border-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-[320px] md:w-[380px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-700 uppercase tracking-wider"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="flex p-1 bg-gray-100/50 mx-4 mt-3 rounded-lg">
                    {(["Unread", "All"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setNotifTab(tab)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                          notifTab === tab 
                            ? "bg-white text-purple-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto p-2">
                    {displayedNotifications.length > 0 ? (
                      displayedNotifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleClickNotification(n.id)}
                          className={`w-full flex gap-4 p-3 rounded-xl transition-colors text-left group ${
                            !n.read ? "bg-purple-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                            n.type === 'approval' ? 'bg-green-100 text-green-600' : 
                            n.type === 'request' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {n.type === 'approval' ? <CheckCircle2 size={16} /> : 
                             n.type === 'request' ? <FileText size={16} /> : <Clock size={16} />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className={`text-sm font-bold ${!n.read ? "text-slate-900" : "text-slate-600"}`}>
                                {n.title}
                              </p>
                              {!n.read && <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                              {n.content}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-tight">
                              Just now
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <CheckCheck className="text-gray-300" size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">All caught up!</p>
                        <p className="text-xs text-slate-400">No new notifications to show.</p>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/${role}/notifications`}
                    onClick={() => setNotifOpen(false)}
                    className="block py-3 text-center text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-gray-50 border-t border-gray-50 transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="relative pl-2 md:pl-4 border-l border-gray-100">
            <button
              className="flex items-center gap-2 md:gap-3 group"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              <div className="relative">
                <img src={user.avatar} alt="Profile" className="w-9 h-9 md:w-11 md:h-11 rounded-xl object-cover border-2 border-transparent group-hover:border-purple-200 transition-all" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-purple-600 transition-colors">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role}</p>
              </div>
              <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-purple-600" : ""}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  
                  {/* MOBILE-ONLY PROFILE HEADER */}
                  <div className="md:hidden px-4 py-5 bg-slate-50/50 border-b border-gray-100 flex flex-col items-center gap-2">
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-xl object-cover border border-purple-100 shadow-sm" 
                    />
                    <div className="text-center mb-1">
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role}</p>
                    </div>
                    {/* Centered See Profile Button - Sized to match width constraints */}
                    <Link
                      href={`/${role}/profile`}
                      onClick={() => setDropdownOpen(false)}
                      className="w-full max-w-[140px] py-2 bg-white border border-purple-200 text-purple-600 text-[11px] font-bold rounded-lg hover:bg-purple-50 transition-all text-center flex items-center justify-center gap-2"
                    >
                      <UserIcon size={12} />
                      See Profile
                    </Link>
                  </div>

                  {/* DESKTOP-ONLY PROFILE LINK */}
                  <Link
                    href={`/${role}/profile`}
                    onClick={() => setDropdownOpen(false)}
                    className="hidden md:flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <UserIcon size={16} />
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      setSettingsOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <SettingsIcon size={16} />
                    Settings
                  </button>

                  <div className="border-t border-gray-50 my-1" />

                  <button 
                    onClick={() => {
                      setLogoutOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
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