"use client";

import { createContext, useContext, type ReactNode } from "react";
import { localePath, type Locale } from "./config";
import type { Dictionary } from "./dictionaries";

type Value = { locale: Locale; t: Dictionary };
const I18nContext = createContext<Value | null>(null);

/** Gives Client Components the current language and its texts (set once in the root layout). */
export function I18nProvider({ locale, t, children }: Value & { children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return { ...value, href: (path: string) => localePath(value.locale, path) };
}
