"use client";

import CodeMirror from "@uiw/react-codemirror";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { useMemo } from "react";
import type { Table } from "@/lib/database-types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  tables: Table[];
  dark: boolean;
  disabled?: boolean;
  label?: string;
};

export default function QueryEditor({
  value,
  onChange,
  onRun,
  tables,
  dark,
  disabled = false,
  label = "SQL query editor",
}: Props) {
  const extensions = useMemo(
    () => [
      sql({
        dialect: PostgreSQL,
        schema: Object.fromEntries(
          tables.map((table) => [
            table.name,
            table.columns.map((column) => column.name),
          ]),
        ),
        upperCaseKeywords: true,
      }),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-label": label,
        spellcheck: "false",
        autocapitalize: "off",
      }),
      Prec.highest(
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onRun();
              return true;
            },
          },
        ]),
      ),
      EditorView.theme(
        {
          "&": {
            backgroundColor: "var(--editor)",
            color: "var(--ink)",
            fontSize: "14px",
            minHeight: "240px",
          },
          ".cm-content": {
            fontFamily: "'Consolas', 'SFMono-Regular', monospace",
            padding: "20px 0",
            minHeight: "240px",
            caretColor: "var(--accent)",
          },
          ".cm-line": { padding: "0 20px", lineHeight: "1.9" },
          ".cm-gutters": {
            backgroundColor: "var(--editor)",
            color: "var(--muted)",
            border: "none",
            padding: "0 4px 0 14px",
          },
          ".cm-gutterElement": { lineHeight: "1.9" },
          ".cm-activeLine, .cm-activeLineGutter": {
            backgroundColor: "var(--editor-active)",
          },
          "&.cm-focused": { outline: "none" },
          ".cm-scroller": { overflow: "auto" },
          ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
            backgroundColor: "var(--selection) !important",
          },
        },
        { dark },
      ),
    ],
    [tables, dark, onRun, label],
  );
  return (
    <CodeMirror
      value={value}
      editable={!disabled}
      onChange={onChange}
      extensions={extensions}
      theme={dark ? "dark" : "light"}
      basicSetup={{
        foldGutter: false,
        highlightActiveLine: true,
        autocompletion: true,
        lineNumbers: true,
      }}
    />
  );
}
