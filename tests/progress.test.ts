import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyPractice,
  localDay,
  parsePractice,
  recordCheck,
  studyDay,
  validDay,
  type PracticeRecord,
} from "../src/lib/practice";
import { getProgress, streaks } from "../src/lib/progress";
import { lessons } from "../src/data/level-one";
import {
  allLessons,
  challenges,
  challengeSlug,
  reviewGroups,
  practiceQuestionCount,
} from "../src/data/course";
import {
  levelOneChallenge,
  reviewQuestions,
} from "../src/data/level-one-questions";

const at = (day: number, month = 9, year = 2026) =>
  new Date(year, month, day, 12, 30);
const draft = (): PracticeRecord => ({
  answer: "SELECT name, city FROM students",
  hints: 0,
  revealed: false,
  solved: false,
  attempts: 0,
});
const first = lessons[0].questions[0].id;

test("an empty notebook reports honest missing accuracy and no earned rewards or activity", () => {
  const progress = getProgress(emptyPractice(), at(21));
  assert.equal(progress.accuracy, null);
  assert.equal(progress.xp, 0);
  assert.equal(progress.percent, 0);
  assert.equal(progress.streak.current, 0);
  assert.equal(progress.revisit.length, 0);
  assert.equal(progress.badges.filter((badge) => badge.unlocked).length, 0);
  assert.equal(progress.resumeHref, "/learn/meet-your-database/");
});

test("migration preserves old work without inventing outcomes, study days or review completion", () => {
  const old = {
    version: 1,
    questions: {
      [first]: { ...draft(), solved: true, attempts: 12, hints: 1 },
    },
    completedLessons: [lessons[0].slug],
  };
  const saved = parsePractice(JSON.stringify(old));
  const progress = getProgress(saved, at(21));
  assert.equal(saved.version, 2);
  assert.deepEqual(saved.questions[first], old.questions[first]);
  assert.deepEqual(saved.activeDays, []);
  assert.deepEqual(saved.checks, {});
  assert.equal(progress.xp, 30);
  assert.equal(progress.accuracy, null);
  assert.equal(progress.review, false);
  assert.equal(progress.streak.current, 0);
  assert.equal(
    parsePractice(JSON.stringify(saved)).questions[first].attempts,
    12,
  );
});

test("wrong, supported, correct and repeated checks track outcomes but cannot farm solve XP", () => {
  let store = recordCheck(
    emptyPractice(),
    first,
    draft(),
    false,
    lessons[0].slug,
    at(21),
  );
  assert.equal(getProgress(store).xp, 0);
  store = recordCheck(
    store,
    first,
    { ...store.questions[first], hints: 1 },
    true,
    lessons[0].slug,
    at(21),
  );
  let progress = getProgress(store, at(21));
  assert.equal(progress.xp, 10);
  assert.equal(progress.accuracy, 50);
  assert.equal(progress.supported, 1);
  assert.equal(progress.topics[0].accuracy, 50);
  assert.equal(progress.revisit[0].lesson.slug, lessons[0].slug);
  assert.equal(progress.streak.current, 1);
  assert.equal(progress.completedSteps, 1);
  assert.equal(progress.percent, Math.round(100 / progress.totalSteps));
  assert.equal(store.questions[first].attempts, 2);
  assert.equal(store.questions[first].solved, true);
  assert.deepEqual(store.activeDays, [localDay(at(21))]);
  store = recordCheck(
    store,
    first,
    store.questions[first],
    true,
    "review",
    at(21),
  );
  progress = getProgress(store, at(21));
  assert.equal(progress.xp, 10);
  assert.equal(progress.accuracy, 67);
  assert.equal(progress.solved, 1);
  assert.deepEqual(store.reviewSolved, [first]);
  assert.equal(progress.resumeHref, "/learn/review/?level=1#practice");
  assert.equal(progress.questionIndex, 0);
  store = recordCheck(
    store,
    first,
    store.questions[first],
    false,
    "review",
    at(22),
  );
  assert.equal(store.questions[first].solved, true);
  assert.equal(store.checks[first].correct, 2);
  assert.equal(getProgress(store, at(22)).streak.current, 2);
});

