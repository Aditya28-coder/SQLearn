import type { Metadata } from "next";
import { LearningPath } from "@/components/learning-path";
export const metadata: Metadata = { title: "Your learning path" };
export default function Page() {
  return <LearningPath />;
}
