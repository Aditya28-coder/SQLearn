import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  allLessons,
  challenges,
  allReviewQuestions,
  practiceQuestionCount,
} from "../src/data/course";
import { datasets } from "../src/data/datasets";
import { answerSql, solutionAnswer } from "../src/lib/practice";
import {
  readOnlyResult,
  exerciseResult,
  compareResults,
} from "../public/grading.mjs";
let db: PGlite;
let assets: { pgliteWasmModule: WebAssembly.Module; fsBundle: Blob };
const create = () => PGlite.create(assets);
before(async () => {
  assets = {
    pgliteWasmModule: await WebAssembly.compile(
      new Uint8Array(await readFile("public/pglite/pglite.wasm")),
    ),
    fsBundle: new Blob([
      new Uint8Array(await readFile("public/pglite/pglite.data")),
    ]),
  };
  db = await create();
  for (const dataset of datasets) await db.exec(dataset.seed);
});
after(async () => {
  await db?.close();
});
const questions = [
  ...allLessons.flatMap((lesson) => lesson.questions),
  ...Object.values(challenges),
];
test("all 33 curriculum topics have complete lessons, distinct questions and review coverage", () => {
  assert.equal(allLessons.length, 33);
  assert.deepEqual(
    [1, 2, 3, 4, 5].map(
      (level) => allLessons.filter((lesson) => lesson.level === level).length,
    ),
    [6, 6, 5, 5, 11],
  );
  assert.equal(new Set(allLessons.map((lesson) => lesson.slug)).size, 33);
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  assert.equal(questions.length, practiceQuestionCount + 5);
  for (const lesson of allLessons) {
    assert.ok(
      lesson.questions.length >= 5 && lesson.questions.length <= 8,
      lesson.slug,
    );
    assert.ok(
      lesson.notes.length >= 3 &&
        lesson.mistakes.length >= 2 &&
        lesson.recap.length >= 3,
      lesson.slug,
    );
    assert.ok(
      lesson.examples.length >= 2 &&
        lesson.concept &&
        lesson.analogy &&
        lesson.engineering,
      lesson.slug,
    );
    for (const question of lesson.questions)
      assert.equal(question.hints.length, 2, question.id);
  }
  assert.equal(allReviewQuestions.length, 33);
  assert.ok(
    allReviewQuestions.every((q) =>
      questions.some((original) => original.id === q.id),
    ),
  );
});
test("every course answer executes and grades by actual Postgres output, including write exercises", async () => {
  for (const question of questions) {
    const evaluate = (sql: string) =>
      question.exercise
        ? exerciseResult(
            create,
            datasets,
            sql,
            question.dataset,
            question.exercise,
          )
        : readOnlyResult(db, sql, question.dataset, question.parameters);
    try {
      const expected = await evaluate(question.referenceSql);
      const actual = await evaluate(
        answerSql(question, solutionAnswer(question)),
      );
      assert.ok(expected.fields.length > 0, question.id);
      assert.ok(
        compareResults(actual, expected, question).correct,
        question.id,
      );
      if (question.kind === "predict")
        for (let i = 0; i < question.choices!.length; i++) {
          if (i === question.correctChoice) continue;
          assert.equal(
            compareResults(
              await evaluate(answerSql(question, String(i))),
              expected,
              question,
            ).correct,
            false,
            `${question.id} distractor ${i}`,
          );
        }
    } catch (error) {
      throw new Error(
        `${question.id}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }
});
test("every runnable lesson example executes, and write demonstrations can be repeated", async () => {
  for (const lesson of allLessons)
    for (const example of lesson.examples) {
      const run = async () => {
        const connection = example.fresh ? await create() : db;
        try {
          if (example.fresh)
            for (const dataset of datasets) await connection.exec(dataset.seed);
          await connection.exec(
            `ROLLBACK; SET search_path TO ${example.dataset},public;`,
          );
          if (example.setup) await connection.exec(example.setup);
          const results = example.parameters
            ? [await connection.query(example.sql, example.parameters)]
            : await connection.exec(example.sql);
          assert.ok(
            results.some((result) => result.fields.length > 0),
            `${lesson.slug}: ${example.title}`,
          );
        } finally {
          await connection.exec("ROLLBACK");
          if (example.fresh) await connection.close();
        }
      };
      try {
        await run();
        if (example.fresh) await run();
      } catch (error) {
        throw new Error(
          `${lesson.slug} example ${example.title}: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        );
      }
    }
});
test("a committed write, DDL and failed answer cannot contaminate later checks", async () => {
  const spec = { setup: "", verify: "SELECT id,city FROM students WHERE id=1" };
  const changed = await exerciseResult(
    create,
    datasets,
    "BEGIN; UPDATE students SET city='Changed' WHERE id=1; COMMIT;",
    "campus",
    spec,
  );
  assert.equal(changed.rows[0][1], "Changed");
  const original = await exerciseResult(
    create,
    datasets,
    "SELECT 1",
    "campus",
    spec,
  );
  assert.equal(original.rows[0][1], "Pune");
  await assert.rejects(() =>
    exerciseResult(
      create,
      datasets,
      "DROP TABLE students CASCADE; SELECT missing_column FROM students",
      "campus",
      spec,
    ),
  );
  assert.equal(
    (await readOnlyResult(db, "SELECT city FROM students WHERE id=1", "campus"))
      .rows[0][0],
    "Pune",
  );
});
test("bound attack-shaped text remains a value and wrong writes fail the state comparison", async () => {
  const result = await readOnlyResult(
    db,
    "SELECT COUNT(*) FROM customers WHERE name=$1",
    "store",
    ["' OR true --"],
  );
  assert.equal(Number(result.rows[0][0]), 0);
  const spec = {
    setup: "",
    verify: "SELECT id,city FROM students ORDER BY id",
  };
  const expected = await exerciseResult(
    create,
    datasets,
    "UPDATE students SET city='Pune' WHERE id=4",
    "campus",
    spec,
  );
  const wrong = await exerciseResult(
    create,
    datasets,
    "UPDATE students SET city='Pune'",
    "campus",
    spec,
  );
  assert.equal(compareResults(wrong, expected).correct, false);
});

test("schema exercises reject missing keys, reversed composite indexes and the wrong view kind", async () => {
  const cases = [
    {
      slug: "build-a-thoughtful-table",
      index: 0,
      wrong:
        "CREATE TABLE practice_notebook(id int NOT NULL,title text NOT NULL,done boolean DEFAULT false);",
    },
    {
      slug: "a-shortcut-to-a-row",
      index: 1,
      wrong:
        "CREATE INDEX practice_customer_date ON orders(ordered_on,customer_id);",
    },
    {
      slug: "save-a-useful-view",
      index: 1,
      wrong:
        "CREATE VIEW practice_totals AS SELECT category,COUNT(*) AS n FROM products GROUP BY category;",
    },
  ];
  for (const item of cases) {
    const question = allLessons.find((l) => l.slug === item.slug)!.questions[
      item.index
    ];
    const expected = await exerciseResult(
      create,
      datasets,
      question.referenceSql,
      question.dataset,
      question.exercise!,
    );
    const wrong = await exerciseResult(
      create,
      datasets,
      item.wrong,
      question.dataset,
      question.exercise!,
    );
    assert.equal(
      compareResults(wrong, expected, question).correct,
      false,
      item.slug,
    );
  }
});
