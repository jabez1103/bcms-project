export type NotificationPreferences = {
  system: boolean;
  status: boolean;
  approval: boolean;
  adminAnnouncements: boolean;
};

export type AppearancePreferences = {
  fontSize: "small" | "standard" | "large";
  language: "en" | "fil";
  layout: "standard" | "compact";
  highContrast: boolean;
};

export type SecurityPreferences = {
  autoLogout: "15m" | "30m" | "1h";
  securityAlerts: boolean;
};

const NOTIFICATION_KEY = "bcms_notification_prefs";
const APPEARANCE_KEY = "bcms_appearance_prefs";
const SECURITY_KEY = "bcms_security_prefs";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  system: true,
  status: true,
  approval: true,
  adminAnnouncements: true,
};

export const DEFAULT_APPEARANCE_PREFERENCES: AppearancePreferences = {
  fontSize: "standard",
  language: "en",
  layout: "standard",
  highContrast: false,
};

export const DEFAULT_SECURITY_PREFERENCES: SecurityPreferences = {
  autoLogout: "30m",
  securityAlerts: true,
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("bcms:prefs-changed", { detail: { key } }));
  } catch {
    // ignore storage errors
  }
}

export function getNotificationPreferences(): NotificationPreferences {
  return safeRead(NOTIFICATION_KEY, DEFAULT_NOTIFICATION_PREFERENCES);
}

export function setNotificationPreferences(value: NotificationPreferences): void {
  safeWrite(NOTIFICATION_KEY, value);
}

export function getAppearancePreferences(): AppearancePreferences {
  return safeRead(APPEARANCE_KEY, DEFAULT_APPEARANCE_PREFERENCES);
}

export function setAppearancePreferences(value: AppearancePreferences): void {
  safeWrite(APPEARANCE_KEY, value);
}

export function getSecurityPreferences(): SecurityPreferences {
  return safeRead(SECURITY_KEY, DEFAULT_SECURITY_PREFERENCES);
}

export function setSecurityPreferences(value: SecurityPreferences): void {
  safeWrite(SECURITY_KEY, value);
}

export function applyAppearancePreferences(prefs: AppearancePreferences): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.layout = prefs.layout;
  root.dataset.lang = prefs.language;
  root.classList.toggle("high-contrast", prefs.highContrast);

  const fontSizeMap: Record<AppearancePreferences["fontSize"], string> = {
    small: "15px",
    standard: "16px",
    large: "17px",
  };
  root.style.setProperty("--bcms-font-size-base", fontSizeMap[prefs.fontSize]);
}

