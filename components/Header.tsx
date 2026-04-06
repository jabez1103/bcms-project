"use client";

import { useState } from "react";
import { PageType, UserRole } from "./types";

interface HeaderProps {
  role: UserRole;
  activePage: PageType;
}

const user = {
  avatar: "/monique.png",
  name: "Monique Cantarona",
};

interface NotificationItem {
  id: number;
  title: string;
  content: string;
  read: boolean;
}

export function Header({ role, activePage }: HeaderProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"All" | "Unread">("Unread");
  const [searchValue, setSearchValue] = useState("");

  // All about notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: "New Clearance Request", content: "Student John submitted a request.", read: false },
    { id: 2, title: "Approved Request", content: "Your request has been approved.", read: false },
    { id: 3, title: "Reminder", content: "Complete your pending approvals.", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClickNotification = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const displayedNotifications = notifications.filter(n =>
    notifTab === "All" ? true : !n.read
  );

  // All about search
  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Search:", searchValue);
    }
  };

  const clearSearch = () => setSearchValue("");

  return (
    <header className="flex justify-between items-center px-4 md:px-6 h-[10vh] bg-white border-b border-gray-400 relative">
      {/* LEFT SIDE: Logo + Page Title */}
      <div className="flex items-center space-x-4">
        <img src="/logo.png" alt="Logo" className="w-12 h-12 md:w-14 md:h-14" />
        <div className="text-left">
          <p className="text-sm md:text-base font-bold text-gray-700">BISU Clearance</p>
          <p className="text-xs md:text-sm font-bold text-gray-700">Management System</p>
        </div>
      </div>

      {/* RIGHT SIDE: Search, Notifications, Profile */}
      <div className="flex items-center space-x-4">
        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchEnter}
            className="border border-gray-400 rounded-md px-2 py-1 md:px-3 md:py-2 w-40 md:w-60 text-gray-700 text-xs md:text-sm outline-none focus:border-gray-700 placeholder-gray-500 placeholder-opacity-75"
          />
          {searchValue ? (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>
          ) : (
            <img
              src="/search_icon.png"
              alt="Search Icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 cursor-pointer hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>

        {/* NOTIFICATIONS - FIXED z-index */}
        <div className="relative">
          <button className="relative" onClick={() => setNotifOpen(!isNotifOpen)}>
            <img
              src="/notification.png"
              alt="Notification Icon"
              className="w-5 h-5 md:w-6 md:h-6 cursor-pointer hover:scale-105 transition-transform duration-300"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] md:text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-64 md:w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <div className="px-4 py-2 border-b border-gray-200 font-bold text-gray-700">Notification</div>
              <div className="flex justify-start px-4 py-1 border-b border-gray-200 space-x-4 text-sm md:text-base">
                {["All", "Unread"].map(tab => (
                  <button
                    key={tab}
                    className={`px-2 py-1 ${notifTab === tab ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`}
                    onClick={() => setNotifTab(tab as "All" | "Unread")}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {displayedNotifications.length === 0 && (
                  <p className="p-4 text-gray-500 text-sm">No notifications</p>
                )}
                {displayedNotifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleClickNotification(n.id)}
                    className={`cursor-pointer px-4 py-2 border-b border-gray-100 hover:bg-gray-50 ${!n.read ? "bg-gray-100 font-semibold" : ""}`}
                  >
                    <p className="text-gray-700 text-sm md:text-base">{n.title}</p>
                    <p className="text-gray-500 text-xs md:text-sm">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE DROPDOWN - FIXED z-index & bg */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 md:space-x-3"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <img src={user.avatar} alt="Profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer" />
            <div className="hidden md:block text-left">
              <p className="text-xs md:text-sm font-semibold text-gray-700">{user.name}</p>
              <p className="text-[0.6rem] md:text-xs text-gray-500">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            </div>
            <img
              src="/arrow.png"
              alt="Dropdown Arrow"
              className={`w-4 h-4 md:w-6 md:h-6 cursor-pointer transform transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 md:w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              <button className="w-full text-gray-700 text-left px-4 py-2.5 hover:bg-purple-50 text-sm transition-colors first:rounded-t-lg">
                Profile
              </button>
              <button className="w-full text-gray-700 text-left px-4 py-2.5 hover:bg-purple-50 text-sm transition-colors">
                Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button className="w-full text-red-600 text-left px-4 py-2.5 hover:bg-red-50 text-sm transition-colors last:rounded-b-lg">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}