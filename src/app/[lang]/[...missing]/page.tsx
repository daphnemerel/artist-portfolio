import { notFound } from "next/navigation";

/** Any unknown address inside a language (e.g. /nl/xyz) shows that language's "page not found". */
export default function Missing() {
  notFound();
}
