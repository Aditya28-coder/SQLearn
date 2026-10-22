import {
  allLessons as lessons,
  challenges,
  challengeSlug,
  challengeLevel,
  reviewGroups,
  reviewLevelForQuestion,
  practiceQuestionCount,
} from "@/data/course";
import { localDay, type PracticeStore } from "./practice";
const dayNumber = (day: string) => Date.parse(`${day}T12:00:00Z`) / 86400000;
export function streaks(days: string[], now = new Date()) {
  const today = dayNumber(localDay(now));
  const unique = [
    ...new Set(
      days.map(dayNumber).filter((day) => Number.isFinite(day) && day <= today),
    ),
  ].sort((a, b) => a - b);
  let best = 0,
    run = 0;
  unique.forEach((day, index) => {
    run = index > 0 && day === unique[index - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return {
    current: unique.length && today - unique[unique.length - 1] <= 1 ? run : 0,
    best,
  };
}
export function getProgress(store: PracticeStore, now = new Date()) {
  const topics = lessons.map((lesson) => {
    const records = lesson.questions
      .map((q) => store.checks[q.id])
      .filter(Boolean);
    const total = records.reduce((s, r) => s + r.total, 0),
      correct = records.reduce((s, r) => s + r.correct, 0),
      supported = records.reduce((s, r) => s + r.supported, 0);
    const solved = lesson.questions.filter(
      (q) => store.questions[q.id]?.solved,
    ).length;
    const lastCorrect = records
      .map((r) => r.lastCorrect)
      .filter((at): at is string => Boolean(at))
      .sort()
      .at(-1);
    const daysAgo = lastCorrect
      ? Math.max(
          0,
          dayNumber(localDay(now)) - dayNumber(localDay(new Date(lastCorrect))),
        )
      : null;
    return {
      lesson,
      total,
      correct,
      supported,
      solved,
      accuracy: total ? Math.round((correct / total) * 100) : null,
      read: store.completedLessons.includes(lesson.slug),
      daysAgo,
    };
  });
  const levelStats = [1, 2, 3, 4, 5].map((level) => {
    const selected = topics.filter((t) => t.lesson.level === level);
    const solved = selected.reduce((s, t) => s + t.solved, 0),
      read = selected.filter((t) => t.read).length,
      questionCount = selected.reduce(
        (s, t) => s + t.lesson.questions.length,
        0,
      );
    const challenge = Boolean(store.questions[challenges[level].id]?.solved);
    const complete =
      read === selected.length && solved === questionCount && challenge;
    return {
      level,
      solved,
      read,
      questionCount,
      lessonCount: selected.length,
      challenge,
      complete,
      percent: Math.round(
        ((read + solved + Number(challenge)) /
          (selected.length + questionCount + 1)) *
          100,
      ),
    };
  });
  const knownIds = [
    ...lessons.flatMap((l) => l.questions.map((q) => q.id)),
    ...Object.values(challenges).map((q) => q.id),
  ];
  const records = knownIds.map((id) => store.checks[id]).filter(Boolean);
  const total = records.reduce((s, r) => s + r.total, 0),
    correct = records.reduce((s, r) => s + r.correct, 0),
    supported = records.reduce((s, r) => s + r.supported, 0);
  const solved = topics.reduce((s, t) => s + t.solved, 0),
    read = topics.filter((t) => t.read).length,
    challengeCount = levelStats.filter((l) => l.challenge).length;
  const completedReviews = [1, 2, 3, 4, 5].filter((level) =>
    reviewGroups[level].every((q) => store.reviewSolved.includes(q.id)),
  );
  const review = completedReviews.includes(1),
    courseComplete = levelStats.every((l) => l.complete),
    streak = streaks(store.activeDays, now);
  const revisit = topics
    .filter(
      (t) =>
        t.total > 0 &&
        (t.correct / t.total < 0.8 || t.supported > 0 || (t.daysAgo ?? 0) >= 7),
    )
    .sort(
      (a, b) =>
        (a.accuracy ?? 100) - (b.accuracy ?? 100) || b.supported - a.supported,
    )
    .slice(0, 3);
  const solvedTopic = (slug: string) => {
    const topic = topics.find((t) => t.lesson.slug === slug);
    return Boolean(topic && topic.solved === topic.lesson.questions.length);
  };
  const badges = [
    {
      id: "first",
      title: "Little sprout",
      description: "Solve your first practice question.",
      unlocked: solved > 0 || challengeCount > 0,
      future: false,
    },
    {
      id: "reader",
      title: "A new chapter",
      description: "Finish reading a lesson.",
      unlocked: read > 0,
      future: false,
    },
    {
      id: "challenge",
      title: "Thoughtful query",
      description: "Solve the Level 1 challenge.",
      unlocked: levelStats[0].challenge,
      future: false,
    },
    {
      id: "review",
      title: "Hello again",
      description: "Solve the six Basics mixed-review questions.",
      unlocked: review,
      future: false,
    },
    {
      id: "level",
      title: "Rooted in SQL",
      description: "Read and solve every part of Level 1.",
      unlocked: levelStats[0].complete,
      future: false,
    },
    {
      id: "week",
      title: "Seven little days",
      description: "Study on seven consecutive calendar days.",
      unlocked: streak.best >= 7,
      future: false,
    },
    {
      id: "joins",
      title: "JOIN Master",
      description: "Solve every question in Bring two tables together.",
      unlocked: solvedTopic("bring-two-tables-together"),
      future: false,
    },
    {
      id: "windows",
      title: "Window Wizard",
      description: "Solve every question in A window over your rows.",
      unlocked: solvedTopic("a-window-over-your-rows"),
      future: false,
    },
    ...[
      "Bigger-picture thinker",
      "Beautiful connections",
      "Pattern finder",
      "Thoughtful engineer",
    ].map((title, i) => ({
      id: `level-${i + 2}`,
      title,
      description: `Read and solve every part of Level ${i + 2}.`,
      unlocked: levelStats[i + 1].complete,
      future: false,
    })),
    {
      id: "course",
      title: "A whole garden",
      description:
        "Read all 33 lessons and solve every lesson question and challenge.",
      unlocked: courseComplete,
      future: false,
    },
  ];
  const validScopes = [
    ...lessons.map((l) => l.slug),
    ...[1, 2, 3, 4, 5].map(challengeSlug),
    "review",
  ];
  const nextLesson = lessons.find(
    (l) =>
      !store.completedLessons.includes(l.slug) ||
      l.questions.some((q) => !store.questions[q.id]?.solved),
  );
  const resume =
    store.resume && validScopes.includes(store.resume)
      ? store.resume
      : (nextLesson?.slug ??
        (levelStats.find((l) => !l.challenge)
          ? challengeSlug(levelStats.find((l) => !l.challenge)!.level)
          : "review"));
  const position = store.positions[resume],
    reviewLevel = reviewLevelForQuestion(position),
    challengeNumber = challengeLevel(resume);
  const questions =
    resume === "review"
      ? reviewGroups[reviewLevel]
      : challengeNumber
        ? [challenges[challengeNumber]]
        : lessons.find((l) => l.slug === resume)!.questions;
  const questionIndex = questions.findIndex((q) => q.id === position);
  const resumeTitle =
    lessons.find((l) => l.slug === resume)?.shortTitle ??
    (resume === "review"
      ? `Mixed review · Level ${reviewLevel}`
      : `Your Level ${challengeNumber} challenge`);
  const questionCount = practiceQuestionCount + 5,
    lessonCount = lessons.length,
    totalSteps = lessonCount + questionCount,
    completedSteps = read + solved + challengeCount;
  return {
    topics,
    levelStats,
    total,
    correct,
    supported,
    accuracy: total ? Math.round((correct / total) * 100) : null,
    solved,
    read,
    challenge: levelStats[0].challenge,
    challengeCount,
    review,
    levelComplete: levelStats[0].complete,
    courseComplete,
    streak,
    revisit,
    badges,
    xp:
      solved * 10 +
      read * 20 +
      challengeCount * 25 +
      completedReviews.length * 30,
    percent: Math.round((completedSteps / totalSteps) * 100),
    questionCount,
    lessonCount,
    totalSteps,
    completedSteps,
    resume,
    resumeTitle,
    questionIndex,
    resumeHref: `/learn/${resume}/${resume === "review" ? `?level=${reviewLevel}` : ""}${questionIndex >= 0 ? "#practice" : ""}`,
    hasStarted: Boolean(
      store.resume || read || solved || challengeCount || total,
    ),
  };
}
