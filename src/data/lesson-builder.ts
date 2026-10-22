import type { Lesson, Question } from "./lesson-types";
import type { DatasetId } from "./datasets";

export type Task = {
  title: string;
  prompt: string;
  sql: string;
  why: string;
  hints: [string, string];
  options?: Partial<Question>;
};
export const task = (
  title: string,
  prompt: string,
  sql: string,
  why: string,
  hints: [string, string],
  options?: Partial<Question>,
): Task => ({ title, prompt, sql, why, hints, options });
export function choice(
  title: string,
  prompt: string,
  answers: string[],
  correct: number,
  why: string,
  hints: [string, string],
): Task {
  return task(title, prompt, `SELECT ${correct} AS answer`, why, hints, {
    kind: "predict",
    conceptual: true,
    starter: "Choose the explanation that fits this situation.",
    choices: answers.map((label, i) => ({
      label,
      sql: `SELECT ${i} AS answer`,
    })),
    correctChoice: correct,
    solution: String(correct),
  });
}
export type LessonPlan = {
  slug: string;
  level: number;
  title: string;
  description: string;
  concept: string;
  analogy: string;
  diagram: Lesson["diagram"];
  dataset: DatasetId;
  notes: [string, string, string?][];
  mistakes: string[];
  engineering: string;
  recap: string[];
  tasks: Task[];
  examples?: Lesson["examples"];
  source?: string;
};
function commented(sql: string) {
  const comments: [RegExp, string][] = [
    [/^SELECT\b/i, "Choose the details or calculation."],
    [/^FROM\b/i, "Start with these rows."],
    [/^(LEFT |INNER |RIGHT |FULL |CROSS )?JOIN\b/i, "Match the related rows."],
    [/^WHERE\b/i, "Keep only matching rows."],
    [/^GROUP BY/i, "Make one group for each shared value."],
    [/^HAVING/i, "Keep groups that pass this test."],
    [/^ORDER BY/i, "Arrange the final result."],
    [/^LIMIT/i, "Keep a small slice."],
    [/^WITH\b/i, "Name a useful intermediate result."],
  ];
  return sql
    .split("\n")
    .map((line) => {
      const comment = comments.find(([pattern]) => pattern.test(line.trim()));
      return comment ? `-- ${comment[1]}\n${line}` : line;
    })
    .join("\n");
}
export function makeLesson(plan: LessonPlan): Lesson {
  const questions = plan.tasks.map((item, index): Question => ({
    id: `${plan.slug}-${index + 1}`,
    kind: "write",
    difficulty: index < 2 ? "easy" : index < 4 ? "medium" : "hard",
    dataset: plan.dataset,
    starter: "-- One little idea at a time.\n",
    referenceSql: item.sql,
    solution: item.sql,
    explanation: item.why,
    hints: item.hints,
    title: item.title,
    prompt: item.prompt,
    ...item.options,
  }));
  const examples =
    plan.examples ??
    questions
      .filter((q) => q.kind !== "predict")
      .slice(0, 2)
      .map((q) => {
        return {
          title: q.title,
          caption: q.explanation,
          dataset: q.dataset,
          fresh: Boolean(q.exercise),
          setup: q.exercise?.setup,
          parameters: q.parameters,
          sql: q.exercise
            ? `-- A fresh workspace is prepared before this script runs.\n${q.referenceSql}\n-- Inspect the resulting rows or structure.\n${q.exercise.verify}`
            : commented(q.referenceSql),
        };
      });
  return {
    slug: plan.slug,
    level: plan.level,
    title: plan.title,
    shortTitle: plan.title,
    description: plan.description,
    minutes: 5,
    concept: plan.concept,
    analogy: plan.analogy,
    diagram: plan.diagram,
    notes: plan.notes.map(([title, body, sql]) => ({ title, body, sql })),
    examples,
    mistakes: plan.mistakes,
    engineering: plan.engineering,
    recap: plan.recap,
    questions,
  };
}
