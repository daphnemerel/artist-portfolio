"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useI18n } from "@/i18n/client";
import styles from "./CommissionForm.module.css";

/*
 * Commission request, in four steps: a work as a starting point (a strip to swipe or drag, as on
 * the homepage), colours, a description, and a size. It is sent through the same server route
 * as the contact form (/api/contact), so it arrives in Daphne's inbox as one tidy email.
 */
const ENDPOINT = "/api/contact";

export type CommissionWork = {
  slug: string;
  title: string;
  image: { url: string; alt: string; width: number; height: number };
};

/** Swatches: the site's own palette plus a few colours that recur in the paintings. */
const PALETTE = [
  { key: "bordeaux", hex: "#6a2e3b" },
  { key: "rose", hex: "#d79a9a" },
  { key: "dustyRose", hex: "#c08a8e" },
  { key: "coral", hex: "#e08a6e" },
  { key: "peach", hex: "#f0bfa0" },
  { key: "terracotta", hex: "#b5583c" },
  { key: "gold", hex: "#c9a14a" },
  { key: "bronze", hex: "#8c5a2b" },
  { key: "ochre", hex: "#b9802f" },
  { key: "sand", hex: "#e4d3b8" },
  { key: "cream", hex: "#f3e9d2" },
  { key: "green", hex: "#3f6b45" },
  { key: "sage", hex: "#9fb59a" },
  { key: "olive", hex: "#76773c" },
  { key: "turquoise", hex: "#5faead" },
  { key: "blue", hex: "#4f5fa8" },
  { key: "navy", hex: "#23314f" },
  { key: "lilac", hex: "#a88bc0" },
  { key: "purple", hex: "#6b3f7a" },
  { key: "white", hex: "#fbf9f6" },
  { key: "black", hex: "#1c1718" },
] as const;

const SIZES = ["s9070", "s6080", "custom"] as const;

type Status = "idle" | "sending" | "sent" | "error";

