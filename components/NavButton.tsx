"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface NavButtonProps {
  label: string;
  icon: React.ReactNode; // Changed from string to React.ReactNode
  active?: boolean;
  hideLabel?: boolean;
  onClick?: () => void;
  showArrow?: boolean;
  isDropdownOpen?: boolean;
}

export function NavButton({
  label,
  icon,
  active,
  hideLabel,
  onClick,
  showArrow,
  isDropdownOpen,
}: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group
        ${active 
          ? "bg-purple-50 text-purple-600" 
          : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
        }
      `}
    >
      {/* --- ICON CONTAINER --- */}
      <div className={`flex-shrink-0 transition-colors ${active ? "text-purple-600" : "text-slate-400 group-hover:text-purple-500"}`}>
        {icon}
      </div>

      {/* --- LABEL --- */}
      {!hideLabel && (
        <span className={`text-sm font-bold truncate flex-1 text-left ${active ? "text-slate-900" : ""}`}>
          {label}
        </span>
      )}

      {/* --- DROPDOWN ARROW --- */}
      {!hideLabel && showArrow && (
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-purple-600" : "text-slate-400"}`}
        />
      )}

      {/* --- TOOLTIP (Visible only when collapsed) --- */}
      {hideLabel && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}

      {/* --- ACTIVE INDICATOR (Vertical Line) --- */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-r-full" />
      )}
    </button>
  );
}