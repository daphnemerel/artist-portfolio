import type { Metadata } from "next";
import { PageTitle } from "@/components/type/PageTitle";
import { getSite } from "@/lib/content";
import styles from "./commissions.module.css";

export const metadata: Metadata = { title: "Commissions" };

// PLACEHOLDER — replace with Daphne's own text about how commissions work.
export default function CommissionsPage() {
  const site = getSite();
  const subject = encodeURIComponent("Commission enquiry");

  return (
    <div className="container">
      <PageTitle>Commissions</PageTitle>
      <div className={styles.commissions}>
        <p className={styles.muted}>Information about commissions to be added.</p>
        {site.email && (
          <a href={`mailto:${site.email}?subject=${subject}`} className="button">
            Ask about a commission →
          </a>
        )}
      </div>
    </div>
  );
}