export function CommissionForm({
  works,
  email,
  intro,
  aside,
}: {
  works: CommissionWork[];
  email: string;
  /** The page intro, set above the form title in the left column. */
  intro?: ReactNode;
  /** A photo in the right column, its bottom on the hairline under the form title. */
  aside?: ReactNode;
}) {
  const { t: dict, href } = useI18n();
  const t = dict.commissions.form;

  const [work, setWork] = useState(works[0]?.slug ?? "");
  const [colours, setColours] = useState<string[]>([]);
  const [size, setSize] = useState<(typeof SIZES)[number]>("s9070");
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState("");
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const toggleColour = (key: string) =>
    setColours((c) =>
      c.includes(key) ? c.filter((k) => k !== key) : [...c, key],
    );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (name: string) => String(data.get(name) ?? "").trim();

    const chosen = works.find((w) => w.slug === work);
    const colourNames = colours.map(
      (k) => t.palette[k as keyof typeof t.palette],
    );
    const sizeText =
      size === "custom"
        ? `${t.sizes.custom}: ${get("customSize") || "—"}`
        : t.sizes[size];
    const summary = [
      `${t.work}: ${chosen?.title ?? "—"}`,
      `${t.colours}: ${colourNames.length ? colourNames.join(", ") : t.none}`,
      ...(get("otherColours")
        ? [`${t.otherColours}: ${get("otherColours")}`]
        : []),
      `${t.size}: ${sizeText}`,
    ];
    const message = `${summary.join("\n")}\n\n${t.describe}:\n${get("description")}`;

    setStatus("sending");
    setReason("");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: get("name"),
          email: get("email"),
          subject: `${t.subjectPrefix}: ${chosen?.title ?? ""}`.trim(),
          message,
          botcheck: data.get("botcheck") ? true : "",
          elapsed: shownAt.current ? Date.now() - shownAt.current : 0,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!response.ok || !result?.ok) {
        setReason(result?.error ?? `http-${response.status}`);
        throw new Error("Submission failed");
      }
      form.reset();
      setColours([]);
      setSize("s9070");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const sending = status === "sending";

  return (
    <section className={styles.request} aria-labelledby="request-title">
      <div className={styles.head} data-aside={aside ? "" : undefined}>
        {intro && <div className={styles.intro}>{intro}</div>}
        <div className={styles.heading} id="aanvraag">
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h2 id="request-title" className={styles.title}>
            {t.title}
          </h2>
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        {/* Spam trap: hidden from people, bots tend to tick it. */}
        <input
          type="checkbox"
          name="botcheck"
          className={styles.botcheck}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {/* 1. A work as the starting point */}
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            <span className={styles.number}>1</span> {t.work}
          </legend>
          <p className={styles.hint}>{t.workHint}</p>
          <WorkStrip
            works={works}
            value={work}
            onChange={setWork}
            selectedLabel={t.selected}
          />
        </fieldset>

        {/* 2. Colours */}
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            <span className={styles.number}>2</span> {t.colours}
          </legend>
          <p className={styles.hint}>{t.coloursHint}</p>
          <ul className={styles.swatches}>
            {PALETTE.map(({ key, hex }) => {
              const on = colours.includes(key);
              return (
                <li key={key}>
                  <label className={styles.swatch} data-on={on || undefined}>
                    <input
                      type="checkbox"
                      name="colours"
                      value={key}
                      checked={on}
                      onChange={() => toggleColour(key)}
                      className={styles.visuallyHidden}
                    />
                    <span
                      className={styles.chip}
                      style={{ background: hex }}
                      aria-hidden="true"
                    />
                    <span>{t.palette[key]}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t.otherColours}</span>
            <input
              name="otherColours"
              type="text"
              maxLength={300}
              placeholder={t.otherColoursPlaceholder}
            />
          </label>
        </fieldset>

        {/* 3. Description and style */}
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            <span className={styles.number}>3</span> {t.describe}
          </legend>
          <label className={styles.field}>
            <span className={styles.hint}>{t.describeHint}</span>
            <textarea
              name="description"
              rows={5}
              maxLength={3500}
              placeholder={t.describePlaceholder}
              required
            />
          </label>
        </fieldset>

        {/* 4. Size */}
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            <span className={styles.number}>4</span> {t.size}
          </legend>
          <div className={styles.sizes}>
            {SIZES.map((key) => (
              <label
                key={key}
                className={styles.size}
                data-on={size === key || undefined}
              >
                <input
                  type="radio"
                  name="size"
                  value={key}
                  checked={size === key}
                  onChange={() => setSize(key)}
                  className={styles.visuallyHidden}
                />
                <span
                  className={styles.sizeShape}
                  data-size={key}
                  aria-hidden="true"
                />
                <span>{t.sizes[key]}</span>
              </label>
            ))}
          </div>
          {size === "custom" && (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t.customSize}</span>
              <input
                name="customSize"
                type="text"
                maxLength={100}
                placeholder={t.customSizePlaceholder}
              />
            </label>
          )}
        </fieldset>

        {/* Contact details, so Daphne can reply */}
        <fieldset className={styles.step}>
          <legend className={styles.legend}>{t.details}</legend>
          <div className={styles.pair}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {t.name}{" "}
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </span>
              <input
                name="name"
                type="text"
                maxLength={120}
                autoComplete="name"
                placeholder={t.namePlaceholder}
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {t.email}{" "}
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </span>
              <input
                name="email"
                type="email"
                maxLength={200}
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                required
              />
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className={styles.send}
          disabled={sending}
          aria-busy={sending}
        >
          {sending ? (
            t.sending
          ) : (
            <>
              {t.send} <span aria-hidden="true">→</span>
            </>
          )}
        </button>
        <p
          className={styles.note}
          role="status"
          aria-live="polite"
          data-status={status}
          data-reason={reason || undefined}
        >
          {status === "sent" && t.sent}
          {status === "error" && (
            <>
              {reason === "rate-limited" ? t.errorBusy : t.error}{" "}
              <a href={`mailto:${email}`}>{email}</a>.
            </>
          )}
        </p>
        <p className={styles.note}>
          {dict.privacy.formNote}{" "}
          <Link href={href("/privacy")}>{dict.privacy.link}</Link>
        </p>
      </form>
    </section>
  );
}

/**
 * The works as a strip of choices: swipe with a finger, drag with the mouse, or use the arrows
 * (the same behaviour as "Recent works" on the homepage). Each work is a radio button.
 */
function WorkStrip({
  works,
  value,
  onChange,
  selectedLabel,
}: {
  works: CommissionWork[];
  value: string;
  onChange: (slug: string) => void;
  selectedLabel: string;
}) {
  const { t } = useI18n();
  const viewport = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const v = viewport.current!;
    const update = () => {
      setAtStart(v.scrollLeft <= 4);
      setAtEnd(v.scrollLeft + v.clientWidth >= v.scrollWidth - 4);
    };
    update();

    // Mouse drag; touch and trackpads scroll the strip natively.
    let drag: { x: number; left: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: v.scrollLeft, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        v.dataset.dragging = "true";
        v.setPointerCapture(e.pointerId);
      }
      v.scrollLeft = drag.left - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (v.hasPointerCapture(e.pointerId))
        v.releasePointerCapture(e.pointerId);
      if (!moved) return;
      // A drag is not a choice: don't select the work under the mouse.
      const stop = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      v.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(
        () => v.removeEventListener("click", stop, { capture: true }),
        0,
      );
      setTimeout(() => delete v.dataset.dragging, 300);
    };
    const noImageDrag = (e: DragEvent) => e.preventDefault();

    v.addEventListener("scroll", update, { passive: true });
    v.addEventListener("pointerdown", onDown);
    v.addEventListener("pointermove", onMove);
    v.addEventListener("pointerup", onUp);
    v.addEventListener("pointercancel", onUp);
    v.addEventListener("dragstart", noImageDrag);
    window.addEventListener("resize", update);
    return () => {
      v.removeEventListener("scroll", update);
      v.removeEventListener("pointerdown", onDown);
      v.removeEventListener("pointermove", onMove);
      v.removeEventListener("pointerup", onUp);
      v.removeEventListener("pointercancel", onUp);
      v.removeEventListener("dragstart", noImageDrag);
      window.removeEventListener("resize", update);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const v = viewport.current!;
    const item = v.querySelector("li") as HTMLElement | null;
    v.scrollBy({
      left: dir * ((item?.offsetWidth ?? 200) + 16),
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.strip}>
      <div className={styles.stripControls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => step(-1)}
          disabled={atStart}
          aria-label={t.home.previous}
        >
          ←
        </button>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => step(1)}
          disabled={atEnd}
          aria-label={t.home.next}
        >
          →
        </button>
      </div>
      <div ref={viewport} className={styles.viewport}>
        <ul className={styles.track}>
          {works.map((w) => {
            const on = w.slug === value;
            return (
              <li key={w.slug} className={styles.item}>
                <label className={styles.card} data-on={on || undefined}>
                  <input
                    type="radio"
                    name="work"
                    value={w.slug}
                    checked={on}
                    onChange={() => onChange(w.slug)}
                    className={styles.visuallyHidden}
                  />
                  <span className={styles.frame}>
                    <Image
                      src={w.image.url}
                      alt={w.image.alt}
                      width={w.image.width}
                      height={w.image.height}
                      sizes="(max-width: 700px) 60vw, 240px"
                      quality={85}
                      className={styles.image}
                    />
                  </span>
                  <span className={styles.cardTitle}>
                    {w.title}
                    {on && (
                      <span className={styles.chosen}> · {selectedLabel}</span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
