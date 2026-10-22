import type { Metadata } from "next";
import { ReferencePage } from "@/components/reference-page";
export const metadata: Metadata = { title: "Little glossary" };
export default function Page() {
  return <ReferencePage mode="glossary" />;
}
