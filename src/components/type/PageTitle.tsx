import type { ReactNode } from "react";
import styles from "./type.module.css";

export function PageTitle({ children, lead }: { children: ReactNode; lead?: ReactNode }) {
  return (
    <header className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>{children}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  );
}
