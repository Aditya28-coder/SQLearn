import type { Metadata } from "next";
import { Playground } from "@/components/playground";
export const metadata: Metadata = { title: "SQL playground" };
export default function Page() {
  return <Playground />;
}
