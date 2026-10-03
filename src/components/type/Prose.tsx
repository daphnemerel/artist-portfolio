import styles from "./type.module.css";

/** Renders trusted HTML generated from markdown in content/. */
export function Prose({ html }: { html: string }) {
  if (!html) return null;
  return (
    <div
      className={styles.prose}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
