import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/i18n/server";
import styles from "./watercolour.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.experimental.watercolourTitle, robots: { index: false, follow: false } };
}

export default async function WatercolourHouse() {
  const { t, href } = await getI18n();
  return (
    <div className={`${styles.page} container`}>
      <Image
        src="/images/experiments/watercolour-house.jpg"
        alt={t.experimental.watercolourAlt}
        width={1234}
        height={1352}
        sizes="(max-width: 900px) 100vw, 60vw"
        quality={90}
        priority
        className={styles.image}
      />
      <p className={styles.back}>
        <Link href={href("/experimental")}>{t.experimental.all}</Link>
      </p>
    </div>
  );
}
