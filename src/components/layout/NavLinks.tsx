"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/client";
import { navLinks } from "./navigation";
import styles from "./Header.module.css";


/** Centred navigation, right-hand actions, and a text Menu toggle that folds both away on mobile. */
export function NavLinks({ actions }: { actions: ReactNode }) {
  const pathname = usePathname();
  const { t, href: localize } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="main-nav header-actions"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? t.nav.close : t.nav.menu}
        <svg viewBox="0 0 24 16" width="22" height="15" aria-hidden="true">
          {open ? (
            <path d="M5 1l14 14M19 1L5 15" stroke="currentColor" strokeWidth="1.25" />
          ) : (
            <path d="M0 1h24M0 8h24M0 15h24" stroke="currentColor" strokeWidth="1.25" />
          )}
        </svg>
      </button>
      <nav id="main-nav" aria-label={t.nav.main} className={styles.nav} data-open={open}>
        <ul>
          {navLinks.map(({ href: path, key }) => {
            const href = localize(path);
            const label = t.nav[key];
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={active ? styles.active : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div id="header-actions" className={styles.actions} data-open={open}>
        {actions}
      </div>
    </>
  );
}
