import type { Metadata } from "next";
import { PageTitle } from "@/components/type/PageTitle";
import { WorksIndex } from "@/components/works/WorksIndex";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getWorks } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.works.title, ...alternates(locale, "/works") };
}

export default async function WorksPage() {
  const { locale, t } = await getI18n();
  // Rendered markdown stays on the server; the index only needs metadata and images.
  const works = getWorks(locale).map(({ html: _html, ...work }) => work);
  return (
    <div className="container">
      <PageTitle>{t.works.title}</PageTitle>
      <WorksIndex works={works} />
    </div>
  );
}
