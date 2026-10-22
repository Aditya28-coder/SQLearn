"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, Copy, Search, X } from "lucide-react";
import { levels } from "@/data/curriculum";
import { glossaryId } from "@/data/glossary";
import { GlossaryText } from "./glossary-text";
import {
  findReferenceLessons,
  findGlossaryTerms,
  normalizeReference as normalize,
} from "@/lib/reference";
export function ReferencePage({ mode = "sql" }: { mode?: "sql" | "glossary" }) {
  const [search, setSearch] = useState(""),
    [level, setLevel] = useState(0),
    [copied, setCopied] = useState(""),
    [copyError, setCopyError] = useState("");
  useEffect(() => {
    const term = new URLSearchParams(window.location.search).get("term");
    if (term) setSearch(term.slice(0, 200));
  }, []);
  const needle = normalize(search.trim());
  const lessons = findReferenceLessons(search, level);
  const terms = findGlossaryTerms(search);
  async function copy(id: string, sql: string) {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(id);
    } catch {
      setCopyError(
        "Your browser couldn’t copy this time. You can select the SQL text and copy it yourself.",
      );
    }
  }
  return (
    <div className="page-content reference-page">
      <div className="page-heading">
        <div>
          <h1>
            {mode === "sql"
              ? "A little SQL, close at hand."
              : "A word, in familiar words."}
          </h1>
          <p>
            {mode === "sql"
              ? "A searchable companion for every idea on your path."
              : "Small definitions for the words you meet along the way."}
          </p>
        </div>
        <BookOpen size={23} />
      </div>
      <nav className="reference-tabs" aria-label="Reference pages">
        <Link
          href="/cheat-sheet/"
          aria-current={mode === "sql" ? "page" : undefined}
        >
          SQL cheat sheet
        </Link>
        <Link
          href="/glossary/"
          aria-current={mode === "glossary" ? "page" : undefined}
        >
          Little glossary
        </Link>
      </nav>
      <div className="reference-search">
        <Search size={18} />
        <label className="sr-only" htmlFor="reference-search">
          {mode === "sql"
            ? "Search SQL concepts or syntax"
            : "Search glossary terms"}
        </label>
        <input
          id="reference-search"
          type="search"
          maxLength={200}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            mode === "sql"
              ? "Try JOIN, GROUP BY, window, or transaction…"
              : "Try primary key, sargable, or CTE…"
          }
        />
        {search && (
          <button aria-label="Clear search" onClick={() => setSearch("")}>
            <X size={17} />
          </button>
        )}
      </div>
      {mode === "sql" && (
        <div className="reference-filters" aria-label="Filter by level">
          {[
            { id: 0, name: "Every level" },
            ...levels.map((l) => ({ id: l.id, name: `Level ${l.id}` })),
          ].map((item) => (
            <button
              key={item.id}
              aria-pressed={level === item.id}
              onClick={() => setLevel(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      <p className="reference-count" role="status">
        {mode === "sql"
          ? `${lessons.length} ${lessons.length === 1 ? "idea" : "ideas"}`
          : `${terms.length} ${terms.length === 1 ? "definition" : "definitions"}`}{" "}
        {needle ? `matching “${search.trim()}”` : "to explore"}
      </p>
      {copyError && (
        <p className="reference-copy-error" role="alert">
          {copyError}
        </p>
      )}
      {mode === "sql" ? (
        <div className="reference-list">
          {lessons.map((lesson) => (
            <details
              key={lesson.slug}
              id={lesson.slug}
              className="reference-entry"
              open={Boolean(needle)}
            >
              <summary>
                <span
                  className={`reference-level ${levels[(lesson.level ?? 1) - 1].color}`}
                >
                  {lesson.level}
                </span>
                <h2>{lesson.shortTitle}</h2>
                <ArrowRight size={16} />
              </summary>
              <div className="reference-entry-body">
                <p>
                  <GlossaryText text={lesson.concept} />
                </p>
                <div className="reference-code-heading">
                  <strong>A little example</strong>
                  <button
                    onClick={() =>
                      void copy(lesson.slug, lesson.examples[0].sql)
                    }
                  >
                    {copied === lesson.slug ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}{" "}
                    {copied === lesson.slug ? "Copied" : "Copy SQL"}
                  </button>
                </div>
                <pre tabIndex={0} aria-label={`${lesson.title} SQL example`}>
                  <code>{lesson.examples[0].sql}</code>
                </pre>
                {lesson.examples[0].setup && (
                  <p className="reference-context">
                    This example uses a scratch workspace prepared in its
                    lesson. Open the lesson to run it with that setup.
                  </p>
                )}
                {lesson.examples[0].parameters && (
                  <p className="reference-context">
                    This example binds{" "}
                    {JSON.stringify(lesson.examples[0].parameters)} separately.
                    Open the lesson to run its placeholders with those values.
                  </p>
                )}
                <ul>
                  {lesson.recap.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link
                  href={`/learn/${lesson.slug}/#examples`}
                  className="text-link"
                >
                  Try it in the lesson <ArrowRight size={14} />
                </Link>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <dl className="glossary-list">
          {terms
            .sort((a, b) => a.term.localeCompare(b.term))
            .map((item) => (
              <div key={item.term} id={glossaryId(item.term)}>
                <dt>{item.term}</dt>
                <dd>{item.definition}</dd>
              </div>
            ))}
        </dl>
      )}
      {(mode === "sql" ? lessons.length === 0 : terms.length === 0) && (
        <div className="reference-empty">
          <Search size={26} />
          <h2>No little matches yet.</h2>
          <p>Try a shorter word or another spelling.</p>
          <button
            className="button secondary"
            onClick={() => {
              setSearch("");
              setLevel(0);
            }}
          >
            Show everything again
          </button>
        </div>
      )}
      <footer className="reference-footer">
        <p>
          PostgreSQL is the language you’re practicing. These official
          references can help when you want to look a little deeper.
        </p>
        <a
          href="https://www.postgresql.org/docs/current/tutorial.html"
          target="_blank"
          rel="noreferrer"
        >
          PostgreSQL tutorial ↗
        </a>
        <a
          href="https://www.postgresql.org/docs/current/sql-commands.html"
          target="_blank"
          rel="noreferrer"
        >
          SQL command reference ↗
        </a>
        <Link href="/playground/">
          Open your playground <ArrowRight size={14} />
        </Link>
      </footer>
      <p className="sr-only" aria-live="polite">
        {copied ? "SQL copied to clipboard." : ""}
      </p>
    </div>
  );
}
