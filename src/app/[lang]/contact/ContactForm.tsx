"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/client";
import styles from "./contact.module.css";

/*
 * Sends the message to the site's own server route (/api/contact), which emails it to Daphne via
 * Gmail. No keys in the browser; the visitor stays on the page and no mail app opens.
 */
const ENDPOINT = "/api/contact";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ email }: { email: string }) {
  const { t: dict } = useI18n();
  const t = dict.contact.form;
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (name: string) => String(data.get(name) ?? "").trim();

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
          subject: get("subject"),
          message: get("message"),
          botcheck: data.get("botcheck") ? true : "",
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
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const sending = status === "sending";

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
      {/* Spam trap: hidden from people, bots tend to tick it. */}
      <input
        type="checkbox"
        name="botcheck"
        className={styles.botcheck}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

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
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>{t.subject}</span>
        <input name="subject" type="text" placeholder={t.subjectPlaceholder} />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          {t.message}{" "}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </span>
        <textarea
          name="message"
          rows={5}
          placeholder={t.messagePlaceholder}
          required
        />
      </label>
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
        className={styles.formNote}
        role="status"
        aria-live="polite"
        data-status={status}
      >
        {status === "sent" && t.sent}
        {status === "error" && (
          <>
            {t.error}{" "}
            <a href={`mailto:${email}`}>{email}</a>.
            {reason && <span className={styles.reason}>
                {" "}
                ({t.code}: {reason})
              </span>}
          </>
        )}
      </p>
    </form>
  );
}
