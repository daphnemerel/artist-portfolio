import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { I18nProvider } from "@/i18n/client";
import { isLocale, localeTag, locales } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { getSite } from "@/lib/content";
import { defaultShareImage } from "@/i18n/metadata";
import { siteUrl } from "@/lib/site-url";
import "@/styles/globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

/** Both languages are built in advance (other first segments never get here: see src/proxy.ts). */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const site = getSite(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: site.name, template: `%s — ${site.name}` },
    description: site.description,
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: localeTag[lang].replace("-", "_"),
      images: [defaultShareImage(lang)],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = dictionaries[lang];

  return (
    <html lang={lang} className={`${sans.variable} ${serif.variable}`}>
      <body>
        <I18nProvider locale={lang} t={t}>
          <a href="#main" className="visually-hidden skip-link">
            {t.meta.skip}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
