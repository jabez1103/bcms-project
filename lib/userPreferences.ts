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
  const merged = safeRead(NOTIFICATION_KEY, DEFAULT_NOTIFICATION_PREFERENCES);
  return {
    system: Boolean(merged.system),
    status: Boolean(merged.status),
    approval: Boolean(merged.approval),
    adminAnnouncements: Boolean(merged.adminAnnouncements),
  };
}

export function setNotificationPreferences(value: NotificationPreferences): void {
  safeWrite(NOTIFICATION_KEY, value);
}

export function getAppearancePreferences(): AppearancePreferences {
  const merged = safeRead(APPEARANCE_KEY, DEFAULT_APPEARANCE_PREFERENCES);
  const validFontSize = ["small", "standard", "large"] as const;
  const validLanguage = ["en", "fil"] as const;
  const validLayout = ["standard", "compact"] as const;

  return {
    fontSize: validFontSize.includes(merged.fontSize as AppearancePreferences["fontSize"])
      ? (merged.fontSize as AppearancePreferences["fontSize"])
      : DEFAULT_APPEARANCE_PREFERENCES.fontSize,
    language: validLanguage.includes(merged.language as AppearancePreferences["language"])
      ? (merged.language as AppearancePreferences["language"])
      : DEFAULT_APPEARANCE_PREFERENCES.language,
    layout: validLayout.includes(merged.layout as AppearancePreferences["layout"])
      ? (merged.layout as AppearancePreferences["layout"])
      : DEFAULT_APPEARANCE_PREFERENCES.layout,
    highContrast: Boolean(merged.highContrast),
  };
}

export function setAppearancePreferences(value: AppearancePreferences): void {
  safeWrite(APPEARANCE_KEY, value);
}

export function getSecurityPreferences(): SecurityPreferences {
  const merged = safeRead(SECURITY_KEY, DEFAULT_SECURITY_PREFERENCES);
  const validAutoLogout = ["15m", "30m", "1h"] as const;

  return {
    autoLogout: validAutoLogout.includes(merged.autoLogout as SecurityPreferences["autoLogout"])
      ? (merged.autoLogout as SecurityPreferences["autoLogout"])
      : DEFAULT_SECURITY_PREFERENCES.autoLogout,
    securityAlerts: Boolean(merged.securityAlerts),
  };
}

export function setSecurityPreferences(value: SecurityPreferences): void {
  safeWrite(SECURITY_KEY, value);
}

export function applyAppearancePreferences(prefs: AppearancePreferences): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  root.dataset.layout = prefs.layout;
  root.dataset.lang = prefs.language;
  root.lang = prefs.language === "fil" ? "fil" : "en";
  root.classList.toggle("high-contrast", prefs.highContrast);
  root.classList.toggle("mobile-compact", prefs.layout === "compact");
  body?.classList.toggle("mobile-compact", prefs.layout === "compact");

  const fontSizeMap: Record<AppearancePreferences["fontSize"], string> = {
    small: "15px",
    standard: "16px",
    large: "17px",
  };
  root.style.setProperty("--bcms-font-size-base", fontSizeMap[prefs.fontSize]);
}

