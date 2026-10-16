"use client";

import { useState } from "react";
import styles from "./Highlight.module.css";

/**
 * The small venue map, privacy-friendly: nothing is loaded from Google until the visitor clicks
 * "View location". Before that the frame shows a quiet drawn plan (no external request, no
 * cookies). After the click the Google map loads in the same frame and the tile becomes a link
 * to the route in Google Maps, as before.
 */
export function MapTile({
  embedUrl,
  routeUrl,
  label,
  mapTitle,
  note,
  venueName,
}: {
  embedUrl: string;
  routeUrl: string;
  /** "View location" */
  label: string;
  /** Title of the map iframe */
  mapTitle: string;
  /** Short note under the drawn plan, e.g. "Map loads from Google after a click" */
  note: string;
  venueName: string;
}) {
  const [loaded, setLoaded] = useState(false);

  const plan = (
    <span className={styles.mapPlan}>
      {loaded ? (
        <iframe
          src={embedUrl}
          title={mapTitle}
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
          className={styles.mapFrame}
        />
      ) : (
        <span className={styles.mapPreview} aria-hidden="true">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            className={styles.mapDrawing}
          >
            <path d="M-5 30 C25 26 55 38 105 32" />
            <path d="M-5 68 C30 72 60 60 105 66" />
            <path d="M32 -5 C28 30 38 60 30 105" />
            <path d="M70 -5 C74 25 64 70 72 105" />
            <path d="M-5 85 L45 50 L105 12" className={styles.mapRoad} />
            <path
              d="M50 30 c-7 0-12 5-12 12 0 9 12 20 12 20s12-11 12-20c0-7-5-12-12-12Z"
              className={styles.mapPin}
            />
            <circle cx="50" cy="42" r="4" className={styles.mapPinDot} />
          </svg>
          <span className={styles.mapNote}>{note}</span>
        </span>
      )}
    </span>
  );

  const caption = (
    <span className={styles.mapCaption} aria-hidden="true">
      <span>{label}</span>
      <span>{loaded ? "↗" : "→"}</span>
    </span>
  );

  return loaded ? (
    <a
      href={routeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.map}
      aria-label={`${label}: ${venueName}`}
    >
      {plan}
      {caption}
    </a>
  ) : (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className={`${styles.map} ${styles.mapButton}`}
      aria-label={`${label}: ${venueName}`}
    >
      {plan}
      {caption}
    </button>
  );
}
