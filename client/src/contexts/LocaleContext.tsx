import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isLocale, localeFromNavigator, type Locale } from "@shared/locales";

const STORAGE_KEY = "skifia-site-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "ru";
  const queryLocale = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(queryLocale)) return queryLocale;
  const savedLocale = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(savedLocale)) return savedLocale;
  return localeFromNavigator(window.navigator.language);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState({}, "", url);
      document.documentElement.lang = next === "uk" ? "uk" : next;
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale === "uk" ? "uk" : locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
