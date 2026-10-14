"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import styles from "./ScrollCue.module.css";

/** A small "Scroll" badge at the bottom of the opening photo; it fades away once you scroll. */
export function ScrollCue({ target }: { target: string }) {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={`#${target}`}
      className={styles.cue}
      data-hidden={hidden || undefined}
      aria-label={t.home.scrollLabel}
    >
      <span className={styles.label}>{t.home.scroll}</span>
      <svg
        className={styles.arrow}
        viewBox="0 0 16 24"
        width="12"
        height="18"
        aria-hidden="true"
      >
        <path
          d="M8 1v20M2 15l6 6 6-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </a>
  );
}
