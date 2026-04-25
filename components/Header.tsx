"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Menu,
} from "lucide-react";

import { PageType, UserRole } from "@/types/index";
import { LogoutModal } from "./LogoutModal";
import SettingsModal from "@/components/settings/page";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/userPreferences";

interface HeaderProps {
  role: UserRole;
  activePage: PageType;
  onPageClick: (page: PageType) => void;
  onMobileMenuToggle?: () => void;
}

export function Header({ role, activePage, onPageClick, onMobileMenuToggle }: HeaderProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isNotifMenuOpen, setMenuOpen] = useState(false);

  // Modal States
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isNotifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      category: string;
      title: string;
      subtitle?: string;
      href: string;
    }>
  >([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("unread");
  const searchRef = useRef<HTMLDivElement | null>(null);

  interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    href?: string;
    targetId?: number | null;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );

  const { user, loading } = useCurrentUser();
  const router = useRouter();

  const isNotificationEnabled = useCallback(
    (type: string) => {
      const t = type.toLowerCase();
      if (t === "period_opened" || t === "period_closed") {
        return notificationPrefs.adminAnnouncements;
      }
      if (t === "submission_approved" || t === "submission_rejected") {
        return notificationPrefs.approval;
      }
      if (t === "submission_received") {
        return notificationPrefs.status;
      }
      if (t === "password_reset_requested") {
        return notificationPrefs.system;
      }
      return notificationPrefs.system;
    },
    [notificationPrefs]
  );

  useEffect(() => {
    const refreshPrefs = () => setNotificationPrefs(getNotificationPreferences());
    refreshPrefs();
    window.addEventListener("storage", refreshPrefs);
    window.addEventListener("focus", refreshPrefs);
    window.addEventListener("bcms:prefs-changed", refreshPrefs as EventListener);
    return () => {
      window.removeEventListener("storage", refreshPrefs);
      window.removeEventListener("focus", refreshPrefs);
      window.removeEventListener("bcms:prefs-changed", refreshPrefs as EventListener);
    };
  }, []);

  // --- Helpers ---
  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  // --- Fetch unread count (runs on mount + every 60s) ---
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      const data = await res.json();
      if (data.success) {
        // Fallback count from server; final badge count is synchronized from fetched items.
        setUnreadCount(data.count);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // --- Fetch full list when panel opens ---
  useEffect(() => {
    if (!isNotifOpen) return;
    setNotifLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNotifications(data.notifications);
      })
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, [isNotifOpen]);

  // Derived
  const visibleNotifications = notifications.filter((n) => isNotificationEnabled(n.type));
  const filteredNotifs = visibleNotifications.filter((n) => (activeTab === "all" ? true : !n.isRead));

  useEffect(() => {
    setUnreadCount(visibleNotifications.filter((n) => !n.isRead).length);
  }, [visibleNotifications]);
  const userAvatar = user?.avatar || "/default-avatar.png";

  useEffect(() => {
    const q = searchValue.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled) {
          setSearchResults(Array.isArray(data?.results) ? data.results : []);
        }
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchValue]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const openSearchResult = (href: string) => {
    setSearchOpen(false);
    setSearchValue("");
    setSearchResults([]);
    router.push(href);
  };

  const markAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (_) {}
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setMenuOpen(false);
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch (_) {}
  };

  const openNotificationSettings = () => {
    setNotifSettingsOpen(true);
    setSettingsOpen(true);
    setMenuOpen(false);
    setNotifOpen(false);
  };

  /** Navigate using backend-provided deep link when available. */
  const handleNotifClick = async (notif: Notification) => {
    await markAsRead(notif.id);
    setNotifOpen(false);

    if (typeof notif.href === "string" && notif.href.trim().length > 0) {
      router.push(notif.href);
      return;
    }

    // Fallback route so notification rows are always actionable.
    if (role === "admin") {
      router.push("/admin/home");
      return;
    }
    if (role === "signatory") {
      router.push("/signatory/home");
      return;
    }
    router.push("/student/home");
  };
   
  
  

  if (loading) {
    return (
      <header className="h-[10vh] flex items-center justify-center bg-white border-b border-gray-100">
        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </header>
    );
  }

  if (!user) return null;

  return (
    <>
      <header className="flex justify-between items-center px-2 sm:px-3 md:px-8 h-[10vh] bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
        {/* LEFT SIDE: BRANDING */}
        <div className="flex items-center gap-3">
          {/* HAMBURGER MENU (MOBILE ONLY) */}
          <button 
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <img src="/logo.png" alt="BISU Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-xs md:text-sm font-black tracking-tighter text-slate-800 dark:text-slate-100 uppercase leading-none">
              BISU CLEARANCE
            </h1>
            <p className="text-[8px] md:text-[9px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
              Management System
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: ACTIONS */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* SEARCH BAR */}
          <div ref={searchRef} className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search pages, users, requirements..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="w-48 lg:w-72 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-sm text-black dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/5 dark:focus:ring-brand-400/10 transition-all outline-none"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  setSearchResults([]);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}

            {searchOpen && (
              <div className="absolute right-0 mt-2 w-80 lg:w-[30rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Global Search
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-xs text-slate-500 dark:text-slate-400">Searching...</div>
                  ) : searchValue.trim().length < 2 ? (
                    <div className="p-4 text-xs text-slate-500 dark:text-slate-400">Type at least 2 characters.</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500 dark:text-slate-400">No matching results.</div>
                  ) : (
                    searchResults.slice(0, 12).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => openSearchResult(item.href)}
                        className="w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.category}{item.subtitle ? ` · ${item.subtitle}` : ""}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!isNotifOpen)}
              className={`p-2.5 rounded-xl transition-all relative ${
                isNotifOpen ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                    <div className="relative">
                      <button onClick={() => setMenuOpen(!isNotifMenuOpen)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal size={18} className="text-slate-500" />
                      </button>
                      
                      {isNotifMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-xl p-1.5 z-30">
                          <button onClick={markAllAsRead} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Check size={14} className="text-emerald-500" /> Mark all as read
                          </button>
                          <button 
                            onClick={openNotificationSettings}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                          >
                            <Settings2 size={14} className="text-brand-500" /> Notification Settings
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 p-2 bg-slate-50/50 dark:bg-slate-800/50">
                    {["all", "unread"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          activeTab === tab ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-12 gap-3">
                        <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                        <p className="text-xs text-slate-400">Loading...</p>
                      </div>
                    ) : filteredNotifs.length > 0 ? (
                      filteredNotifs.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 relative"
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.isRead ? "bg-transparent" : "bg-brand-500"}`} />
                          <div className="flex-1">
                            <p className={`text-sm leading-snug ${notif.isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100 font-semibold"}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-brand-500 dark:text-brand-400 font-bold mt-2 uppercase">{relativeTime(notif.createdAt)}</p>
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
                  className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover border-2 border-transparent group-hover:border-brand-100 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{user.full_name}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  
                  {/* MOBILE-ONLY PROFILE HEADER */}
                  <div className="md:hidden px-4 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex flex-col items-center gap-2">
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-xl object-cover border border-brand-100 shadow-sm" 
                    />
                    <div className="text-center mb-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{role}</p>
                    </div>
                    {/* Centered See Profile Button - Sized to match width constraints */}
                    <Link
                      href={`/${role}/profile`}
                      onClick={() => setDropdownOpen(false)}
                      className="w-full max-w-[140px] py-2 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 text-[11px] font-bold rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 transition-all text-center flex items-center justify-center gap-2"
                    >
                      <UserIcon size={12} />
                      See Profile
                    </Link>
                  </div>

                  {/* DESKTOP-ONLY PROFILE LINK */}
                  <Link
                    href={`/${role}/profile`}
                    onClick={() => setDropdownOpen(false)}
                    className="hidden md:flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    <UserIcon size={16} />
                    Profile
                  </Link>
                  <button 
                    onClick={() => { setNotifSettingsOpen(false); setSettingsOpen(true); setDropdownOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left"
                  >
                 
                    <SettingsIcon size={16} /> Settings
                    
                  </button>
                  <div className="h-px bg-slate-50 dark:bg-slate-800 my-1" />
                  <button 
                    onClick={() => { setLogoutOpen(true); setDropdownOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
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
        onClose={() => { setSettingsOpen(false); setNotifSettingsOpen(false); }}
        defaultTab={isNotifSettingsOpen ? "Notifications" : undefined}
      />

      

      <LogoutModal 
        isOpen={isLogoutOpen} 
        onClose={() => setLogoutOpen(false)} 
      />
    </>
  );
}
