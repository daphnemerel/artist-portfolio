import Link from "next/link";
import { PageTitle } from "@/components/type/PageTitle";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t, href } = await getI18n();
  return (
    <div className="container">
      <PageTitle lead={<Link href={href("/works")}>{t.notFound.back}</Link>}>{t.notFound.title}</PageTitle>
    </div>
  );
}
