import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/type/PageTitle";
import { getTexts } from "@/lib/content";
import styles from "./texts.module.css";

export const metadata: Metadata = { title: "Texts" };

const kindLabel = { statement: "Statement", essay: "Essay", press: "Press", interview: "Interview" };

export default function TextsPage() {
  const texts = getTexts();
  return (
    <div className="container">
      <PageTitle>Texts</PageTitle>
      <ul className={styles.list}>
        {texts.map((text) => (
          <li key={text.slug}>
            <Link href={`/texts/${text.slug}`} className={styles.row}>
              <span className={styles.kind}>{kindLabel[text.kind]}</span>
              <span className={styles.title}>{text.title}</span>
              <span className={styles.meta}>
                {[text.author, text.publication, text.year].filter(Boolean).join(", ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
