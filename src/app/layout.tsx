import type { Metadata } from "next";
import { Inter_Tight, Newsreader } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import "@/styles/globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: site.name, template: `%s — ${site.name}` },
    description: site.description,
    openGraph: { siteName: site.name, type: "website" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a href="#main" className="visually-hidden">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
