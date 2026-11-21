"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import styles from "./Consent.module.css";

/*
 * Google Analytics 4, only after consent (AVG/GDPR).
 *
 * - Nothing from Google is loaded until the visitor clicks "Accept". "Decline" is just as easy.
 * - The choice is kept in localStorage; "Cookie settings" in the footer reopens this notice, so a
 *   visitor can withdraw at any time (the GA cookies are then removed).
 * - Page views: the config call counts the first page; later pages are counted by GA4's own
 *   "page changes based on browser history events" (enhanced measurement, on by default).
 *   No page_view is sent by hand, so nothing is counted twice.
 * - Advertising features and Google signals are off.
 * - GA only loads on the live domains, so local builds and Vercel previews are never measured.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5KC8GQWTC6";
const STORAGE_KEY = "dm-analytics-consent";
const OPEN_EVENT = "dm:consent-open";
const LIVE_HOSTS = ["daphnemerel.com", "www.daphnemerel.com", "v0-daphnemerel.vercel.app"];

type Choice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readChoice(): Choice | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* private mode: the choice then lasts for this page only */
  }
}

function loadAnalytics() {
  if (window.gtag || !LIVE_HOSTS.includes(window.location.hostname)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

/** Removes the Google Analytics cookies (_ga, _ga_…) for this domain and its parent domain. */
function removeAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

export function ConsentBanner() {
  const { t, href } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readChoice();
    if (choice === "granted") loadAnalytics();
    if (choice === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const choose = (choice: Choice) => {
    const before = readChoice();
    saveChoice(choice);
    setOpen(false);
    if (choice === "granted") {
      loadAnalytics();
    } else if (before === "granted" || window.gtag) {
      // Withdrawn: stop GA, remove its cookies and reload so its script is gone.
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      removeAnalyticsCookies();
      window.location.reload();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.banner} role="region" aria-label={t.consent.label}>
      <p className={styles.text}>
        {t.consent.text}{" "}
        <Link href={href("/privacy")} className={styles.more}>
          {t.consent.more}
        </Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => choose("denied")}>
          {t.consent.decline}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.accept}`}
          onClick={() => choose("granted")}
        >
          {t.consent.accept} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

/** Small link in the footer that reopens the notice, to change or withdraw consent. */
export function ConsentSettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={styles.settings}
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      {label}
    </button>
  );
}
