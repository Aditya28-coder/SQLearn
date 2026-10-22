import type { Metadata } from "next";
import { ReferencePage } from "@/components/reference-page";
export const metadata: Metadata = { title: "SQL cheat sheet" };
export default function Page() {
  return <ReferencePage />;
}
