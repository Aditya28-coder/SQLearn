"use client";

import {
  ChevronDown,
  ChevronRight,
  KeyRound,
  Link2,
  RefreshCw,
  Table2,
} from "lucide-react";
import type { Table } from "@/lib/database-types";
import { datasetMap, type DatasetId } from "@/data/datasets";

export function SchemaPanel({
  tables,
  dataset,
  busy,
  onPreview,
  onRefresh,
  error,
}: {
  tables: Table[];
  dataset: DatasetId;
  busy: boolean;
  onPreview: (table: string) => void;
  onRefresh: () => void;
  error: string;
}) {
  return (
    <section className="schema-panel" aria-labelledby="schema-heading">
      <div className="schema-heading">
        <div>
          <h2 id="schema-heading">Your data, at a glance</h2>
          <p>{datasetMap[dataset].name}</p>
        </div>
        <button
          className="icon-button"
          onClick={onRefresh}
          disabled={busy}
          aria-label="Refresh table schema"
        >
          <RefreshCw size={15} />
        </button>
      </div>
      <p className="schema-help">Open a table to meet its columns.</p>
      {error ? (
        <p className="schema-error" role="status">
          {error}
        </p>
      ) : tables.length ? (
        tables.map((table) => (
          <details
            className="schema-table"
            key={`${dataset}-${table.name}`}
            open={undefined}
          >
            <summary>
              <Table2 size={15} />
              <strong>{table.name}</strong>
              <span>{table.count} rows</span>
              <ChevronDown size={14} className="schema-chevron" />
            </summary>
            <div className="schema-columns">
              {table.columns.map((column) => (
                <div className="schema-column" key={column.name}>
                  <span className="column-key">
                    {column.primary ? (
                      <KeyRound size={12} aria-label="Primary key" />
                    ) : column.foreign ? (
                      <Link2 size={12} aria-label="Foreign key" />
                    ) : (
                      <span>·</span>
                    )}
                  </span>
                  <span className="column-name">{column.name}</span>
                  <span
                    className="column-type"
                    title={`${column.type}${column.nullable ? "; can be NULL" : "; required"}`}
                  >
                    {column.type
                      .replace("character varying", "text")
                      .replace("timestamp without time zone", "timestamp")}
                    {column.nullable ? " ?" : ""}
                  </span>
                </div>
              ))}
              <button
                className="schema-preview"
                onClick={() => onPreview(table.name)}
                disabled={busy}
              >
                Explore these rows <ChevronRight size={13} />
              </button>
            </div>
          </details>
        ))
      ) : (
        <p className="schema-loading">
          {busy
            ? "Getting your tables ready…"
            : "No tables in this dataset. Reset it to bring the samples back."}
        </p>
      )}
      <div className="schema-key">
        <span>
          <KeyRound size={12} /> Primary key
        </span>
        <span>
          <Link2 size={12} /> Foreign key
        </span>
        <span>? Can be empty (NULL)</span>
      </div>
      <div className="schema-note">
        <p>
          <strong>A little like a spreadsheet.</strong>
          <br />A table has rows (individual things) and columns (details about
          each thing).
        </p>
      </div>
    </section>
  );
}