test("review earns its bonus once, counts real rechecks, and reuses original question identities", () => {
  let store = emptyPractice();
  for (const q of reviewQuestions)
    store = recordCheck(store, q.id, draft(), true, "review", at(21));
  const progress = getProgress(store, at(21));
  assert.equal(progress.solved, 6);
  assert.equal(progress.xp, 90);
  assert.equal(progress.review, true);
  assert.equal(progress.badges.find((b) => b.id === "review")?.unlocked, true);
  store = recordCheck(
    store,
    reviewQuestions[0].id,
    store.questions[reviewQuestions[0].id],
    true,
    "review",
    at(21),
  );
  assert.equal(getProgress(store, at(21)).xp, 90);
  assert.equal(getProgress(store, at(21)).total, 7);
});

test("Level 1 completion requires reading and all questions without claiming the whole course", () => {
  let store = emptyPractice();
  store.completedLessons = lessons.map((lesson) => lesson.slug);
  store.activeDays = studyDay(store, at(21));
  for (const lesson of lessons)
    for (const q of lesson.questions)
      store = recordCheck(store, q.id, draft(), true, lesson.slug, at(21));
  assert.equal(getProgress(store, at(21)).levelComplete, false);
  store = recordCheck(
    store,
    levelOneChallenge.id,
    draft(),
    true,
    "level-one-challenge",
    at(21),
  );
  const progress = getProgress(store, at(21));
  assert.equal(progress.levelComplete, true);
  assert.equal(progress.levelStats[0].percent, 100);
  assert.equal(progress.courseComplete, false);
  assert.ok(progress.percent < 100);
  assert.equal(progress.xp, 545);
  assert.equal(progress.total, 41);
  assert.equal(progress.badges.find((b) => b.id === "level")?.unlocked, true);
  assert.equal(progress.badges.find((b) => b.id === "joins")?.unlocked, false);
  assert.equal(
    progress.badges.find((b) => b.id === "windows")?.unlocked,
    false,
  );
  const incomplete = { ...store, completedLessons: [] };
  assert.equal(getProgress(incomplete, at(21)).levelComplete, false);
  assert.ok(getProgress(incomplete, at(21)).percent < 100);
});

test("full-course counts, challenges and earned badges use every level's actual questions", () => {
  let store = emptyPractice();
  store.completedLessons = allLessons.map((l) => l.slug);
  for (const lesson of allLessons)
    for (const question of lesson.questions)
      store = recordCheck(
        store,
        question.id,
        draft(),
        true,
        lesson.slug,
        at(21),
      );
  for (const level of [1, 2, 3, 4, 5])
    store = recordCheck(
      store,
      challenges[level].id,
      draft(),
      true,
      challengeSlug(level),
      at(21),
    );
  const progress = getProgress(store, at(21));
  assert.equal(progress.solved, practiceQuestionCount);
  assert.equal(progress.questionCount, practiceQuestionCount + 5);
  assert.equal(progress.read, 33);
  assert.equal(progress.challengeCount, 5);
  assert.equal(progress.percent, 100);
  assert.equal(progress.courseComplete, true);
  assert.ok(progress.levelStats.every((level) => level.complete));
  assert.equal(progress.xp, practiceQuestionCount * 10 + 33 * 20 + 5 * 25);
  for (const id of ["joins", "windows", "course"])
    assert.equal(progress.badges.find((b) => b.id === id)?.unlocked, true, id);
  const repeated = recordCheck(
    store,
    challenges[5].id,
    store.questions[challenges[5].id],
    true,
    challengeSlug(5),
    at(21),
  );
  assert.equal(getProgress(repeated, at(21)).xp, progress.xp);
});

