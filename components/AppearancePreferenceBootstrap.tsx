"use client";

import { useEffect } from "react";
import { applyAppearancePreferences, getAppearancePreferences } from "@/lib/userPreferences";

export function AppearancePreferenceBootstrap() {
  useEffect(() => {
    applyAppearancePreferences(getAppearancePreferences());
  }, []);

  return null;
}

