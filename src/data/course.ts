import { lessons as basics } from "./level-one";
import { levelTwoLessons } from "./level-two";
import { levelThreeLessons } from "./level-three";
import { levelFourLessons } from "./level-four";
import { schemaLessons } from "./level-five-schema";
import { engineeringLessons } from "./level-five-engineering";
import { levelOneChallenge, reviewQuestions } from "./level-one-questions";
import type { Lesson, Question } from "./lesson-types";
export const allLessons: Lesson[] = [
  ...basics.map((lesson) => ({ ...lesson, level: 1 })),
  ...levelTwoLessons,
  ...levelThreeLessons,
  ...levelFourLessons,
  ...schemaLessons,
  ...engineeringLessons,
];
export const lessonMap = Object.fromEntries(
  allLessons.map((lesson) => [lesson.slug, lesson]),
) as Record<string, Lesson>;
export const lessonsForLevel = (level: number) =>
  allLessons.filter((lesson) => lesson.level === level);
function challenge(
  level: number,
  title: string,
  prompt: string,
  sql: string,
  dataset: Question["dataset"],
): Question {
  return {
    id: `level-${level}-challenge`,
    title,
    prompt,
    dataset,
    kind: "write",
    difficulty: "hard",
    starter: "-- Bring your little ideas together.\n",
    referenceSql: sql,
    solution: sql,
    explanation:
      "This result combines the level's ideas. Inspect every contributing row, then compare your grouping, filtering and stable ordering with the solution.",
    hints: [
      "Break the question into its starting rows, relationships and final calculation.",
      "Build the inner summary first, then apply the requested filtering and ordering.",
    ],
    ordered: true,
  };
}
export const challenges: Record<number, Question> = {
  1: levelOneChallenge,
  2: challenge(
    2,
    "A shelf worth sharing",
    "For in-stock products, return category,COUNT(*) AS gifts,ROUND(AVG(price),2) AS average_price and CASE WHEN AVG(price)<300 THEN 'Little budget' ELSE 'Something special' END AS guide. Keep categories with at least two available products. Sort average_price ascending, then category ascending.",
    "SELECT category,COUNT(*) AS gifts,ROUND(AVG(price),2) AS average_price,CASE WHEN AVG(price)<300 THEN 'Little budget' ELSE 'Something special' END AS guide FROM products WHERE in_stock GROUP BY category HAVING COUNT(*)>=2 ORDER BY average_price,category;",
    "store",
  ),
  3: challenge(
    3,
    "A thoughtful customer report",
    "Return c.id,c.name,COUNT(DISTINCT o.id) AS orders,COALESCE(SUM(i.quantity*i.unit_price),0) AS spent for all customers, counting only delivered orders. Keep zero-spend customers. Sort spent descending, then c.id ascending.",
    "SELECT c.id,c.name,COUNT(DISTINCT o.id) AS orders,COALESCE(SUM(i.quantity*i.unit_price),0) AS spent FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='delivered' LEFT JOIN order_items i ON i.order_id=o.id GROUP BY c.id,c.name ORDER BY spent DESC,c.id;",
    "store",
  ),
  4: challenge(
    4,
    "A kitchen leaderboard",
    "For every restaurant, count delivered deliveries AS completed and compute ROUND(AVG(delivery minutes),2) AS average_minutes using delivered rows only. Return id,name,completed,average_minutes,DENSE_RANK() OVER(ORDER BY completed DESC) AS rank. Sort completed descending then id ascending.",
    "WITH summary AS (SELECT r.id,r.name,COUNT(d.id) AS completed,ROUND(AVG(d.minutes),2) AS average_minutes FROM restaurants r LEFT JOIN deliveries d ON d.restaurant_id=r.id AND d.status='delivered' GROUP BY r.id,r.name) SELECT id,name,completed,average_minutes,DENSE_RANK() OVER(ORDER BY completed DESC) AS rank FROM summary ORDER BY completed DESC,id;",
    "delivery",
  ),
  5: challenge(
    5,
    "A dependable reporting endpoint",
    "Build a report returning c.id,c.name,COUNT(DISTINCT o.id) AS delivered_orders,COALESCE(SUM(i.quantity*i.unit_price),0) AS revenue for every customer in bound city $1 ('Pune'). Include customers with no delivered orders, use only delivered orders, and sort revenue descending then c.id ascending. Keep $1 as a parameter.",
    "SELECT c.id,c.name,COUNT(DISTINCT o.id) AS delivered_orders,COALESCE(SUM(i.quantity*i.unit_price),0) AS revenue FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='delivered' LEFT JOIN order_items i ON i.order_id=o.id WHERE c.city=$1 GROUP BY c.id,c.name ORDER BY revenue DESC,c.id;",
    "store",
  ),
};
challenges[5].parameters = ["Pune"];
export const challengeSlug = (level: number) =>
  level === 1 ? "level-one-challenge" : `level-${level}-challenge`;
export const challengeLevel = (slug: string) =>
  [1, 2, 3, 4, 5].find((level) => challengeSlug(level) === slug);
export const reviewGroups: Record<number, Question[]> = {
  1: reviewQuestions,
  2: levelTwoLessons.map((lesson) => lesson.questions[0]),
  3: levelThreeLessons.map((lesson) => lesson.questions[0]),
  4: levelFourLessons.map((lesson) => lesson.questions[0]),
  5: [...schemaLessons, ...engineeringLessons].map(
    (lesson) => lesson.questions[0],
  ),
};
export const allReviewQuestions = Object.values(reviewGroups).flat();
export const reviewLevelForQuestion = (id?: string) =>
  [1, 2, 3, 4, 5].find((level) =>
    reviewGroups[level].some((q) => q.id === id),
  ) ?? 1;
export const practiceQuestionCount = allLessons.reduce(
  (sum, lesson) => sum + lesson.questions.length,
  0,
);
