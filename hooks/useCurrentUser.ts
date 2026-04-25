import { useEffect, useState } from "react";


export function useCurrentUser() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/me")
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok && data?.reason === "session_replaced" && typeof window !== "undefined") {
                    try {
                        localStorage.removeItem("user");
                        sessionStorage.removeItem("user");
                        localStorage.removeItem("token");
                    } catch {}
                    window.location.replace("/login?reason=session-replaced");
                    return null;
                }
                return data;
            })
            .then(data => {
                if (data?.success) setUser(data.user);
            })
            .finally(() => setLoading(false));
    }, []);

    return { user, loading };
}
