import type { ReactNode } from "react";
import styles from "./type.module.css";

/** Small metadata label, e.g. a year column or section heading in an index. */
export function Label({ children, as: Tag = "span" }: { children: ReactNode; as?: "span" | "h2" | "h3" | "p" }) {
  return <Tag className={styles.label}>{children}</Tag>;
}
