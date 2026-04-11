"use client";

import { useEffect, useState } from "react";
import DesktopLogin from "@/components/login/DesktopLoginPage";
import MobileLogin from "@/components/login/MobileLoginPage";

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

  return isMobile ? <MobileLogin /> : <DesktopLogin />;
}