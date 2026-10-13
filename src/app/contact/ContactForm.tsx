"use client";

import { useState, type FormEvent } from "react";
import styles from "./contact.module.css";

/*
 * Sends the message to the site's own server route (/api/contact), which emails it to Daphne via
 * Gmail. No keys in the browser; the visitor stays on the page and no mail app opens.
 */
const ENDPOINT = "/api/contact";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (name: string) => String(data.get(name) ?? "").trim();

    setStatus("sending");
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
      } | null;
      if (!response.ok || !result?.ok) throw new Error("Submission failed");
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
          Name{" "}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          Email{" "}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Subject</span>
        <input name="subject" type="text" placeholder="How can I help?" />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          Message{" "}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </span>
        <textarea
          name="message"
          rows={5}
          placeholder="Your message…"
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
          "Sending…"
        ) : (
          <>
            Send message <span aria-hidden="true">→</span>
          </>
        )}
      </button>
      <p
        className={styles.formNote}
        role="status"
        aria-live="polite"
        data-status={status}
      >
        {status === "sent" && "Thank you — your message has been sent."}
        {status === "error" && (
          <>
            Sorry, something went wrong. Please try again, or email me at{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </>
        )}
      </p>
    </form>
  );
}
