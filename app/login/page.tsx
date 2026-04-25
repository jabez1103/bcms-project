"use client";

import { useEffect, useState } from "react";
import DesktopLogin from "../../components/login/desktopLogInPage";
import MobileLogin from "../../components/login/mobileLoginPage";
import { roleHomePath } from "@/lib/authSync";

export default function LoginLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 700);
    };

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  /** Already logged in (e.g. second tab on /login): send to role home. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/session/validate", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as { ok?: boolean; role?: string };
        if (!data.ok || !data.role) return;
        window.location.replace(roleHomePath(data.role));
      } catch {
        /* offline / error — stay on login */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return isMobile ? <MobileLogin /> : <DesktopLogin />;
}
