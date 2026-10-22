import type { Metadata } from "next";
import { Settings } from "@/components/settings";
export const metadata: Metadata = { title: "Make it yours" };
export default function Page() {
  return <Settings />;
}
