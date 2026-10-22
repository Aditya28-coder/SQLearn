import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { datasets } from "../src/data/datasets";
import { explainError } from "../src/lib/friendly-errors";

let db: PGlite;
before(async () => {
  db = await PGlite.create();
  for (const dataset of datasets) await db.exec(dataset.seed);
});
after(async () => {
  await db?.close();
});

test("all starter queries execute against real Postgres and return rows", async () => {
  for (const dataset of datasets) {
    await db.exec(`SET search_path TO ${dataset.id}, public`);
    for (const starter of dataset.starters) {
      const result = await db.exec(starter.sql);
      assert.ok(
        result.at(-1)!.rows.length > 0,
        `${dataset.id}: ${starter.label}`,
      );
    }
  }
});

test("sample data has intentional NULLs, duplicates and unmatched rows", async () => {
  const nulls = await db.query<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM campus.students WHERE city IS NULL",
  );
  assert.equal(nulls.rows[0].n, 1);
  const duplicates = await db.query(
    "SELECT name FROM campus.students GROUP BY name HAVING COUNT(*) > 1",
  );
  assert.deepEqual(duplicates.rows, [{ name: "Aanya" }]);
  const unmatched = await db.query<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM campus.students s LEFT JOIN campus.enrollments e ON e.student_id=s.id WHERE e.student_id IS NULL",
  );
  assert.equal(unmatched.rows[0].n, 1);
  const noOrders = await db.query<{ name: string }>(
    "SELECT c.name FROM store.customers c LEFT JOIN store.orders o ON o.customer_id=c.id WHERE o.id IS NULL",
  );
  assert.deepEqual(noOrders.rows, [{ name: "Sara" }]);
});

test("Postgres JOIN, JSONB and window functions work", async () => {
  const join = await db.query(
    "SELECT s.name FROM campus.students s JOIN campus.enrollments e ON s.id=e.student_id WHERE e.course_id=4 ORDER BY s.name",
  );
  assert.deepEqual(join.rows, [{ name: "Kabir" }, { name: "Tara" }]);
  const json = await db.query(
    "SELECT details->>'contactless' AS contactless FROM delivery.deliveries WHERE id=1",
  );
  assert.deepEqual(json.rows, [{ contactless: "true" }]);
  const window = await db.query<{ row: number }>(
    "SELECT ROW_NUMBER() OVER (ORDER BY id)::int AS row FROM campus.students",
  );
  assert.deepEqual(
    window.rows.map((row) => row.row),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("reset restores writes and custom tables without changing unrelated datasets", async () => {
  await db.exec(
    "UPDATE campus.students SET city='London'; CREATE TABLE campus.scratch (id int); DELETE FROM store.order_items WHERE id=1;",
  );
  await db.exec("DROP SCHEMA campus CASCADE;");
  await db.exec(datasets.find((dataset) => dataset.id === "campus")!.seed);
  const restored = await db.query(
    "SELECT city FROM campus.students WHERE id=1",
  );
  assert.deepEqual(restored.rows, [{ city: "Pune" }]);
  const scratch = await db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='campus' AND table_name='scratch'",
  );
  assert.equal(scratch.rows.length, 0);
  const other = await db.query<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM store.order_items",
  );
  assert.equal(other.rows[0].n, 7);
});

test("constraints and failed transactions surface useful errors", async () => {
  await assert.rejects(
    db.exec("INSERT INTO campus.students(id,name) VALUES (1,'Duplicate')"),
    (error: unknown) => (error as { code: string }).code === "23505",
  );
  assert.match(explainError("duplicate key", "23505"), /already used/);
  await db.exec("BEGIN;");
  await assert.rejects(db.exec("SELECT missing_column FROM campus.students;"));
  await db.exec("ROLLBACK;");
  assert.equal(
    (await db.query("SELECT * FROM campus.students")).rows.length,
    8,
  );
});
