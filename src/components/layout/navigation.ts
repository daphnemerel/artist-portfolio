import type { Dictionary } from "@/i18n/dictionaries";

/** Main sections, shared by the header and the footer (paths without language; labels per language). */
export const navLinks: { href: string; key: keyof Dictionary["nav"] }[] = [
  { href: "/works", key: "works" },
  { href: "/exhibitions", key: "exhibitions" },
  { href: "/commissions", key: "commissions" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
];
