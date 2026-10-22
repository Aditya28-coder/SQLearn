import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { datasets } from "../src/data/datasets";
import { lessons } from "../src/data/level-one";
import {
  levelOneChallenge,
  reviewQuestions,
} from "../src/data/level-one-questions";
import { compliments, nextCompliment } from "../src/data/compliments";
import {
  answerSql,
  solutionAnswer,
  parsePractice,
  emptyPractice,
} from "../src/lib/practice";
import {
  compareResults,
  readOnlyResult,
  displayResult,
} from "../public/grading.mjs";

let db: PGlite;
before(async () => {
  db = await PGlite.create();
  for (const dataset of datasets) await db.exec(dataset.seed);
});
after(async () => {
  await db?.close();
});
const questions = [
  ...lessons.flatMap((lesson) => lesson.questions),
  levelOneChallenge,
];

test("every lesson has complete teaching sections and 5–8 unique graded questions", () => {
  assert.equal(lessons.length, 6);
  assert.equal(questions.length, 41);
  assert.equal(
    new Set(questions.map((question) => question.id)).size,
    questions.length,
  );
  for (const lesson of lessons) {
    assert.ok(lesson.questions.length >= 5 && lesson.questions.length <= 8);
    assert.ok(
      lesson.concept && lesson.analogy && lesson.diagram && lesson.engineering,
    );
    assert.ok(
      lesson.examples.length >= 1 &&
        lesson.mistakes.length >= 2 &&
        lesson.recap.length >= 3,
    );
    for (const question of lesson.questions)
      assert.equal(question.hints.length, 2);
  }
  assert.equal(reviewQuestions.length, lessons.length);
  assert.deepEqual(
    new Set(questions.map((question) => question.kind)),
    new Set(["write", "fix", "fill", "predict"]),
  );
});

test("all 12 editable examples execute against their sample dataset", async () => {
  for (const lesson of lessons)
    for (const example of lesson.examples) {
      const result = await readOnlyResult(db, example.sql, example.dataset);
      assert.ok(result.fields.length > 0, example.title);
      assert.ok(result.rows.length > 0, example.title);
    }
});

test("all 41 reference solutions and actual answer inputs produce matching Postgres results", async () => {
  for (const question of questions) {
    const expected = await readOnlyResult(
      db,
      question.referenceSql,
      question.dataset,
    );
    const actual = await readOnlyResult(
      db,
      answerSql(question, solutionAnswer(question)),
      question.dataset,
    );
    assert.ok(
      expected.rows.length > 0,
      `Unexpected empty reference: ${question.id}`,
    );
    assert.equal(
      compareResults(actual, expected, question).correct,
      true,
      question.id,
    );
    if (question.kind === "predict") {
      for (let choice = 0; choice < question.choices!.length; choice++) {
        if (choice === question.correctChoice) continue;
        const wrong = await readOnlyResult(
          db,
          answerSql(question, String(choice)),
          question.dataset,
        );
        assert.equal(
          compareResults(wrong, expected, question).correct,
          false,
          `${question.id} wrong option ${choice}`,
        );
      }
    }
    if (question.kind === "fix") {
      try {
        const broken = await readOnlyResult(
          db,
          question.starter,
          question.dataset,
        );
        assert.equal(
          compareResults(broken, expected, question).correct,
          false,
          `${question.id} starter must not already be correct`,
        );
      } catch (error) {
        // Broken-query tasks deliberately include real syntax/type/name errors.
        if (error instanceof assert.AssertionError) throw error;
      }
    }
  }
});

test("grading ignores column/row order, but preserves duplicate rows and cross-column pairings", () => {
  const result = (rows: unknown[][], names = ["a", "b"]) => ({
    rows,
    fields: names.map((name) => ({ name, dataTypeID: 23 })),
  });
  assert.equal(
    compareResults(
      result([
        [2, 20],
        [1, 10],
      ]),
      result(
        [
          [10, 1],
          [20, 2],
        ],
        ["b", "a"],
      ),
    ).correct,
    true,
  );
  assert.equal(
    compareResults(
      result([
        [1, 10],
        [1, 10],
      ]),
      result([
        [1, 10],
        [2, 20],
      ]),
    ).correct,
    false,
  );
  assert.equal(
    compareResults(
      result([
        [1, 10],
        [2, 20],
      ]),
      result([
        [1, 20],
        [2, 10],
      ]),
    ).correct,
    false,
  );
  // Each of these columns has the same bag of values: only a GLOBAL column
  // permutation can decide whether their row relationships actually match.
  assert.equal(
    compareResults(
      result([
        [1, 1],
        [2, 2],
      ]),
      result([
        [1, 2],
        [2, 1],
      ]),
    ).correct,
    false,
  );
  assert.equal(
    compareResults(result([[2], [1]], ["a"]), result([[1], [2]], ["a"]), {
      ordered: true,
    }).correct,
    false,
  );
});

