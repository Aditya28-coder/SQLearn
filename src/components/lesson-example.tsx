"use client";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Code2, Play, RotateCcw } from "lucide-react";
import type { Lesson } from "@/data/lesson-types";
import type { DatabaseEngine } from "@/lib/use-database";
import type { QueryResult, Table } from "@/lib/database-types";
import { explainError } from "@/lib/friendly-errors";
import { usePreferences } from "./providers";
import { ResultTable } from "./result-table";

const QueryEditor = dynamic(() => import("./query-editor"), {
  ssr: false,
  loading: () => <p className="editor-loading">Making room for your query…</p>,
});
export function LessonExample({
  example,
  engine,
  tables,
  busy,
  setBusy,
}: {
  example: Lesson["examples"][number];
  engine: DatabaseEngine;
  tables: Table[];
  busy: boolean;
  setBusy: (value: boolean) => void;
}) {
  const { theme } = usePreferences();
  const [sql, setSql] = useState(example.sql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState("");
  const [rawError, setRawError] = useState("");
  const [notice, setNotice] = useState("");
  const execute = useCallback(async () => {
    if (busy || !engine.ready || !sql.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await engine.run(
        sql,
        example.dataset,
        example.fresh,
        example.setup,
        example.parameters,
      );
      if (response.error) {
        setError(explainError(response.error, response.code));
        setRawError(response.error);
        setResult(null);
      } else {
        setResult(
          response.results?.filter((result) => result.fields.length).at(-1) ??
            response.results?.at(-1) ??
            null,
        );
      }
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Try your query again.",
      );
    } finally {
      setBusy(false);
    }
  }, [busy, engine, sql, example.dataset, setBusy]);
  async function reset() {
    if (example.fresh) {
      setResult(null);
      setError("");
      setNotice(
        "Each run starts with fresh sample rows. Your edited query is still here.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await engine.reset(example.dataset);
      if (response.error) setError(explainError(response.error, response.code));
      else {
        setResult(null);
        setNotice("Sample rows restored. Your edited query is still here.");
      }
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Please restart the database.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="lesson-example">
      <div className="lesson-example-title">
        <div>
          <Code2 size={17} />
          <h3>{example.title}</h3>
        </div>
        <button
          className="lesson-reset"
          onClick={() => void reset()}
          disabled={busy || !engine.ready}
        >
          <RotateCcw size={13} />
          Reset database
        </button>
      </div>
      <p className="example-caption">{example.caption}</p>
      {example.fresh && (
        <p className="example-notice">
          A fresh database on every run, so you can safely repeat this example.
        </p>
      )}
      {example.parameters && (
        <p className="practice-parameters">
          Bound example values:{" "}
          <code>{JSON.stringify(example.parameters)}</code>. The query keeps its
          placeholders; these values are sent separately.
        </p>
      )}
      {example.setup && (
        <details className="exercise-check">
          <summary>The workspace prepared before each run</summary>
          <pre>
            <code>{example.setup}</code>
          </pre>
        </details>
      )}
      <QueryEditor
        value={sql}
        onChange={setSql}
        onRun={execute}
        tables={tables}
        dark={theme === "dark"}
        disabled={busy}
        label={`${example.title} SQL editor`}
      />
      <div className="example-actions">
        <button
          className="text-link"
          onClick={() => setSql(example.sql)}
          disabled={busy}
        >
          Restore example
        </button>
        <button
          className="button primary"
          onClick={() => void execute()}
          disabled={busy || !engine.ready || !sql.trim()}
        >
          <Play size={13} />
          {busy ? "A little thinking…" : "Run example"}
        </button>
      </div>
      {notice && (
        <p className="example-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <div className="query-error" role="alert">
          <p>{error}</p>
          {rawError && (
            <details>
              <summary>The Postgres message</summary>
              <pre>{rawError}</pre>
            </details>
          )}
        </div>
      )}
      {result &&
        (result.fields.length ? (
          <ResultTable result={result} />
        ) : (
          <p className="example-notice">
            Your statement ran. {result.affectedRows ?? 0} rows affected.
          </p>
        ))}
    </article>
  );
}
