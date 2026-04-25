"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import DesktopLogin from "../../components/login/desktopLogInPage";
import MobileLogin from "../../components/login/mobileLoginPage";

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

  if (!isMounted) return null;

  return (
    <Suspense fallback={null}>
      {isMobile ? <MobileLogin /> : <DesktopLogin />}
    </Suspense>
  );
}
