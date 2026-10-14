/*
 * Languages of the site. Dutch is the default: every address without a language goes to /nl
 * (see src/proxy.ts), whatever the browser's language. English is only reached via the switcher.
 */
export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

export const isLocale = (value: string | undefined): value is Locale =>
  (locales as readonly string[]).includes(value ?? "");

/** The other language, for the switcher. */
export const otherLocale = (locale: Locale): Locale => (locale === "nl" ? "en" : "nl");

/** `/works` → `/nl/works`. Leaves external links, mailto:, #anchors and already-localised paths alone. */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const first = path.split(/[/?#]/)[1];
  if (isLocale(first)) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** `/nl/works/x?y#z` → `/en/works/x?y#z`: the same page in another language. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  const path = parts.join("/").replace(/\/$/, "");
  return path || `/${to}`;
}

/** BCP 47 tags for <html lang>, Open Graph and date formatting. */
export const localeTag: Record<Locale, string> = { nl: "nl-NL", en: "en-GB" };

/** Fill `{name}` placeholders: format("Hi {name}", { name: "Daphne" }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}
