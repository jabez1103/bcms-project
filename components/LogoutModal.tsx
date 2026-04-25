"use client";

import { Rnd } from "react-rnd";
import { useEffect, useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { clearClientUserCache, writeAuthTabSync } from "@/lib/authSync";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ onClose, isOpen }: LogoutModalProps) {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      const modalW = Math.min(400, width * 0.9);
      const modalH = 340;

      setPosition({
        x: width / 2 - modalW / 2,
        y: height / 2 - modalH / 2,
      });
    };

    handleResize();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [onClose]);

  if (!windowSize) return null;

  const handleLogout = async () => {
    setIsExiting(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      /* still clear client + redirect */
    }
    clearClientUserCache();
    writeAuthTabSync("logout");
    window.location.assign("/login");
  };

  if (!isOpen || (typeof window !== "undefined" && !windowSize)) return null;

  return (
    <>
      {/* Premium Backdrop */}
      <div
        className="fixed inset-0 bg-brand-950/20 backdrop-blur-md z-[200] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <Rnd
        size={{ width: Math.min(400, windowSize.width * 0.9), height: 400 }}
        position={position}
        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
        onResizeStop={(e, dir, ref, delta, pos) => setPosition(pos)}
        bounds="window"
        minWidth={320}
        minHeight={400}
        dragHandleClassName="handle"
        style={{ zIndex: 210, position: "fixed" }}
      >
        <div className="bg-white dark:bg-slate-900 border-0 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full h-full flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          {/* Draggable Header */}
          <div className="handle bg-gray-50/50 dark:bg-slate-800/50 px-6 py-4 flex text-gray-400 dark:text-slate-500 justify-between items-center cursor-move select-none border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="font-bold text-[10px] uppercase tracking-[0.2em]">
                Session Security
              </span>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200/50 dark:hover:bg-slate-700/50 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div className="p-8 flex-1 flex flex-col items-center text-center">
            <div className="mb-6 h-16 w-16 rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shadow-inner">
              <LogOut size={32} />
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              Confirm Sign Out
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed max-w-[240px]">
              Are you sure you want to end your current session?
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50/50 dark:bg-slate-800/50 flex gap-3">
            <button
              onClick={onClose}
              disabled={isExiting}
              className="flex-1 px-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={isExiting}
              className="flex-[1.5] px-4 py-3.5 bg-red-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isExiting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Ending Session...
                </>
              ) : (
                "Sign Out"
              )}
            </button>
          </div>
        </div>
      </Rnd>
    </>
  );
}
