import Link from "next/link";
import { PageTitle } from "@/components/type/PageTitle";

export default function NotFound() {
  return (
    <div className="container">
      <PageTitle lead={<Link href="/works">Return to the works index</Link>}>Page not found</PageTitle>
    </div>
  );
}
