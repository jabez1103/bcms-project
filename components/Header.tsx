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
  X, 
  ChevronDown,
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";
import { PageType, UserRole } from "@/types";
import { SettingsModal } from "./SettingsModal";
import { LogoutModal } from "./LogoutModal";

interface HeaderProps {
  role: UserRole;
  activePage?: PageType;
  onPageClick?: (page: PageType) => void;
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
          <div className="relative hidden lg:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or file..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bg-gray-50 text-black border border-gray-200 rounded-xl pl-10 pr-10 py-2 w-64 text-sm focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all outline-none"
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
            {/* ... Notification Dropdown logic remains same ... */}
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
              <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                <Link
                  href={`/${role}/profile`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
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
            )}
          </div>
        </div>
      </header>

      {/* RENDER MODALS AS OVERLAYS */}
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