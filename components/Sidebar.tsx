"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  UserCheck
} from "lucide-react";
import { PageType, UserRole } from "@/types/index";
import { signatories } from "@/lib/mock-data/id/signatories";

interface SidebarProps {
  role: UserRole;
  activePage: PageType;
  onPageClick: (page: PageType) => void;
}

export function Sidebar({ role, activePage, onPageClick }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);
  const [signatoriesOpen, setSignatoriesOpen] = useState(false);
  const [activityLogsOpen, setActivityLogsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsCollapsed(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isCollapsed === null) return null;

  const getLinksByRole = () => {
    switch (role) {
      case "student":
        return [
          { label: "Home", icon: <Home size={20} /> },
          { label: "Signatories", icon: <UserCheck size={20} />, hasDropdown: true },
          { label: "Activity Logs", icon: <History size={20} />, hasDropdown: true },
        ];
      case "admin":
        return [
          { label: "Home", icon: <Home size={20} /> },
          { label: "User Accounts", icon: <Users size={20} /> },
          { label: "Clearance Periods", icon: <Calendar size={20} /> },
          { label: "Clearance Progress", icon: <BarChart3 size={20} /> },
        ];
      case "signatory":
        return [
          { label: "Home", icon: <Home size={20} /> },
          { label: "Manage Requirements", icon: <ClipboardList size={20} /> },
          { label: "Student Clearance Status", icon: <UserCheck size={20} /> },
          { label: "Review Submissions", icon: <ClipboardCheck size={20} /> },
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

  return (
    <aside
      className={`
        ${isCollapsed ? "w-20" : "w-64"}
        bg-white border-r border-slate-200
        h-full flex flex-col text-slate-600
        transition-all duration-300 relative shrink-0 z-30
      `}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-slate-200 w-6 h-6 rounded-md flex items-center justify-center hover:border-purple-600 transition-all shadow-sm z-50"
      >
        {isCollapsed ? <ChevronRight size={14} className="text-purple-600" /> : <ChevronLeft size={14} className="text-purple-600" />}
      </button>

      {/* Main Navigation */}
      <div className="flex flex-col overflow-y-auto px-4 space-y-2 h-full py-8 custom-scrollbar">
        {getLinksByRole().map((item) => {
          const isSignatories = item.label === "Signatories";
          const isActivityLogs = item.label === "Activity Logs";
          const isOpen = isSignatories ? signatoriesOpen : isActivityLogs ? activityLogsOpen : false;
          const isActive = pathname.startsWith(linkToRoute(item.label));

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
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full group
                    ${isOpen ? "bg-purple-600 text-white" : "hover:bg-purple-50 text-slate-500"}
                  `}
                >
                  <span className={`${isOpen ? "text-white" : "text-slate-400 group-hover:text-purple-600"}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className={`flex-1 text-sm font-bold text-left ${isOpen ? "text-white" : "group-hover:text-purple-600"}`}>
                        {item.label}
                      </span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : "group-hover:text-purple-600"}`} />
                    </>
                  )}
                </button>
              ) : (
                /* Standard Link */
                <Link href={linkToRoute(item.label)}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group
                    ${isActive ? "bg-purple-50 text-purple-600" : "hover:bg-purple-600 hover:text-white text-slate-500"}
                  `}>
                    <span className={`${isActive ? "text-purple-600" : "text-slate-400 group-hover:text-white"}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm font-bold">
                        {item.label}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              {/* Sub-menu Items (Dropdown Content) */}
              {isOpen && !isCollapsed && (
                <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                  {isSignatories && signatories.map((sig) => (
                    <Link key={sig.id} href={`/${role}/signatories/${sig.id}`} className="block py-2 group">
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight group-hover:text-purple-600 transition-colors">
                        {sig.role}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate group-hover:text-slate-600">
                        {sig.person.name}
                      </p>
                    </Link>
                  ))}

                  {isActivityLogs && (
                    <>
                      <Link href={linkToRoute("Recent Logs")} className="block py-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors">
                        Recent Logs
                      </Link>
                      <Link href={linkToRoute("System History")} className="block py-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors">
                        System History
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
      <div className="px-4 py-6 border-t border-slate-100 mt-auto">
        <Link 
          href="/helpandsupport"
          target="_blank"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-purple-600 hover:text-white transition-all group"
        >
          <HelpCircle size={20} className="text-slate-400 group-hover:text-white shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-bold">Help & Support</span>
              <span className="text-[10px] text-slate-400 group-hover:text-purple-100">Documentation</span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}