test("aliases, precise decimals, NULLs, JSON key order, and duplicate column labels grade correctly", async () => {
  const output = (sql: string) => readOnlyResult(db, sql, "campus");
  const resultA = await output("SELECT 1 AS a, 2 AS b");
  const resultB = await output("SELECT 2 AS b, 1 AS a");
  assert.equal(
    compareResults(resultA, resultB, { checkColumnNames: true }).correct,
    true,
  );
  assert.equal(
    compareResults(
      await output("SELECT 1 AS wrong"),
      await output("SELECT 1 AS correct"),
      { checkColumnNames: true },
    ).correct,
    false,
  );
  assert.equal(
    compareResults(
      await output("SELECT 1.00::numeric AS amount"),
      await output("SELECT 1::integer AS amount"),
    ).correct,
    true,
  );
  assert.equal(
    compareResults(
      await output("SELECT 9007199254740993::numeric"),
      await output("SELECT 9007199254740992::numeric"),
    ).correct,
    false,
  );
  assert.equal(
    compareResults(
      await output("SELECT NULL::integer AS value"),
      await output("SELECT 0 AS value"),
    ).correct,
    false,
  );
  assert.equal(
    compareResults(
      await output("SELECT '2026-09-01'::date"),
      await output("SELECT '2026-09-01'::timestamp"),
    ).correct,
    false,
  );
  assert.equal(
    compareResults(
      await output(`SELECT '{"a":1,"b":2}'::jsonb`),
      await output(`SELECT '{"b":2,"a":1}'::jsonb`),
    ).correct,
    true,
  );
  const duplicateLabels = await output("SELECT 1 AS a, 2 AS a");
  assert.equal(
    compareResults(duplicateLabels, await output("SELECT 2 AS a, 1 AS a"))
      .correct,
    true,
  );
  assert.deepEqual(displayResult(duplicateLabels).rows, [{ a: 1, "a (2)": 2 }]);
});

test("a read-only answer cannot mutate sample data or smuggle in a second statement", async () => {
  await assert.rejects(
    readOnlyResult(
      db,
      "UPDATE students SET city='London' RETURNING name",
      "campus",
    ),
  );
  await assert.rejects(
    readOnlyResult(db, "COMMIT; DELETE FROM students; SELECT 1", "campus"),
  );
  await assert.rejects(
    readOnlyResult(db, "SELECT missing_column FROM students", "campus"),
  );
  const result = await readOnlyResult(
    db,
    "SELECT city FROM students WHERE id=1",
    "campus",
  );
  assert.deepEqual(result.rows, [["Pune"]]);
  assert.equal(
    (await readOnlyResult(db, "SELECT id FROM students", "campus")).rows.length,
    8,
  );
});

test("challenge returns the actual gift shortlist and filtered conditions have concrete answers", async () => {
  const result = await readOnlyResult(
    db,
    levelOneChallenge.referenceSql,
    "store",
  );
  assert.deepEqual(
    result.rows.map((row: unknown[]) => [row[0], Number(row[1])]),
    [
      ["Kind words postcards", 300],
      ["Sunday notebook", 500],
      ["Mint tea", 640],
    ],
  );
  const logic = questions.find((question) => question.id === "where-logic")!;
  const filtered = await readOnlyResult(db, logic.referenceSql, "campus");
  assert.deepEqual(filtered.rows, [["Meera"], ["Arjun"]]);
});

test("compliments have at least 60 unique messages, personalize names, and exhaust a bag before repeating", () => {
  assert.ok(compliments.length >= 60);
  assert.equal(new Set(compliments).size, compliments.length);
  const firstBag = compliments.map(() => nextCompliment("Trapti"));
  assert.equal(new Set(firstBag).size, compliments.length);
  assert.ok(firstBag.some((message) => message.includes("Trapti")));
  const next = nextCompliment("Trapti");
  assert.notEqual(next, firstBag.at(-1));
});

test("saved practice handles corrupt data and keeps supported solved/draft state", () => {
  assert.deepEqual(parsePractice("not-json"), emptyPractice());
  const saved = parsePractice(
    JSON.stringify({
      version: 1,
      questions: {
        first: {
          answer: "SELECT 1",
          hints: 99,
          revealed: true,
          solved: true,
          attempts: -1,
        },
        broken: null,
      },
      completedLessons: ["meet-your-database", 5],
    }),
  );
  assert.deepEqual(saved.questions.first, {
    answer: "SELECT 1",
    hints: 2,
    revealed: true,
    solved: true,
    attempts: 0,
  });
  assert.deepEqual(saved.completedLessons, ["meet-your-database"]);
  assert.equal(
    answerSql(
      questions.find((question) => question.kind === "predict")!,
      "",
    ),
    "",
  );
});
