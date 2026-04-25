"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  BCMS_AUTH_TAB_SYNC_KEY,
  clearClientUserCache,
  roleHomePath,
  type AuthTabSyncPayload,
} from "@/lib/authSync";

export function AuthCrossTabSync() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== BCMS_AUTH_TAB_SYNC_KEY || e.newValue == null) return;
      let msg: AuthTabSyncPayload;
      try {
        msg = JSON.parse(e.newValue) as AuthTabSyncPayload;
      } catch {
        return;
      }

      if (msg.kind === "login" && msg.role) {
        const dest = roleHomePath(msg.role);
        if (pathname === dest) return;
        window.location.assign(dest);
        return;
      }

      if (msg.kind === "logout") {
        clearClientUserCache();
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [pathname]);

  return null;
}
