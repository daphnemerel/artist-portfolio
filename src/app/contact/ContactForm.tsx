"use client";

import { useState, type FormEvent } from "react";
import styles from "./contact.module.css";

/*
 * No server and no paid form service: on send, the visitor's own mail app opens with the message
 * filled in, addressed to Daphne. Nothing is stored or sent by the website itself.
 */
export function ContactForm({ email }: { email: string }) {
  const [opened, setOpened] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const subject = get("subject") || "Message via daphnemerel website";
    const body = `${get("message")}\n\n— ${get("name")}\n${get("email")}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          Name <span className={styles.required} aria-hidden="true">*</span>
        </span>
        <input name="name" type="text" autoComplete="name" placeholder="Your name" required />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          Email <span className={styles.required} aria-hidden="true">*</span>
        </span>
        <input name="email" type="email" autoComplete="email" placeholder="your@email.com" required />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Subject</span>
        <input name="subject" type="text" placeholder="How can I help?" />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          Message <span className={styles.required} aria-hidden="true">*</span>
        </span>
        <textarea name="message" rows={5} placeholder="Your message…" required />
      </label>
      <button type="submit" className={styles.send}>
        Send message <span aria-hidden="true">→</span>
      </button>
      <p className={styles.formNote} role="status">
        {opened
          ? "Your mail app should open with the message ready to send."
          : "Sending opens your own mail app with the message filled in."}
      </p>
    </form>
  );
}
