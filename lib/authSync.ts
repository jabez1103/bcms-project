/** Cross-tab auth sync (localStorage `storage` event only fires in *other* tabs). */
export const BCMS_AUTH_TAB_SYNC_KEY = "bcms_auth_tab_sync";

export type AuthTabSyncPayload = {
  v: number;
  kind: "login" | "logout";
  role?: string;
};

export function roleHomePath(role: string): string {
  const r = String(role).trim().toLowerCase();
  const routes: Record<string, string> = {
    admin: "/admin/home",
    signatory: "/signatory/home",
    student: "/student/home",
  };
  return routes[r] ?? "/student/home";
}

export function writeAuthTabSync(kind: "login" | "logout", role?: string): void {
  if (typeof window === "undefined") return;
  try {
    const payload: AuthTabSyncPayload = {
      v: Date.now(),
      kind,
      ...(kind === "login" && role ? { role: String(role) } : {}),
    };
    localStorage.setItem(BCMS_AUTH_TAB_SYNC_KEY, JSON.stringify(payload));
  } catch {
    /* private mode / quota */
  }
}

export function clearClientUserCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
  } catch {
    /* ignore */
  }
}
