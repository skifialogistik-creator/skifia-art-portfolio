import { localeLabels, localeOrder } from "@shared/locales";
import { useLocale } from "@/contexts/LocaleContext";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  return <div className={`language-switcher ${compact ? "language-switcher--compact" : ""}`} aria-label="Выбор языка">
    {localeOrder.map((option) => <button key={option} type="button" onClick={() => setLocale(option)} aria-pressed={locale === option} className={`language-switcher__button ${locale === option ? "is-active" : ""}`}>{localeLabels[option]}</button>)}
  </div>;
}
