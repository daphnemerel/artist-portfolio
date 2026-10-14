import "server-only";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale, localePath, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

/**
 * The current language in Server Components, read from the /[lang] segment; plus its texts and a
 * helper that keeps internal links in that language: href("/works") → "/nl/works".
 */
export async function getI18n() {
  const value = await lang();
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  return { locale, t: dictionaries[locale], href: (path: string) => localePath(locale, path) };
}
