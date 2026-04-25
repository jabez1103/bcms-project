"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import DesktopLogin from "../../components/login/desktopLogInPage";
import MobileLogin from "../../components/login/mobileLoginPage";
import { roleHomePath } from "@/lib/authSync";

export default function LoginLayout() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    setIsMounted(true);

    const onChange = () => sync();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /** Already logged in (e.g. second tab on /login): send to role home. */
  useEffect(() => {
    if (!isMounted) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as { success?: boolean; user?: { role?: string } };
        const role = data?.user?.role;
        if (!data.success || !role) return;
        window.location.replace(roleHomePath(role));
      } catch {
        /* offline / error — stay on login */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <Suspense fallback={null}>
      {isMobile ? <MobileLogin /> : <DesktopLogin />}
    </Suspense>
  );
}
