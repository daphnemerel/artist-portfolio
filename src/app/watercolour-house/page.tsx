import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./watercolour.module.css";

export const metadata: Metadata = { title: "Watercolour house (experiment)", robots: { index: false, follow: false } };

export default function WatercolourHouse() {
  return (
    <div className={`${styles.page} container`}>
      <Image
        src="/images/experiments/watercolour-house.jpg"
        alt="Ink and watercolour drawing of a pink corner house with tall windows, a lantern and potted plants along an old street."
        width={1234}
        height={1352}
        sizes="(max-width: 900px) 100vw, 60vw"
        quality={90}
        priority
        className={styles.image}
      />
      <p className={styles.back}>
        <Link href="/experimental">All experiments</Link>
      </p>
    </div>
  );
}
