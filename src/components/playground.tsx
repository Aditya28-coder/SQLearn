"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Code2,
  Database,
  Heart,
  LoaderCircle,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Square,
  Terminal,
  X,
} from "lucide-react";
import { datasets, datasetMap, type DatasetId } from "@/data/datasets";
import { useDatabase } from "@/lib/use-database";
import { explainError } from "@/lib/friendly-errors";
import type { QueryResult, Table } from "@/lib/database-types";
import { usePreferences } from "./providers";
import { ResultTable, cellText } from "./result-table";
import { SchemaPanel } from "./schema-panel";

const QueryEditor = dynamic(() => import("./query-editor"), {
  ssr: false,
  loading: () => (
    <div className="editor-loading">Making room for your next idea…</div>
  ),
});

export function Playground() {
  const { theme } = usePreferences();
  const [dataset, setDataset] = useState<DatasetId>("campus");
  const [drafts, setDrafts] = useState<Record<DatasetId, string>>(
    () =>
      Object.fromEntries(
        datasets.map((data) => [data.id, data.starters[0].sql]),
      ) as Record<DatasetId, string>,
  );
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [schemaError, setSchemaError] = useState("");
  const [schemaLoading, setSchemaLoading] = useState(false);
  const schemaVersion = useRef(0);
  const [results, setResults] = useState<QueryResult[] | null>(null);
  const [resultIndex, setResultIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [queryError, setQueryError] = useState<{
    raw: string;
    code?: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [starterIndex, setStarterIndex] = useState(0);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const { ready, startupError, restart, run, getSchema, reset } = useDatabase();
  const busy = running || resetting || !ready;
  const current = datasetMap[dataset];
  const query = drafts[dataset];

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("sqlearn:drafts") || "null",
      );
      if (saved && typeof saved === "object")
        setDrafts(
          (previous) =>
            Object.fromEntries(
              datasets.map(({ id }) => [
                id,
                typeof saved[id] === "string"
                  ? saved[id].slice(0, 50000)
                  : previous[id],
              ]),
            ) as Record<DatasetId, string>,
        );
    } catch {
      setStorageError(true);
    }
    setDraftsLoaded(true);
  }, []);
  useEffect(() => {
    if (!draftsLoaded) return;
    try {
      localStorage.setItem("sqlearn:drafts", JSON.stringify(drafts));
    } catch {
      setStorageError(true);
    }
  }, [drafts, draftsLoaded]);

  const refreshSchema = useCallback(async () => {
    if (!ready) return;
    const version = ++schemaVersion.current;
    setSchemaLoading(true);
    try {
      const response = await getSchema(dataset);
      if (version !== schemaVersion.current) return;
      if (response.error)
        setSchemaError(
          "The schema couldn’t refresh. If a transaction failed, run ROLLBACK; then refresh.",
        );
      else {
        setTables(response.tables ?? []);
        setSchemaError("");
      }
    } catch {
      if (version === schemaVersion.current)
        setSchemaError("Restart your database to bring the schema back.");
    } finally {
      if (version === schemaVersion.current) setSchemaLoading(false);
    }
  }, [dataset, ready, getSchema]);
  useEffect(() => {
    setTables([]);
    setSchemaError("");
    void refreshSchema();
  }, [refreshSchema]);

  const runQuery = useCallback(async () => {
    if (busy) return;
    if (!query.trim()) {
      setQueryError({
        raw: "Write a little SQL first — or choose a starter above.",
      });
      return;
    }
    if (query.length > 50000) {
      setQueryError({
        raw: "That’s a very big query! Keep it under 50,000 characters for this little playground.",
      });
      return;
    }
    setRunning(true);
    setQueryError(null);
    setNotice("");
    try {
      const response = await run(query, dataset);
      setElapsed(response.elapsed ?? 0);
      if (response.error) {
        setQueryError({ raw: response.error, code: response.code });
        setResults(null);
      } else {
        setResults(response.results ?? []);
        setResultIndex(Math.max(0, (response.results?.length ?? 1) - 1));
        await refreshSchema();
      }
    } catch (error) {
      setQueryError({
        raw:
          error instanceof Error
            ? error.message
            : "Your query stopped. Please try again.",
      });
      setResults(null);
    } finally {
      setRunning(false);
    }
  }, [busy, query, dataset, run, refreshSchema]);

  async function resetDataset() {
    setResetting(true);
    setNotice("");
    setQueryError(null);
    try {
      const response = await reset(dataset);
      if (response.error)
        setQueryError({ raw: response.error, code: response.code });
      else {
        setTables(response.tables ?? []);
        setSchemaError("");
        setResults(null);
        setNotice(
          `${current.name} is back to its original sample data. Your query draft is safe.`,
        );
      }
    } catch (error) {
      setQueryError({
        raw:
          error instanceof Error
            ? error.message
            : "Please restart the database and try again.",
      });
    } finally {
      setResetting(false);
      resetButtonRef.current?.focus();
    }
  }

  function setQuery(value: string) {
    setDrafts((previous) => ({ ...previous, [dataset]: value }));
  }
  function switchDataset(value: DatasetId) {
    setDataset(value);
    setResults(null);
    setQueryError(null);
    setNotice("");
    setStarterIndex(0);
  }
  function downloadResult() {
    const result = results?.[resultIndex];
    if (!result?.fields.length) return;
    // Prefix spreadsheet formulas so opening a CSV cannot execute sample/query values as formulas.
    const escape = (value: unknown, dataTypeID?: number) => {
      const text = cellText(value, dataTypeID);
      return (
        '"' +
        (/^[=+@\-\t\r]/.test(text) ? "'" : "") +
        text.replaceAll('"', '""') +
        '"'
      );
    };
    const csv = [
      result.fields.map((field) => escape(field.name)).join(","),
      ...result.rows.map((row) =>
        result.fields
          .map((field) => escape(row[field.name], field.dataTypeID))
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${dataset}-results.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Downloaded the displayed result rows as CSV.");
  }

  const selectedResult = results?.[resultIndex];
  return (
    <div className="page-content playground-page">
      <div className="page-heading">
        <div>
          <h1>A little room to experiment.</h1>
          <p>Ask a question. Try a query. See what you discover.</p>
        </div>
        <span className={`engine-status ${ready ? "ready" : ""}`} role="status">
          <span />
          {ready
            ? "Postgres is ready"
            : startupError
              ? "Database needs a restart"
              : "Waking up Postgres…"}
        </span>
      </div>
      <section
        className="dataset-toolbar"
        aria-label="Choose your sample dataset"
      >
        <div className="dataset-select-wrap">
          <Database size={19} />
          <div>
            <label htmlFor="dataset">Your little world</label>
            <select
              id="dataset"
              value={dataset}
              onChange={(event) =>
                switchDataset(event.target.value as DatasetId)
              }
              disabled={busy}
            >
              {datasets.map((data) => (
                <option key={data.id} value={data.id}>
                  {data.name}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown size={15} className="select-chevron" />
        </div>
        <p>{current.description}</p>
        <button
          ref={resetButtonRef}
          className="button secondary reset-button"
          onClick={() => void resetDataset()}
          disabled={busy}
        >
          <RotateCcw size={15} />
          {resetting ? "Restoring…" : "Reset database"}
        </button>
      </section>
      {startupError && (
        <div className="engine-error" role="alert">
          <div>
            <h2>Let’s give it a fresh start.</h2>
            <p>{startupError}</p>
          </div>
          <button className="button secondary" onClick={restart}>
            <RefreshCw size={16} />
            Restart database
          </button>
        </div>
      )}
      {notice && (
        <div className="playground-notice" role="status">
          <Check size={16} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <div className="playground-grid">
        <div className="editor-column">
          <section className="editor-panel" aria-labelledby="editor-heading">
            <div className="editor-panel-heading">
              <div>
                <Code2 size={17} />
                <h2 id="editor-heading">Your query</h2>
              </div>
              <span>PostgreSQL</span>
            </div>
            <div className="starter-toolbar">
              <label htmlFor="starter">Need a starting point?</label>
              <div className="starter-controls">
                <select
                  id="starter"
                  value={starterIndex}
                  disabled={running}
                  onChange={(event) =>
                    setStarterIndex(Number(event.target.value))
                  }
                >
                  {current.starters.map((starter, index) => (
                    <option key={starter.label} value={index}>
                      {starter.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setQuery(current.starters[starterIndex].sql);
                    setNotice(
                      "Starter added to the editor. Make it your own, then run it.",
                    );
                  }}
                  disabled={running}
                  className="starter-load"
                >
                  Try this <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <QueryEditor
              value={query}
              onChange={setQuery}
              onRun={runQuery}
              tables={tables}
              dark={theme === "dark"}
            />
            <div className="editor-bottom-bar">
              <span className="keyboard-hint">
                <kbd>Ctrl / ⌘</kbd> + <kbd>Enter</kbd> to run
              </span>
              {running ? (
                <button
                  className="button stop-button"
                  onClick={() => {
                    restart();
                    setNotice(
                      "Query stopped. All three sample datasets are being restored; your drafts are safe.",
                    );
                  }}
                >
                  <Square size={13} />
                  Stop query
                </button>
              ) : (
                <button
                  className="button primary run-query"
                  onClick={() => void runQuery()}
                  disabled={busy || !query.trim()}
                >
                  <Play size={14} fill="currentColor" />
                  {!ready ? "Getting ready…" : "Run query"}
                </button>
              )}
            </div>
          </section>
          <div className="query-tip">
            <Sparkles size={16} />
            <p>{current.starters[starterIndex].description}</p>
          </div>
          <section
            className="results-panel"
            aria-labelledby="results-heading"
            aria-busy={running}
          >
            <div className="results-heading">
              <div>
                <Terminal size={17} />
                <h2 id="results-heading">The little discoveries</h2>
                {selectedResult && (
                  <span className="result-count">
                    {selectedResult.fields.length
                      ? `${selectedResult.totalRows ?? selectedResult.rows.length} rows`
                      : `${selectedResult.affectedRows ?? 0} rows affected`}
                  </span>
                )}
              </div>
              <div className="result-actions">
                {results && <span>{Math.round(elapsed)} ms</span>}
                {selectedResult && selectedResult.fields.length > 0 && (
                  <button
                    className="icon-button"
                    onClick={downloadResult}
                    aria-label="Download displayed results as CSV"
                  >
                    <ArrowDownToLine size={16} />
                  </button>
                )}
              </div>
            </div>
            {running ? (
              <div className="result-empty" role="status">
                <LoaderCircle className="spin" size={25} />
                <h3>A little thinking in progress…</h3>
                <p>Your database is working on your question.</p>
              </div>
            ) : queryError ? (
              <div className="query-error" role="alert">
                <div className="error-intro">
                  <Heart size={19} />
                  <h3>A little hiccup. You’re still doing great.</h3>
                </div>
                <p>
                  {queryError.code
                    ? explainError(queryError.raw, queryError.code)
                    : queryError.raw}
                </p>
                <details>
                  <summary>The Postgres message</summary>
                  <pre>{queryError.raw}</pre>
                </details>
              </div>
            ) : results ? (
              <>
                {results.length > 1 && (
                  <div className="result-tabs" aria-label="Statement results">
                    {results.map((_, index) => (
                      <button
                        key={index}
                        aria-pressed={resultIndex === index}
                        onClick={() => setResultIndex(index)}
                      >
                        Result {index + 1}
                      </button>
                    ))}
                  </div>
                )}
                {selectedResult?.fields.length ? (
                  <ResultTable result={selectedResult} />
                ) : (
                  <div className="result-empty success">
                    <Check size={26} />
                    <h3>Your query ran. Nicely done.</h3>
                    <p>
                      {selectedResult?.affectedRows ?? 0} rows affected. Refresh
                      the schema to see any table changes.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="result-empty">
                <div className="result-empty-mark">
                  <TableIcon />
                </div>
                <h3>Something lovely starts with a question.</h3>
                <p>Run your query and your results will appear right here.</p>
                <span>No perfect answers needed. Just curiosity.</span>
              </div>
            )}
          </section>
        </div>
        <SchemaPanel
          tables={tables}
          dataset={dataset}
          busy={busy || schemaLoading}
          onRefresh={() => void refreshSchema()}
          error={schemaError}
          onPreview={(table) => {
            setQuery(
              `-- Take a peek inside ${table}.\nSELECT *\nFROM "${table.replaceAll('"', '""')}"\nLIMIT 20;`,
            );
            setNotice("Table preview added. Press Run query to explore.");
          }}
        />
      </div>
      <div className="playground-footnote">
        <Heart size={14} />
        <span>
          This is your practice space. Edits stay here until you refresh. A
          reset brings the sample data back.
        </span>
        <span>
          {storageError
            ? "Drafts can’t be saved in this browser."
            : "Your query drafts save automatically."}
        </span>
      </div>
    </div>
  );
}

function TableIcon() {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 35 35"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="7"
        width="25"
        height="22"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 14h25M5 21h25M14 14v15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m28 2 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" fill="currentColor" />
    </svg>
  );
}
