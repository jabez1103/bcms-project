import { useEffect, useState } from "react";

type CurrentUserResponse = {
    success?: boolean;
    user?: unknown;
    reason?: string;
};

async function fetchCurrentUserWithRetry(): Promise<{ data: CurrentUserResponse; ok: boolean }> {
    const request = async () => {
        const res = await fetch("/api/me", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        });

        // Some failures (proxy/middleware/runtime) can return an empty or non-JSON body.
        // Parse defensively so callers do not crash on `res.json()`.
        const raw = await res.text();
        let data: CurrentUserResponse = {};
        if (raw) {
            try {
                data = JSON.parse(raw) as CurrentUserResponse;
            } catch {
                data = {};
            }
        }
        return { res, data };
    };

    const first = await request();
    if (first.res.ok) return { data: first.data, ok: true };

    // Guard against cookie propagation races immediately after login.
    if (first.res.status === 401) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const second = await request();
        return { data: second.data, ok: second.res.ok };
    }

    return { data: first.data, ok: false };
}

export function useCurrentUser() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        fetchCurrentUserWithRetry()
            .then(({ data, ok }) => {
                if (cancelled) return;
                if (!ok && data?.reason === "session_replaced" && typeof window !== "undefined") {
                    try {
                        localStorage.removeItem("user");
                        sessionStorage.removeItem("user");
                        localStorage.removeItem("token");
                    } catch {}
                    window.location.replace("/login?reason=session-replaced");
                    return;
                }
                if (data?.success) setUser(data.user);
            })
            .catch(() => {
                if (cancelled) return;
                setUser(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { user, loading };
}
