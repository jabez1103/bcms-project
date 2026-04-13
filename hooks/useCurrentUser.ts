import { useEffect, useState } from "react";


export function useCurrentUser() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/me")
            .then(res => res.json())
            .then(data => {
                if (data.success) setUser(data.user);
            })
            .finally(() => setLoading(false));
    }, []);

    return { user, loading };
}