test("five review groups earn separate one-time bonuses and restore the selected level", () => {
  let store = emptyPractice();
  for (const level of [1, 2, 3, 4, 5])
    for (const question of reviewGroups[level])
      store = recordCheck(store, question.id, draft(), true, "review", at(21));
  const progress = getProgress(store, at(21));
  assert.equal(progress.solved, 33);
  assert.equal(progress.xp, 33 * 10 + 5 * 30);
  assert.equal(progress.resumeHref, "/learn/review/?level=5#practice");
  assert.equal(progress.questionIndex, reviewGroups[5].length - 1);
  assert.equal(
    getProgress(
      {
        ...store,
        resume: challengeSlug(4),
        positions: { [challengeSlug(4)]: challenges[4].id },
      },
      at(21),
    ).resumeHref,
    "/learn/level-4-challenge/#practice",
  );
});

test("streaks follow calendar dates across month/year, leap days and DST with yesterday grace", () => {
  assert.deepEqual(streaks(["2026-12-31", "2027-01-01"], at(2, 0, 2027)), {
    current: 2,
    best: 2,
  });
  assert.deepEqual(
    streaks(["2024-02-28", "2024-02-29", "2024-03-01"], at(1, 2, 2024)),
    { current: 3, best: 3 },
  );
  assert.deepEqual(
    streaks(["2026-03-07", "2026-03-08", "2026-03-09"], at(9, 2)),
    { current: 3, best: 3 },
  );
  const days = Array.from(
    { length: 7 },
    (_, i) => `2026-10-${String(14 + i).padStart(2, "0")}`,
  );
  assert.deepEqual(streaks([...days, days[0], "2026-10-31"], at(21)), {
    current: 7,
    best: 7,
  });
  assert.deepEqual(streaks(days, at(22)), { current: 0, best: 7 });
  const store = { ...emptyPractice(), activeDays: days };
  assert.equal(
    getProgress(store, at(22)).badges.find((b) => b.id === "week")?.unlocked,
    true,
  );
  assert.equal(localDay(new Date(2026, 9, 21, 0, 1)), "2026-10-21");
  assert.equal(validDay("2026-02-30"), false);
});

test("comfortable ideas resurface after seven local days, while untouched topics stay out", () => {
  const store = recordCheck(
    emptyPractice(),
    first,
    draft(),
    true,
    lessons[0].slug,
    at(14),
  );
  assert.equal(getProgress(store, at(20)).revisit.length, 0);
  assert.equal(
    getProgress(store, at(21)).revisit[0].lesson.slug,
    lessons[0].slug,
  );
  assert.equal(getProgress(store, at(21)).revisit.length, 1);
});

test("saved v2 history round-trips and malformed fields cannot create non-finite counters", () => {
  const store = recordCheck(
    emptyPractice(),
    first,
    { ...draft(), revealed: true },
    true,
    lessons[0].slug,
    at(21),
  );
  assert.deepEqual(parsePractice(JSON.stringify(store)), store);
  const saved = parsePractice(
    JSON.stringify({
      ...store,
      activeDays: ["2026-10-21", "2026-02-30", "bad"],
      questions: { [first]: { ...draft(), attempts: "Infinity" } },
      checks: {
        [first]: {
          total: 2,
          correct: 999,
          supported: -10,
          lastAttempt: at(21).toISOString(),
          lastCorrect: "bad",
        },
      },
    }),
  );
  assert.equal(saved.questions[first].attempts, 0);
  assert.equal(saved.checks[first].correct, 2);
  assert.equal(saved.checks[first].supported, 0);
  assert.equal(saved.checks[first].lastCorrect, null);
  assert.deepEqual(saved.activeDays, ["2026-10-21"]);
  assert.deepEqual(
    parsePractice('{"version":99,"questions":{}}'),
    emptyPractice(),
  );
});

test("resume links validate saved routes and question IDs", () => {
  const store = {
    ...emptyPractice(),
    resume: lessons[1].slug,
    positions: { [lessons[1].slug]: lessons[1].questions[3].id },
  };
  assert.equal(
    getProgress(store, at(21)).resumeHref,
    `/learn/${lessons[1].slug}/#practice`,
  );
  assert.equal(getProgress(store, at(21)).questionIndex, 3);
  assert.equal(
    getProgress({ ...store, resume: "missing-route" }, at(21)).resume,
    lessons[0].slug,
  );
});
