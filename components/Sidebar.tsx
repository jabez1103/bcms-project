"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  ClipboardCheck, 
  ClipboardList, 
  History, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  UserCheck,
  X,
  Search
} from "lucide-react";
import { PageType, UserRole } from "@/types/index";
import { useAppLanguage } from "@/lib/language";

type Signatory = {
  id: number;
  role: string;
  name: string;
  status: string;
}

interface SidebarProps {
  role: UserRole;
  activePage: PageType;
  onPageClick: (page: PageType) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ role, activePage, onPageClick, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useAppLanguage();
  const isSignatoriesRoute = useMemo(
    () => pathname.startsWith(`/${role}/signatories`),
    [pathname, role]
  );
  const isActivityLogsRoute = useMemo(
    () => pathname.startsWith(`/${role}/activity-logs`),
    [pathname, role]
  );

  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);
  const [signatoriesOpen, setSignatoriesOpen] = useState(false);
  const [activityLogsOpen, setActivityLogsOpen] = useState(false);
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const [mobileSearchLoading, setMobileSearchLoading] = useState(false);
  const [mobileSearchResults, setMobileSearchResults] = useState<
    Array<{ id: string; category: string; title: string; subtitle?: string; href: string }>
  >([]);

  useEffect(() => {
    if (isSignatoriesRoute) setSignatoriesOpen(true);
    if (isActivityLogsRoute) setActivityLogsOpen(true);
  }, [isSignatoriesRoute, isActivityLogsRoute]);

  useEffect(() => {
    const handleResize = () => {
      // For desktop, we can default to not collapsed, or respect previous state
      setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileOpen]);

  useEffect(() => {
    if (role !== "student") return;
    const fetchSignatories = async () => {
      try {
        const res = await fetch("/api/student/clearance-status");
        const data = await res.json();
        if (data.success) setSignatories(data.signatories);
      } catch (err) {
        console.error("Failed to fetch signatories", err);
      }
    };
    fetchSignatories();
  }, [role]);

  useEffect(() => {
    if (!isMobileOpen) {
      setMobileSearchValue("");
      setMobileSearchResults([]);
      setMobileSearchLoading(false);
      return;
    }

    const q = mobileSearchValue.trim();
    if (q.length < 2) {
      setMobileSearchResults([]);
      setMobileSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(async () => {
      setMobileSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled) {
          setMobileSearchResults(Array.isArray(data?.results) ? data.results : []);
        }
      } catch {
        if (!cancelled) setMobileSearchResults([]);
      } finally {
        if (!cancelled) setMobileSearchLoading(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [isMobileOpen, mobileSearchValue]);

  const openMobileSearchResult = (href: string) => {
    setMobileSearchValue("");
    setMobileSearchResults([]);
    if (onMobileClose) onMobileClose();
    router.push(href);
  };

  if (isCollapsed === null) return null;

  const getLinksByRole = () => {
    switch (role) {
      case "student":
        return [
          { label: "Home", icon: <Home size={18} /> },
          { label: "Signatories", icon: <UserCheck size={18} />, hasDropdown: true },
          { label: "Activity Logs", icon: <History size={18} />, hasDropdown: true },
        ];
      case "admin":
        return [
          { label: "Home", icon: <Home size={18} /> },
          { label: "User Accounts", icon: <Users size={18} /> },
          { label: "Clearance Periods", icon: <Calendar size={18} /> },
          { label: "Clearance Progress", icon: <BarChart3 size={18} /> },
        ];
      case "signatory":
        return [
          { label: "Home", icon: <Home size={18} /> },
          { label: "Manage Requirements", icon: <ClipboardList size={18} /> },
          { label: "Student Clearance Status", icon: <UserCheck size={18} /> },
          { label: "Review Submissions", icon: <ClipboardCheck size={18} /> },
        ];
      default:
        return [];
    }
  };

  const linkToRoute = (link: string) => {
    const slug = link.toLowerCase().replace(/ /g, "-");
    if (slug === "home") return `/${role}/home`;
    if (slug === "recent-logs") return `/${role}/activity-logs/recent-logs`;
    if (slug === "system-history") return `/${role}/activity-logs/system-history`;
    return `/${role}/${slug}`;
  };

  const getDisplayLabel = (label: string) => {
    if (label === "Home") return t("home");
    if (label === "Signatories") return t("signatories");
    if (label === "Activity Logs") return t("activityLogs");
    return label;
  };

  const getStatusDot = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-400';
      case 'pending': return 'bg-amber-400';
      case 'rejected': return 'bg-red-400';
      default: return 'bg-slate-300';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside className={`
        fixed md:relative top-0 left-0 z-50 h-full flex flex-col shrink-0 
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        text-slate-600 dark:text-slate-300 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-20" : "md:w-64"}
        w-[76vw] sm:w-80 md:w-auto
      `}>
        
        {/* Mobile Header with Logo and Close Button */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="BISU Logo" className="w-7 h-7 object-contain" />
            <div className="flex flex-col">
              <h1 className="text-xs font-black tracking-tighter text-slate-800 dark:text-slate-100 uppercase leading-none">
                BISU CLEARANCE
              </h1>
            </div>
          </div>
          <button 
            onClick={onMobileClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-6 h-6 rounded-md items-center justify-center hover:border-brand-600 dark:hover:border-brand-500 transition-all shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight size={14} className="text-brand-600" />
          : <ChevronLeft size={14} className="text-brand-600" />}
        </button>

        {/* Main Navigation */}
        <div className="flex flex-col overflow-y-auto px-3 md:px-4 space-y-1.5 md:space-y-2 h-full py-3 md:py-8 custom-scrollbar">
          {/* Mobile Global Search (between header/logo and Home) */}
          <div className="md:hidden mb-1.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search pages, users..."
                value={mobileSearchValue}
                onChange={(e) => setMobileSearchValue(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-[12px] text-black dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/5 dark:focus:ring-brand-400/10 transition-all outline-none"
              />
            </div>
            {mobileSearchValue.trim().length >= 2 && (
              <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {mobileSearchLoading ? (
                  <p className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">Searching...</p>
                ) : mobileSearchResults.length === 0 ? (
                  <p className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">No matching results.</p>
                ) : (
                  mobileSearchResults.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openMobileSearchResult(item.href)}
                      className="w-full text-left px-3 py-2 border-b border-slate-50 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {item.category}{item.subtitle ? ` · ${item.subtitle}` : ""}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {getLinksByRole().map((item) => {
            const isSignatories = item.label === "Signatories";
            const isActivityLogs = item.label === "Activity Logs";
            const isOpen = isSignatories ? signatoriesOpen : isActivityLogs ? activityLogsOpen : false;
            const isActive = isSignatories
              ? isSignatoriesRoute
              : isActivityLogs
              ? isActivityLogsRoute
              : pathname.startsWith(linkToRoute(item.label));

            return (
              <div key={item.label} className="flex flex-col">
                {item.hasDropdown ? (
                  /* Dropdown Parent Button */
                  <button
                    onClick={() => {
                      if (isSignatories) setSignatoriesOpen(!signatoriesOpen);
                      if (isActivityLogs) setActivityLogsOpen(!activityLogsOpen);
                    }}
                    className={`
                      flex items-center gap-2.5 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl transition-all w-full group
                      ${isOpen || isActive ? "bg-brand-600 text-white" : "hover:bg-brand-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"}
                    `}
                  >
                    <span className={`${isOpen || isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400"}`}>
                      {item.icon}
                    </span>
                    {(!isCollapsed || isMobileOpen) && (
                      <>
                        <span className={`flex-1 text-[13px] md:text-sm font-bold text-left ${isOpen || isActive ? "text-white" : "group-hover:text-brand-600 dark:group-hover:text-brand-400"}`}>
                          {getDisplayLabel(item.label)}
                        </span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : isActive ? "text-white" : "group-hover:text-brand-600 dark:group-hover:text-brand-400"}`} />
                      </>
                    )}
                  </button>
                ) : (
                  /* Standard Link */
                  <Link href={linkToRoute(item.label)} onClick={() => { if (isMobileOpen && onMobileClose) onMobileClose(); }}>
                    <div className={`
                      flex items-center gap-2.5 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl transition-all cursor-pointer group
                      ${isActive ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400" : "hover:bg-brand-600 hover:text-white text-slate-500 dark:text-slate-400"}
                    `}>
                      <span className={`${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500 group-hover:text-white"}`}>
                        {item.icon}
                      </span>
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="text-[13px] md:text-sm font-bold">
                          {getDisplayLabel(item.label)}
                        </span>
                      )}
                    </div>
                  </Link>
                )}

                {/* Sub-menu Items (Dropdown Content) */}
                {isOpen && (!isCollapsed || isMobileOpen) && (
                  <div className="ml-8 mt-1 space-y-0.5 md:space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-2.5 md:pl-3">
                    {isSignatories && (signatories.length === 0 ? (
                      <p className="text-[10px] text-slate-400 py-2">No requirements found.</p>
                    ) : ( signatories.map((sig) => (
                            <Link key={sig.id} href={`/${role}/signatories/${sig.id}`} onClick={() => { if (isMobileOpen && onMobileClose) onMobileClose(); }} className="block py-1.5 md:py-2 group">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot(sig.status)} inline-block mr-2`} />
                              <div className="inline-block align-middle">
                                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter leading-none group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                  {sig.role}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                  {sig.name}
                                </p>
                              </div>
                            </Link>
                          ))
                        )
                      )}

                    {isActivityLogs && (
                      <>
                        <Link href={linkToRoute("Recent Logs")} onClick={() => { if (isMobileOpen && onMobileClose) onMobileClose(); }} className="block py-1.5 md:py-2 text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                          {t("recentLogs")}
                        </Link>
                        <Link href={linkToRoute("System History")} onClick={() => { if (isMobileOpen && onMobileClose) onMobileClose(); }} className="block py-1.5 md:py-2 text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                          {t("systemHistory")}
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Support Section */}
        <div className="px-3 md:px-4 py-4 md:py-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <Link 
            href="/helpandsupport"
            className="flex items-center gap-2.5 md:gap-3 w-full px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-brand-600 hover:text-white transition-all group"
          >
            <HelpCircle size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-white shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[13px] md:text-sm font-bold">{t("helpAndSupport")}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-brand-100">{t("documentation")}</span>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
