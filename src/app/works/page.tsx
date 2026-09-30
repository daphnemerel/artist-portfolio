import type { Metadata } from "next";
import { PageTitle } from "@/components/type/PageTitle";
import { WorksIndex } from "@/components/works/WorksIndex";
import { getWorks } from "@/lib/content";

export const metadata: Metadata = { title: "Works" };

export default function WorksPage() {
  // Rendered markdown stays on the server; the index only needs metadata and images.
  const works = getWorks().map(({ html: _html, ...work }) => work);
  return (
    <div className="container">
      <PageTitle>Works</PageTitle>
      <WorksIndex works={works} />
    </div>
  );
}
