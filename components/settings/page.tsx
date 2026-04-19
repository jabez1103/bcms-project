"use client";
import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { User, Shield, Bell, Palette, X, ArrowLeft, ChevronRight } from "lucide-react";

// Import your modular tab components
import AccountTab from "./tabs/account";
import SecurityTab from "./tabs/security";
import NotificationTab from "./tabs/notification";
import AppearanceTab from "./tabs/appearance";

interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
  defaultTab?: string; // Add this prop
}

export default function SettingsModal({ onClose, isOpen, defaultTab }: SettingsModalProps) {
  // Initialize with defaultTab or "Account"
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
      <div className="fixed inset-0 bg-white z-[60] flex flex-col font-sans">
        <header className="p-4 border-b flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center gap-3">
            {showMobileContent && (
              <button onClick={() => setShowMobileContent(false)} className="p-1">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-bold text-gray-900">
              {showMobileContent ? menuItems.find((i) => i.id === activeTab)?.label : "Settings"}
            </h2>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded-full">
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
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl active:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-purple-600">{item.icon}</span>
                    <span className="font-semibold text-gray-700">{item.label}</span>
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <Rnd
        size={{ width: 720, height: 560 }}
        position={position}
        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
        bounds="window"
        enableResizing={false}
        dragHandleClassName="drag-handle"
        className="z-50"
      >
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl flex overflow-hidden border border-gray-200">
          <aside className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col">
            <div className="drag-handle p-6 cursor-move">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">BCMS Dashboard</h2>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                      : "text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 flex flex-col bg-white">
            <header className="px-8 py-5 flex justify-between items-center border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
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