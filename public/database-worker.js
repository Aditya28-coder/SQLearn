/* SQL stays in this worker. Terminating it also stops runaway WASM queries. */
import { PGlite } from "/pglite/index.js";
import { compareResults, readOnlyResult, displayResult, exerciseResult } from "/grading.mjs";

let db;
let activeDataset;
let seeds = [];
let gradingDatabase;
let databaseAssets;
const allowedDatasets = new Set(["campus", "store", "delivery"]);
const quote = (value) => '"' + value.replaceAll('"', '""') + '"';

async function schema(dataset) {
  const { rows } = await db.query(
    `
    SELECT c.table_name, c.column_name, c.data_type, c.is_nullable,
      EXISTS (SELECT 1 FROM information_schema.key_column_usage k
        JOIN information_schema.table_constraints t ON k.constraint_name = t.constraint_name
          AND k.constraint_schema = t.constraint_schema AND k.table_name = t.table_name
        WHERE k.table_schema = c.table_schema AND k.table_name = c.table_name
          AND k.column_name = c.column_name AND t.constraint_type = 'PRIMARY KEY') AS is_primary,
      EXISTS (SELECT 1 FROM information_schema.key_column_usage k
        JOIN information_schema.table_constraints t ON k.constraint_name = t.constraint_name
          AND k.constraint_schema = t.constraint_schema AND k.table_name = t.table_name
        WHERE k.table_schema = c.table_schema AND k.table_name = c.table_name
          AND k.column_name = c.column_name AND t.constraint_type = 'FOREIGN KEY') AS is_foreign
    FROM information_schema.columns c
    JOIN information_schema.tables tb ON c.table_schema = tb.table_schema AND c.table_name = tb.table_name
    WHERE c.table_schema = $1 AND tb.table_type = 'BASE TABLE'
    ORDER BY c.table_name, c.ordinal_position`,
    [dataset],
  );
  const tables = [];
  for (const row of rows) {
    let table = tables.find((item) => item.name === row.table_name);
    if (!table) {
      const result = await db.query(
        `SELECT COUNT(*)::int AS n FROM ${quote(dataset)}.${quote(row.table_name)}`,
      );
      table = { name: row.table_name, count: result.rows[0].n, columns: [] };
      tables.push(table);
    }
    table.columns.push({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === "YES",
      primary: row.is_primary,
      foreign: row.is_foreign,
    });
  }
  return tables;
}

let queue = Promise.resolve();
self.onmessage = ({ data }) => {
  queue = queue.then(async () => {
    const { id, kind, dataset, sql } = data;
    const start = performance.now();
    try {
      if (!allowedDatasets.has(dataset))
        throw new Error("Choose one of the sample datasets.");
      if (kind === "init") {
        seeds = data.seeds;
        databaseAssets = {
          pgliteWasmModule: await WebAssembly.compileStreaming(
            fetch("/pglite/pglite.wasm"),
          ),
          fsBundle: await (await fetch("/pglite/pglite.data")).blob(),
        };
        db = await PGlite.create(databaseAssets);
        await db.exec(seeds.map((entry) => entry.seed).join("\n"));
      }
      if (!db)
        throw new Error(
          "The database is still getting ready. Try again in a moment.",
        );
      if (kind === "demo") {
        const scratch = await PGlite.create(databaseAssets);
        try {
          await scratch.exec(seeds.map(entry=>entry.seed).join("\n"));
          await scratch.exec(`SET search_path TO ${quote(dataset)}, public;`);
          if(data.setupSql) await scratch.exec(data.setupSql);
          const results = data.parameters ? [await scratch.query(sql,data.parameters)] : await scratch.exec(sql);
          self.postMessage({id,results:results.map(result=>({...result,totalRows:result.rows.length,rows:result.rows.slice(0,200)})),elapsed:performance.now()-start});
        } finally { await scratch.close(); }
        return;
      }
      if (kind === "grade") {
        if (!sql?.trim() || sql.length > 50000)
          throw new Error(
            "Keep your answer under 50,000 characters.",
          );
        if (!data.exercise && !gradingDatabase) {
          gradingDatabase = await PGlite.create(databaseAssets);
          await gradingDatabase.exec(
            seeds.map((entry) => entry.seed).join("\n"),
          );
        }
        const evaluate = (answer) => data.exercise
          ? exerciseResult(() => PGlite.create(databaseAssets), seeds, answer, dataset, data.exercise)
          : readOnlyResult(gradingDatabase, answer, dataset, data.parameters);
        const expected = await evaluate(data.referenceSql);
        let grade;
        try {
          const actual = await evaluate(sql);
          grade = {
            ...compareResults(actual, expected, {
              ordered: data.ordered,
              checkColumnNames: data.checkColumnNames,
            }),
            actual: displayResult(actual),
            expected: displayResult(expected),
          };
        } catch (error) {
          grade = {
            correct: false,
            reason:
              "A little SQL hiccup. Your idea can still be on the right track.",
            expected: displayResult(expected),
            error: error.message,
            code: error.code,
          };
        }
        self.postMessage({ id, grade, elapsed: performance.now() - start });
        return;
      }
      if (kind === "reset") {
        // A failed or deliberately open transaction must not prevent a reset.
        await db.exec("ROLLBACK;");
        await db.exec(`DROP SCHEMA IF EXISTS ${quote(dataset)} CASCADE;`);
        await db.exec(seeds.find((entry) => entry.id === dataset).seed);
      }
      // Switching worlds ends an uncommitted transaction. Within a world, allow
      // ROLLBACK to reach Postgres even when an earlier statement has failed.
      if (activeDataset && activeDataset !== dataset)
        await db.exec("ROLLBACK;");
      try {
        await db.exec(`SET search_path TO ${quote(dataset)}, public;`);
        activeDataset = dataset;
      } catch (error) {
        if (error.code !== "25P02" || kind !== "run") throw error;
      }
      if (kind === "run") {
        const results = data.parameters ? [await db.query(sql,data.parameters)] : await db.exec(sql);
        const limited = results.map((result) => ({
          ...result,
          totalRows: result.rows.length,
          rows: result.rows.slice(0, 200),
        }));
        // Schema browsing is separate: it must not commit or otherwise change a learner's transaction.
        self.postMessage({
          id,
          results: limited,
          elapsed: performance.now() - start,
        });
      } else {
        self.postMessage({
          id,
          tables: await schema(dataset),
          elapsed: performance.now() - start,
        });
      }
    } catch (error) {
      self.postMessage({
        id,
        error: error.message || String(error),
        code: error.code,
        elapsed: performance.now() - start,
      });
    }
  });
};
