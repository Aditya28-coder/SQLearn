import type { Question } from "@/data/lesson-types";

export function answerSql(question: Question, answer: string): string {
  if (question.kind === "fill")
    return question.template!.replace("{{blank}}", answer.trim());
  if (question.kind === "predict")
    return answer.trim() ? (question.choices?.[Number(answer)]?.sql ?? "") : "";
  return answer;
}
export function solutionAnswer(question: Question): string {
  return question.kind === "predict"
    ? String(question.correctChoice)
    : question.solution;
}

export type PracticeRecord = {
  answer: string;
  hints: number;
  revealed: boolean;
  solved: boolean;
  attempts: number;
};
export type PracticeStore = {
  version: 2;
  questions: Record<string, PracticeRecord>;
  completedLessons: string[];
  checks: Record<string, CheckHistory>;
  activeDays: string[];
  reviewSolved: string[];
  positions: Record<string, string>;
  resume: string | null;
};
export type CheckHistory = {
  total: number;
  correct: number;
  supported: number;
  lastAttempt: string;
  lastCorrect: string | null;
};
export const emptyPractice = (): PracticeStore => ({
  version: 2,
  questions: {},
  completedLessons: [],
  checks: {},
  activeDays: [],
  reviewSolved: [],
  positions: {},
  resume: null,
});
// Keep the original key so existing notebooks migrate in place without losing drafts.
export const practiceStorageKey = "sqlearn:practice:v1";
const count = (value: unknown) =>
  Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter((item): item is string => typeof item === "string"),
        ),
      ]
    : [];
const timestamp = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value));
export function parsePractice(raw: string | null): PracticeStore {
  if (!raw) return emptyPractice();
  try {
    const saved = JSON.parse(raw);
    if (
      ![1, 2].includes(saved?.version) ||
      !saved.questions ||
      typeof saved.questions !== "object"
    )
      return emptyPractice();
    const questions: Record<string, PracticeRecord> = {};
    for (const [id, value] of Object.entries(saved.questions)) {
      const record = value as Partial<PracticeRecord>;
      if (!record || typeof record.answer !== "string") continue;
      questions[id] = {
        answer: record.answer.slice(0, 50000),
        hints: Math.min(2, count(record.hints)),
        revealed: record.revealed === true,
        solved: record.solved === true,
        attempts: count(record.attempts),
      };
    }
    const checks: Record<string, CheckHistory> = {};
    if (
      saved.version === 2 &&
      saved.checks &&
      typeof saved.checks === "object"
    ) {
      for (const [id, value] of Object.entries(saved.checks)) {
        const item = value as Partial<CheckHistory>;
        if (!item || !timestamp(item.lastAttempt)) continue;
        const total = count(item.total);
        checks[id] = {
          total,
          correct: Math.min(total, count(item.correct)),
          supported: Math.min(total, count(item.supported)),
          lastAttempt: item.lastAttempt,
          lastCorrect: timestamp(item.lastCorrect) ? item.lastCorrect : null,
        };
      }
    }
    const positions: Record<string, string> = {};
    if (
      saved.version === 2 &&
      saved.positions &&
      typeof saved.positions === "object"
    ) {
      for (const [slug, id] of Object.entries(saved.positions))
        if (typeof id === "string") positions[slug] = id;
    }
    return {
      version: 2,
      questions,
      completedLessons: strings(saved.completedLessons),
      checks,
      activeDays:
        saved.version === 2
          ? strings(saved.activeDays).filter(validDay).sort()
          : [],
      reviewSolved: saved.version === 2 ? strings(saved.reviewSolved) : [],
      positions,
      resume:
        saved.version === 2 && typeof saved.resume === "string"
          ? saved.resume
          : null,
    };
  } catch {
    return emptyPractice();
  }
}

export function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function validDay(day: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(`${day}T12:00:00Z`)) &&
    new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) === day
  );
}
export function studyDay(store: PracticeStore, now: Date): string[] {
  return [...new Set([...store.activeDays, localDay(now)])].sort();
}
export function recordCheck(
  store: PracticeStore,
  id: string,
  record: PracticeRecord,
  correct: boolean,
  scope: string,
  now = new Date(),
): PracticeStore {
  const old = store.checks[id];
  const at = now.toISOString();
  return {
    ...store,
    questions: {
      ...store.questions,
      [id]: {
        ...record,
        attempts: (store.questions[id]?.attempts ?? record.attempts) + 1,
        solved: Boolean(
          store.questions[id]?.solved || record.solved || correct,
        ),
      },
    },
    checks: {
      ...store.checks,
      [id]: {
        total: (old?.total ?? 0) + 1,
        correct: (old?.correct ?? 0) + Number(correct),
        supported:
          (old?.supported ?? 0) + Number(record.hints > 0 || record.revealed),
        lastAttempt: at,
        lastCorrect: correct ? at : (old?.lastCorrect ?? null),
      },
    },
    activeDays: studyDay(store, now),
    reviewSolved:
      scope === "review" && correct
        ? [...new Set([...store.reviewSolved, id])]
        : store.reviewSolved,
    resume: scope,
    positions: { ...store.positions, [scope]: id },
  };
}
