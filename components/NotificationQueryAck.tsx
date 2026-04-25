"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * When a notification deep link includes `?notificationId=`, mark it read
 * server-side and strip the param so the URL stays clean.
 */
export function NotificationQueryAck() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawId = searchParams.get("notificationId");
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    if (!rawId || lastHandled.current === rawId) return;
    const notificationId = Number(rawId);
    if (!Number.isFinite(notificationId) || notificationId <= 0) return;

    lastHandled.current = rawId;

    const stripParam = () => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("notificationId");
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    };

    void fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    })
      .then((res) => {
        if (res.ok) {
          window.dispatchEvent(new CustomEvent("bcms-notifications-updated"));
        }
      })
      .catch(() => {})
      .finally(stripParam);
  }, [rawId, pathname, router, searchParams]);

  return null;
}
