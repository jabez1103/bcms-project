"use client";

import { Suspense } from "react";
import { Header } from "@/components/Header";
import { NotificationQueryAck } from "@/components/NotificationQueryAck";
import { LogoutModal } from "@/components/LogoutModal";
import  SettingsModal  from "@/components/settings/page";
import { Sidebar } from "@/components/Sidebar";
import { PageType } from "@/types/index";
import { useState } from "react";
import { Footer } from "@/components/Footer";

export default function SignatoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePage, setActivePage] = useState<PageType>("Home");
  const [overlayPage, setOverlayPage] = useState<
    "Settings" | "Log out" | null
  >(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handlePageClick = (page: PageType) => {
    if (page === "Settings" || page === "Log out") {
      setOverlayPage(page);
    } else {
      setActivePage(page);
      setOverlayPage(null);
    }
  };

  return (
    <div className="mobile-compact flex flex-col h-screen overflow-hidden">
      <Suspense fallback={null}>
        <NotificationQueryAck />
      </Suspense>
      {/* HEADER */}
      <Suspense fallback={null}>
        <Header
          role="signatory"
          activePage={activePage}
          onPageClick={handlePageClick}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
        />
      </Suspense>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <Sidebar
          role="signatory"
          onPageClick={handlePageClick}
          activePage={activePage}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* MAIN WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f4f6f9] dark:bg-slate-950 overflow-y-auto">
          <main className="flex-1 p-2.5 sm:p-4 bg-transparent">{children}</main>

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
