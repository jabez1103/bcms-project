"use client";

import { Header } from "@/components/Header";
import { LogoutModal } from "@/components/LogoutModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Sidebar } from "@/components/Sidebar";
import { PageType } from "@/types/index";
import { useState } from "react";
import { Footer } from "@/components/Footer";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePage, setActivePage] = useState<PageType>("Home");
  const [overlayPage, setOverlayPage] = useState<
    "Settings" | "Log out" | null
  >(null);

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
      {/* HEADER */}
      <Header
        role="student"
        activePage={activePage}
        onPageClick={handlePageClick}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar
          role="student"
          onPageClick={handlePageClick}
          activePage={activePage}
        />

        {/* MAIN WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f4f6f9] overflow-y-auto">
          <main className="flex-1 p-4 bg-white">{children}</main>

          <Footer />
        </div>

        {/* MODALS */}
        <SettingsModal
          isOpen={overlayPage === "Settings"}
          onClose={() => setOverlayPage(null)}
        />

        <LogoutModal
          isOpen={overlayPage === "Log out"}
          onClose={() => setOverlayPage(null)}
        />
      </div>
    </div>
  );
}