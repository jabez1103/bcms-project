"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavButton } from "./NavButton";
import { PageType, UserRole } from "./types";

const signatoriesData = [
  { id: 1, role: "Cashier", name: "Rebecca C. Remulta" },
  { id: 2, role: "Librarian", name: "Carmella C. Sarabello" },
  { id: 13, role: "Guidance Counselor", name: "Maria L. Santos" },
  { id: 14, role: "Clinic / Medical", name: "Dr. Jose Rizal" },
  { id: 15, role: "Sports Office", name: "Coach Manny P." },
  { id: 3, role: "Director, SAS", name: "Patricio S. Doroy, PhD" },
  { id: 4, role: "Dean", name: "Rey Anthony G. Godmalin" },
];

interface SidebarProps {
  role: UserRole;
  activePage: PageType;
  onPageClick: (page: PageType) => void;
}

export function Sidebar({ role, activePage, onPageClick }: SidebarProps) {
  const [signatoriesOpen, setSignatoriesOpen] = useState(false);
  const [activityLogsOpen, setActivityLogsOpen] = useState(false);
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  let topLinks: PageType[] = [];
  if (role === "student") topLinks = ["Home", "Signatories", "Activity Logs"];
  if (role === "admin")
    topLinks = [
      "Home",
      "User Accounts",
      "Clearance Periods",
      "Clearance Progress",
    ];
  if (role === "signatory")
    topLinks = [
      "Home",
      "Manage Requirements",
      "Student Clearance Status",
      "Review Submissions",
    ];

  const linkToRoute = (link: string) => {
    const slug = link.toLowerCase().replace(/ /g, "-");
    return slug === "home" ? `/${role}/home` : `/${role}/${slug}`;
  };

  return (
    <aside
      className={`${isCollapsed ? "w-15" : "w-64"} bg-white border-r border-gray-400 h-full flex flex-col text-black transition-all duration-300 relative`}
    >
      {/* TOGGLE BUTTON */}
      <img
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-white border w-7 h-7 border-gray-400 rounded-full p-1 hover:bg-gray-100 hidden md:block cursor-pointer z-30"
        src={isCollapsed ? "/forward.png" : "/back.png"}
        alt={isCollapsed ? "Expand" : "Collapse"}
      />

      {/* TOP MENU */}
      <div className="flex flex-col overflow-y-auto px-2 md:px-4 space-y-1 md:space-y-2 h-full py-6">
        {topLinks.map((link) => {
          const isDropdown = link === "Signatories" || link === "Activity Logs";
          const isOpen =
            link === "Signatories" ? signatoriesOpen : activityLogsOpen;

          return (
            <div key={link} className="w-full">
              {/* Top-level NavButton */}
              {isDropdown ? (
                <NavButton
                  label={link}
                  hideLabel={isCollapsed}
                  icon={`/${link.toLowerCase().replace(/ /g, "_")}.png`}
                  active={pathname.startsWith(linkToRoute(link))}
                  onClick={() => {
                    if (link === "Signatories")
                      setSignatoriesOpen(!signatoriesOpen);
                    if (link === "Activity Logs")
                      setActivityLogsOpen(!activityLogsOpen);
                  }}
                  showArrow
                  isDropdownOpen={isOpen}
                />
              ) : (
                <Link href={linkToRoute(link)}>
                  <NavButton
                    label={link}
                    hideLabel={isCollapsed}
                    icon={`/${link.toLowerCase().replace(/ /g, "_")}.png`}
                    active={pathname.startsWith(linkToRoute(link))}
                  />
                </Link>
              )}

              {/* DROPDOWN ITEMS */}
              {link === "Signatories" && isOpen && !isCollapsed && (
                <div className="mt-1 ml-6 space-y-1 border-l-2 border-purple-100 pl-2">
                  {signatoriesData.map((sig) => (
                    <Link key={sig.id} href={`/${role}/signatories/${sig.id}`}>
                      <div
                        className={`px-3 py-2 rounded-lg cursor-pointer ${pathname === `/${role}/signatories/${sig.id}` ? "bg-purple-50" : "hover:bg-gray-50"}`}
                      >
                        <p className="text-[11px] font-bold text-gray-800">
                          {sig.role}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate mt-1">
                          {sig.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {link === "Activity Logs" && isOpen && !isCollapsed && (
                <div className="mt-1 ml-6 space-y-1 border-l-2 border-purple-100 pl-2">
                  <Link href={linkToRoute("Recent Logs")}>
                    <NavButton
                      label="Recent Logs"
                      active={pathname === linkToRoute("Recent Logs")}
                    />
                  </Link>
                  <Link href={linkToRoute("System History")}>
                    <NavButton
                      label="System History"
                      active={pathname === linkToRoute("System History")}
                    />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM MENU */}
      <div className="flex flex-col px-2 md:px-4 pt-4 border-t border-gray-200 mt-auto space-y-1">
        <NavButton
          label="Settings"
          icon="/settings.png"
          active={false}
          hideLabel={isCollapsed}
          onClick={() => onPageClick("Settings")}
        />
        <NavButton
          label="Log out"
          icon="/log_out.png"
          hideLabel={isCollapsed}
          active={false}
          onClick={() => onPageClick("Log out")}
        />
      </div>
    </aside>
  );
}
