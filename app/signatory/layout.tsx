"use client";
import { Header } from "@/components/Header";
import { LogoutModal } from "@/components/LogoutModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Sidebar } from "@/components/Sidebar";
import { PageType } from "@/types";
import { useState } from "react";
import { Footer } from "@/components/Footer";

export default function SignatoryLayout({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState<PageType>("Home");
  const [overlayPage, setOverlayPage] = useState<"Settings" | "Log out" | null>(null);

  const handlePageClick = (page: PageType) => {
    if (page === "Settings" || page === "Log out") {
      setOverlayPage(page);
    } else {
      setActivePage(page);
      setOverlayPage(null);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 1. Header stays fixed at top */}
      <Header role="signatory" activePage="Home" />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 2. Sidebar stays fixed at left */}
        <Sidebar role="signatory" onPageClick={handlePageClick} activePage={activePage} />
        
        {/* 3. SCROLLABLE WRAPPER */}
        {/* We move 'overflow-y-auto' here so everything inside scrolls together */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f4f6f9] overflow-y-auto"> 
          
          {/* Main content - removed internal scroll */}
          <main className="flex-1 p-4 bg-gray-50">
            {children}
          </main>
          
          {/* 4. Footer - now follows the content */}
          <Footer />
          
        </div>

        {/* Overlay Modals */}
        {overlayPage === "Settings" && <SettingsModal onClose={() => setOverlayPage(null)} />}
        {overlayPage === "Log out" && <LogoutModal onClose={() => setOverlayPage(null)} />}
      </div>
    </div>
  );
}