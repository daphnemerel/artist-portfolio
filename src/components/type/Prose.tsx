import styles from "./type.module.css";

/** Renders trusted HTML generated from markdown in content/. */
export function Prose({ html, serif = false }: { html: string; serif?: boolean }) {
  if (!html) return null;
  return (
    <div
      className={`${styles.prose} ${serif ? styles.serif : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
