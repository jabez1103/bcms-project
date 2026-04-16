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
  ThumbsUp,
  MoreHorizontal,
  X,
  User as UserIcon,
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

export function Header({ role, activePage, onPageClick }: HeaderProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);

  // Modal States
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  const [notifTab, setNotifTab] = useState<"All" | "Unread">("Unread");
  const [searchValue, setSearchValue] = useState("");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Student Registered",
      desc: "James Kyle completed enrollment.",
      time: "2m ago",
      isRead: false,
    },
    {
      id: 2,
      title: "File Upload Success",
      desc: "Transcript_Final.pdf processed.",
      time: "1h ago",
      isRead: false,
    },
    {
      id: 3,
      title: "System Update",
      desc: "Dashboard v2.0 is now live.",
      time: "Yesterday",
      isRead: true,
    },
  ]);

  // Derived unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Function to mark a single one as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  // Function to mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Filter the notifications based on the active tab
  const filteredNotifs = notifications.filter((n) =>
    activeTab === "all" ? true : !n.isRead,
  );
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">
          Loading profile...
        </p>
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

  // Placeholder avatar if user.avatar is missing
  const userAvatar = (user as any).avatar;

  return (
    <>
      <header className="flex justify-between items-center px-4 md:px-8 h-[10vh] bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* LEFT SIDE: BRANDING */}
        <div className="flex items-center gap-3 md:gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
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
          <div className="relative flex-1 md:flex-none max-w-[400px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />

            <input
              type="text"
              placeholder="Search student or file..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-sm placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all outline-none md:w-64 lg:w-80"
            />

            {/* Clear Button (Only shows when searchValue is not empty) */}
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!isNotifOpen)}
              className={`p-2.5 rounded-xl transition-all relative group ${
                isNotifOpen
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Bell
                size={22}
                className={isNotifOpen ? "fill-indigo-600/10" : ""}
              />

              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-rose-500 border-2 border-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] text-white font-bold shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            {isNotifOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-[360px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {/* Header Area */}
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900">
                        Notifications
                      </h3>
                      <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <MoreHorizontal size={20} className="text-slate-600" />
                      </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                          activeTab === "all"
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setActiveTab("unread")}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                          activeTab === "unread"
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Unread
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[500px] overflow-y-auto pb-2">
                    <div className="px-4 py-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        Earlier
                      </span>
                      <button className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded">
                        See all
                      </button>
                    </div>

                    {filteredNotifs.length > 0 ? (
                      filteredNotifs.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors relative group"
                        >
                          {/* Avatar Placeholder */}
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                              <img
                                src={userAvatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                           
                          </div>

                          {/* Content */}
                          <div className="flex-1 pr-4">
                            <p
                              className={`text-[14px] leading-tight ${notif.isRead ? "text-slate-600" : "text-slate-900 font-medium"}`}
                            >
                              <span className="font-bold">
                                {"User"}
                              </span>{" "}
                              {notif.desc}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-xs font-bold ${notif.isRead ? "text-slate-400" : "text-indigo-600"}`}
                              >
                                {notif.time}
                              </span>
                              {!notif.isRead && (
                                <span className="text-xs text-slate-400">
                                  •
                                </span>
                              )}
                              <span className="text-xs text-slate-400">
                                1 Reaction
                              </span>
                            </div>
                          </div>

                          {/* Unread Blue Dot */}
                          {!notif.isRead && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-sm" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-slate-400 text-sm italic">
                        No {activeTab === "unread" ? "unread" : ""}{" "}
                        notifications
                      </div>
                    )}
                  </div>
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
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-9 h-9 md:w-11 md:h-11 rounded-xl object-cover border-2 border-transparent group-hover:border-purple-200 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>

              {/* Desktop Name/Role */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {user.full_name as string}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {user.role as string}
                </p>
              </div>

              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-purple-600" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 md:w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                {/* MOBILE HEADER: Only shows when screen is small */}
                <div className="md:hidden px-4 py-4 flex flex-col items-center border-b border-gray-50 mb-2">
                  <img
                    src={userAvatar}
                    alt="Profile"
                    className="w-14 h-14 rounded-2xl object-cover mb-2 border-2 border-purple-100 shadow-sm"
                  />
                  <p className="text-sm font-bold text-slate-800 text-center leading-tight">
                    {user.full_name as string}
                  </p>
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-3">
                    {user.role as string}
                  </p>

                  <Link
                    href={`/${user.role as string}/profile`}
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-purple-50 text-purple-600 text-xs font-bold rounded-lg transition-colors border border-purple-100"
                  >
                    <UserIcon size={14} />
                    View Profile
                  </Link>
                </div>

                {/* DESKTOP PROFILE LINK: Hidden on mobile since it's in the header above */}
                <Link
                  href={`/${user.role as string}/profile`}
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
            )}
          </div>
        </div>
      </header>

      {/* RENDER MODALS AS OVERLAYS */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setLogoutOpen(false)} />
    </>
  );
}
function NotificationItem({
  title,
  desc,
  time,
  isNew,
}: {
  title: string;
  desc: string;
  time: string;
  isNew: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors relative group`}
    >
      <div className="flex gap-3">
        {/* Unread Dot */}
        {isNew && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        )}

        <div className="flex-1">
          <p
            className={`text-sm tracking-tight ${isNew ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}
          >
            {title}
          </p>
          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
            {desc}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-2 uppercase tracking-tight">
            {time}
          </p>
        </div>
      </div>
    </div>
  );
}
