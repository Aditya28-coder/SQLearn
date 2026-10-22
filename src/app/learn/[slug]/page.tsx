import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allLessons as lessons, lessonMap, challengeSlug, challengeLevel } from "@/data/course";
import { LessonScreen, PracticeCollection } from "@/components/lesson-screen";

export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...lessons.map((lesson) => ({ slug: lesson.slug })),
    ...[1,2,3,4,5].map(level=>({slug:challengeSlug(level)})),
    { slug: "review" },
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title:
      lessonMap[slug]?.title ??
      (slug === "review" ? "A little mixed review" : `Level ${challengeLevel(slug)} challenge`),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const level=challengeLevel(slug);
  if (level) return <PracticeCollection key={slug} mode="challenge" level={level} />;
  if (slug === "review") return <PracticeCollection key={slug} mode="review" />;
  const lesson = lessonMap[slug];
  if (!lesson) notFound();
  return <LessonScreen key={slug} lesson={lesson} />;
}
