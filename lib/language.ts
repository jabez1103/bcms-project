"use client";

import { useCallback, useEffect, useState } from "react";
import { getAppearancePreferences } from "@/lib/userPreferences";

export type AppLanguage = "en" | "fil";

type TranslationKey =
  | "searchPlaceholder"
  | "globalSearch"
  | "searching"
  | "typeAtLeastTwoChars"
  | "noMatchingResults"
  | "notifications"
  | "markAllAsRead"
  | "notificationSettings"
  | "showLess"
  | "seeMore"
  | "noNotificationsFound"
  | "profile"
  | "settings"
  | "logout"
  | "bisuClearance"
  | "managementSystem"
  | "home"
  | "signatories"
  | "activityLogs"
  | "recentLogs"
  | "systemHistory"
  | "helpAndSupport"
  | "documentation";

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    searchPlaceholder: "Search pages, users, requirements...",
    globalSearch: "Global Search",
    searching: "Searching...",
    typeAtLeastTwoChars: "Type at least 2 characters.",
    noMatchingResults: "No matching results.",
    notifications: "Notifications",
    markAllAsRead: "Mark all as read",
    notificationSettings: "Notification Settings",
    showLess: "Show less",
    seeMore: "See more",
    noNotificationsFound: "No notifications found",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    bisuClearance: "BISU CLEARANCE",
    managementSystem: "Management System",
    home: "Home",
    signatories: "Signatories",
    activityLogs: "Activity Logs",
    recentLogs: "Recent Logs",
    systemHistory: "System History",
    helpAndSupport: "Help & Support",
    documentation: "Documentation",
  },
  fil: {
    searchPlaceholder: "Maghanap ng pahina, user, requirements...",
    globalSearch: "Pangkalahatang Hanap",
    searching: "Naghahanap...",
    typeAtLeastTwoChars: "Mag-type ng hindi bababa sa 2 character.",
    noMatchingResults: "Walang katugmang resulta.",
    notifications: "Mga Abiso",
    markAllAsRead: "Markahan lahat bilang nabasa",
    notificationSettings: "Settings ng Abiso",
    showLess: "Mas kaunti",
    seeMore: "Tingnan pa",
    noNotificationsFound: "Walang nahanap na abiso",
    profile: "Profile",
    settings: "Settings",
    logout: "Mag-sign out",
    bisuClearance: "BISU CLEARANCE",
    managementSystem: "Management System",
    home: "Home",
    signatories: "Signatories",
    activityLogs: "Activity Logs",
    recentLogs: "Recent Logs",
    systemHistory: "System History",
    helpAndSupport: "Tulong at Suporta",
    documentation: "Dokumentasyon",
  },
};

function readLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const prefs = getAppearancePreferences();
  return prefs.language === "fil" ? "fil" : "en";
}

export function useAppLanguage() {
  const [language, setLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    const sync = () => setLanguage(readLanguage());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("bcms:prefs-changed", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bcms:prefs-changed", sync as EventListener);
    };
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? translations.en[key],
    [language]
  );

  return { language, t };
}
