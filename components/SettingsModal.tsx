"use client";

import { Rnd } from "react-rnd";
import { useEffect, useState } from "react";
import {
  User,
  Shield,
  Bell,
  FileText,
  Briefcase,
  Settings,
  History,
  Palette,
  X,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
interface SettingsModalProps {
  isOpen: boolean; // Add this
  onClose: () => void;
}
export function SettingsModal({ onClose, isOpen }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("Account");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileContent, setShowMobileContent] = useState(false);
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

  const menuItems = [
    { id: "Account", icon: <User size={18} />, label: "Profile" },
    { id: "Security", icon: <Shield size={18} />, label: "Security" },
    { id: "Notifications", icon: <Bell size={18} />, label: "Notifications" },
    { id: "Clearance", icon: <FileText size={18} />, label: "Clearance" },
    { id: "Signatory", icon: <Briefcase size={18} />, label: "Signatory" },
    { id: "Admin", icon: <Settings size={18} />, label: "Admin Panel" },
    { id: "Logs", icon: <History size={18} />, label: "Logs" },
    { id: "Appearance", icon: <Palette size={18} />, label: "Appearance" },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (isMobile) setShowMobileContent(true);
  };

  // Helper to render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Account":
      case "Security":
        // Since you want them to only change password,
        // both "Profile" and "Security" can point to the same component
        return <ProfileContent />;
      default:
        const label =
          menuItems.find((item) => item.id === activeTab)?.label || activeTab;
        return <PlaceholderTab name={label} />;
    }
  };
  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col font-sans">
        <header className="p-4 border-b flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center gap-3">
            {showMobileContent && (
              <button
                onClick={() => setShowMobileContent(false)}
                className="p-1"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="font-bold text-gray-900">
              {showMobileContent
                ? menuItems.find((i) => i.id === activeTab)?.label
                : "Settings"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded-full"
          >
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
                    <span className="font-semibold text-gray-700">
                      {item.label}
                    </span>
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

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
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
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                BCMS Dashboard
              </h2>
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
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
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

function ProfileContent() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 border-2 border-white shadow-sm">
          <User size={32} />
        </div>
        <div className="text-center sm:text-left">
          <h4 className="font-bold text-gray-800">Account Identity</h4>
          <p className="text-xs text-gray-500">
            Identity details are managed by the registrar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { label: "Full Name", value: "Jabez Bautista" },
          { label: "Email", value: "jabez@bisu.edu.ph" },
          { label: "Username", value: "jabez_dev" },
        ].map((field) => (
          <div key={field.label} className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              {field.label}
            </label>
            <div className="w-full p-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed">
              {field.value}
            </div>
          </div>
        ))}
      </div>

      <hr className="border-gray-100" />

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-800">Security</h4>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none text-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none text-sm font-medium"
            />
          </div>
        </div>
      </div>

      <button className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform hover:bg-purple-700 shadow-lg shadow-purple-200">
        Update Password
      </button>
    </div>
  );
}

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
      <p className="text-sm italic">{name} settings coming soon...</p>
    </div>
  );
}
