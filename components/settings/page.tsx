"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Rnd } from "react-rnd";
import { User, Shield, Bell, Palette, X, ArrowLeft, ChevronRight } from "lucide-react";

// Import your modular tab components
import AccountTab from "./tabs/account";
import SecurityTab from "./tabs/security";
import NotificationTab from "./tabs/notification";
import AppearanceTab from "./tabs/appearance";

import Link from "next/link";

interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
  defaultTab?: string; // Add this prop
}

export default function SettingsModal({ onClose, isOpen, defaultTab }: SettingsModalProps) {
  const pathname = usePathname();
  const previousUrl = useRef<string | null>(null);
  const previousTitle = useRef<string | null>(null);
  const initializedTabFromUrl = useRef(false);
  
  const [activeTab, setActiveTab] = useState("Account");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileContent, setShowMobileContent] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const menuItems = [
    { id: "Account", icon: <User size={18} />, label: "Account" },
    { id: "Security", icon: <Shield size={18} />, label: "Security" },
    { id: "Notifications", icon: <Bell size={18} />, label: "Notifications" },
    { id: "Appearance", icon: <Palette size={18} />, label: "Appearance" },
  ];

  const tabToSlug: Record<string, string> = {
    Account: "account",
    Security: "security",
    Notifications: "notifications",
    Appearance: "appearance",
  };

  const slugToTab: Record<string, string> = {
    account: "Account",
    security: "Security",
    notifications: "Notifications",
    appearance: "Appearance",
  };

  const getUrlWithSettingsTab = (tab: string | null) => {
    const url = new URL(window.location.href);
    if (tab) {
      url.searchParams.set("settings", tabToSlug[tab] ?? "account");
    } else {
      url.searchParams.delete("settings");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  };

  // Sync activeTab with defaultTab prop when modal opens
  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
      // If on mobile, ensure we jump straight to the content
      if (window.innerWidth < 768) {
        setShowMobileContent(true);
      }
    }
  }, [isOpen, defaultTab]);

  // Track the original URL
  useEffect(() => {
    if (!isOpen && previousUrl.current) {
      window.history.replaceState(window.history.state, "", previousUrl.current);
      previousUrl.current = null;
      initializedTabFromUrl.current = false;
      if (previousTitle.current !== null) {
        document.title = previousTitle.current;
        previousTitle.current = null;
      }
      if (isMobile) {
        setShowMobileContent(false);
      }
    }
  }, [isOpen, isMobile, pathname]);

  // Keep URL in sync with Settings tab while modal is open.
  useEffect(() => {
    if (!isOpen) return;
    if (!previousUrl.current) {
      previousUrl.current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    }

    if (!defaultTab && !initializedTabFromUrl.current) {
      const url = new URL(window.location.href);
      const fromUrl = slugToTab[url.searchParams.get("settings") || ""];
      if (fromUrl) {
        setActiveTab(fromUrl);
        if (window.innerWidth < 768) {
          setShowMobileContent(true);
        }
      }
      initializedTabFromUrl.current = true;
    }

    window.history.replaceState(window.history.state, "", getUrlWithSettingsTab(activeTab));
  }, [isOpen, activeTab, defaultTab]);

  // Sync document title with active settings tab while modal is open.
  useEffect(() => {
    if (!isOpen) return;
    if (previousTitle.current === null) {
      previousTitle.current = document.title;
    }
    document.title = `Settings - ${activeTab}`;
  }, [isOpen, activeTab]);


  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);

      if (width >= 768) {
        setPosition({ x: width / 2 - 360, y: height / 2 - 280 });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (isMobile) setShowMobileContent(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Account": return <AccountTab />;
      case "Security": return <SecurityTab />;
      case "Notifications": return <NotificationTab />;
      case "Appearance": return <AppearanceTab />;
      default: return <div className="text-center p-10 text-gray-400">Select a tab</div>;
    }
  };

  if (!isOpen) return null;

  // --- MOBILE VIEW ---
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[80] flex flex-col font-sans">
        <header className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0">
          <div className="flex items-center gap-3">
            {showMobileContent && (
              <button onClick={() => setShowMobileContent(false)} className="p-1">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-bold text-gray-900 dark:text-white">
              {showMobileContent ? menuItems.find((i) => i.id === activeTab)?.label : "Settings"}
            </h2>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs uppercase rounded-full">
            Back
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {!showMobileContent ? (
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl active:bg-gray-100 dark:active:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-brand-600 dark:text-brand-400">{item.icon}</span>
                    <span className="font-semibold text-gray-700 dark:text-slate-200">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))}
            </nav>
          ) : (
            <div className="animate-in slide-in-from-right duration-200">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-80" onClick={onClose} />
      <Rnd
        size={{ width: 720, height: 560 }}
        position={position}
        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
        bounds="window"
        enableResizing={false}
        dragHandleClassName="drag-handle"
        className="z-90"
      >
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex overflow-hidden border border-gray-200 dark:border-slate-800">
          <aside className="w-64 bg-gray-50 dark:bg-slate-950 border-r border-gray-100 dark:border-slate-800 flex flex-col">
            <div className="drag-handle p-6 cursor-move">
              <h2 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">BCMS Dashboard</h2>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.id
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-200 dark:shadow-brand-900/20"
                      : "text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 flex flex-col bg-white dark:bg-slate-900">
            <header className="px-8 py-5 flex justify-between items-center border-b border-gray-50 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h3>
              
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 dark:text-slate-400">
                <X size={20} />
              </button>
            </header>
            <div className="px-8 py-6 overflow-y-auto flex-1">
              {renderContent()}
            </div>
          </main>
        </div>
      </Rnd>
    </>
  );
}
