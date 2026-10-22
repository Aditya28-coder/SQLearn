"use client";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import {
  Check,
  ChevronRight,
  Heart,
  Lightbulb,
  Play,
  Sparkles,
} from "lucide-react";
import type { Question } from "@/data/lesson-types";
import { datasetMap } from "@/data/datasets";
import { nextCompliment } from "@/data/compliments";
import { answerSql, solutionAnswer, type PracticeRecord } from "@/lib/practice";
import type { DatabaseEngine } from "@/lib/use-database";
import type { Table, WorkerResponse } from "@/lib/database-types";
import type { PracticeState } from "@/lib/use-practice";
import { explainError } from "@/lib/friendly-errors";
import { usePreferences } from "./providers";
import { ResultTable } from "./result-table";
import { GlossaryText } from "./glossary-text";

const QueryEditor = dynamic(() => import("./query-editor"), {
  ssr: false,
  loading: () => <p className="editor-loading">Making room for your answer…</p>,
});
type Props = {
  scope: string;
  question: Question;
  engine: DatabaseEngine;
  tables: Table[];
  practice: PracticeState;
  busy: boolean;
  setBusy: (value: boolean) => void;
  onCorrect?: () => void;
};
export function PracticeQuestion({
  question,
  engine,
  tables,
  practice,
  busy,
  setBusy,
  onCorrect,
  scope,
}: Props) {
  const { name, theme } = usePreferences();
  const [record, setRecord] = useState<PracticeRecord>(
    () =>
      practice.store.questions[question.id] ?? {
        answer:
          question.kind === "predict" || question.kind === "fill"
            ? ""
            : question.starter,
        hints: 0,
        revealed: false,
        solved: false,
        attempts: 0,
      },
  );
  const [feedback, setFeedback] = useState<WorkerResponse["grade"]>();
  const [compliment, setCompliment] = useState("");
  const [solutionOpen, setSolutionOpen] = useState(record.revealed);
  const [error, setError] = useState("");
  const [celebration, setCelebration] = useState(0);
  function update(patch: Partial<PracticeRecord>) {
    const next = { ...record, ...patch };
    setRecord(next);
    practice.updateQuestion(question.id, next);
    practice.visit(scope, question.id);
    return next;
  }
  const check = useCallback(async () => {
    if (busy || !engine.ready || !record.answer.trim()) return;
    setBusy(true);
    setError("");
    const submitted = record.answer;
    try {
      const response = await engine.grade(
        answerSql(question, submitted),
        question.referenceSql,
        question.dataset,
        {
          ordered: question.ordered,
          checkColumnNames: question.checkColumnNames,
          parameters: question.parameters,
          exercise: question.exercise,
        },
      );
      if (response.error || !response.grade) {
        setError(
          response.error || "The check couldn’t finish. Please try again.",
        );
        return;
      }
      setFeedback(response.grade);
      const next = {
        ...record,
        attempts: record.attempts + 1,
        solved: record.solved || response.grade.correct,
      };
      setRecord(next);
      practice.checkQuestion(
        question.id,
        record,
        response.grade.correct,
        scope,
      );
      if (response.grade.correct) {
        setCompliment(nextCompliment(name));
        setCelebration((value) => value + 1);
        onCorrect?.();
      }
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Let’s try that check again.",
      );
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    engine,
    record,
    question,
    name,
    onCorrect,
    setBusy,
    practice,
    scope,
  ]);
  function changeAnswer(answer: string) {
    update({ answer });
    setFeedback(undefined);
    setError("");
  }
  const kindLabel = {
    write: "Write a query",
    fix: "Fix a little hiccup",
    predict: "Predict the output",
    fill: "Fill in the gap",
  }[question.kind];
  const errorExplanation = feedback?.error
    ? feedback.code === "25006"
      ? "This question is about reading rows. Try one SELECT statement; table changes belong in the free playground."
      : /multiple commands/i.test(feedback.error)
        ? "Use one query for this answer. The free playground can run several statements together."
        : feedback.code
          ? explainError(feedback.error, feedback.code)
          : feedback.error
    : "";
  return (
    <article
      className="practice-question"
      aria-labelledby={`question-${question.id}`}
    >
      <div className="question-meta">
        <span>{question.conceptual ? "Choose an explanation" : kindLabel}</span>
        <span className={`difficulty ${question.difficulty}`}>
          {question.difficulty}
        </span>
        <span>{datasetMap[question.dataset].name}</span>
      </div>
      <h3 id={`question-${question.id}`}>{question.title}</h3>
      <p className="question-prompt">
        <GlossaryText text={question.prompt} />
      </p>
      {question.parameters && (
        <p className="practice-parameters">
          Bound parameters for this check:{" "}
          <code>{JSON.stringify(question.parameters)}</code>. Keep $1, $2… in
          the SQL; the values travel separately.
        </p>
      )}
      {question.exercise && (
        <details className="exercise-check">
          <summary>Your fresh workspace and how it is checked</summary>
          <p>
            Each check runs in its own disposable database. Even committed
            changes stay inside that check.
          </p>
          {question.exercise.setup && (
            <>
              <h4>Setup provided for you</h4>
              <pre>
                <code>{question.exercise.setup}</code>
              </pre>
            </>
          )}
          <h4>After your answer, we inspect</h4>
          <pre>
            <code>{question.exercise.verify}</code>
          </pre>
        </details>
      )}
      {record.solved && !feedback && (
        <p className="previous-solve">
          <Check size={14} />
          You’ve solved this one before
          {record.revealed ? ", with a little help" : ""}. Revisit it whenever
          you like.
        </p>
      )}
      {question.kind === "predict" ? (
        <>
          {!question.conceptual && (
            <pre className="question-query">
              <code>{question.starter}</code>
            </pre>
          )}
          <fieldset className="prediction-options" disabled={busy}>
            <legend>
              {question.conceptual
                ? "Which explanation fits?"
                : "What do you think the output will be?"}
            </legend>
            {question.choices!.map((choice, index) => (
              <label
                key={choice.label}
                className={record.answer === String(index) ? "is-selected" : ""}
              >
                <input
                  type="radio"
                  name={`prediction-${question.id}`}
                  value={index}
                  checked={record.answer === String(index)}
                  onChange={() => changeAnswer(String(index))}
                />
                <span>{choice.label}</span>
              </label>
            ))}
          </fieldset>
        </>
      ) : question.kind === "fill" ? (
        <div className="fill-answer">
          <pre>
            <code>{question.template?.replace("{{blank}}", "______")}</code>
          </pre>
          <label htmlFor={`blank-${question.id}`}>
            Your missing SQL word or expression
          </label>
          <input
            id={`blank-${question.id}`}
            value={record.answer}
            onChange={(event) => changeAnswer(event.target.value)}
            disabled={busy}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                void check();
              }
            }}
          />
        </div>
      ) : (
        <div className="practice-editor">
          <QueryEditor
            value={record.answer}
            onChange={changeAnswer}
            onRun={check}
            tables={tables}
            dark={theme === "dark"}
            disabled={busy}
            label="Practice SQL editor"
          />
        </div>
      )}
      <div className="practice-actions">
        <button
          className="hint-button"
          disabled={busy || record.hints >= 2}
          onClick={() => update({ hints: Math.min(2, record.hints + 1) })}
        >
          <Lightbulb size={16} />
          {record.hints === 0
            ? "A little hint"
            : record.hints === 1
              ? "Another hint"
              : "Both hints are here"}
        </button>
        <button
          className="button primary"
          onClick={() => void check()}
          disabled={busy || !engine.ready || !record.answer.trim()}
        >
          <Play size={13} />
          {busy ? "Checking your idea…" : "Check my answer"}
        </button>
      </div>
      {record.hints > 0 && (
        <div className="practice-hints" aria-live="polite">
          {question.hints.slice(0, record.hints).map((hint, index) => (
            <p key={hint}>
              <Lightbulb size={14} />
              <span>
                <strong>Hint {index + 1}.</strong> {hint}
              </span>
            </p>
          ))}
        </div>
      )}
      {error && (
        <div className="practice-system-error" role="alert">
          <p>{error}</p>
          {engine.startupError && (
            <button
              className="button secondary"
              onClick={() => {
                setError("");
                setBusy(false);
                engine.restart();
              }}
            >
              Restart practice database
            </button>
          )}
        </div>
      )}
      {feedback && (
        <div
          className={`practice-feedback ${feedback.correct ? "is-correct" : "keep-going"}`}
          aria-live="polite"
        >
          <div className="feedback-message" key={celebration}>
            {feedback.correct ? (
              <>
                <span className="celebration-sparkles" aria-hidden="true">
                  <Sparkles size={27} />
                  <span>
                    <Sparkles size={12} />
                  </span>
                  <span>
                    <Sparkles size={10} />
                  </span>
                </span>
                <div>
                  <h4>{compliment}</h4>
                  <p>
                    {record.revealed
                      ? "You worked through it with a little help. That’s learning, too."
                      : question.conceptual
                        ? "You found the explanation that fits. Thoughtful SQL grows from little ideas like this."
                        : feedback.reason}
                  </p>
                  <p>{question.explanation}</p>
                </div>
              </>
            ) : (
              <>
                <Heart size={22} />
                <div>
                  <h4>A little closer. Let’s look together.</h4>
                  <p>
                    {question.conceptual
                      ? "That explanation doesn’t quite fit yet. Revisit the little rule above, or open a hint and try another idea."
                      : errorExplanation || feedback.reason}
                  </p>
                </div>
              </>
            )}
          </div>
          {feedback.error && (
            <details className="practice-raw-error">
              <summary>The Postgres message</summary>
              <pre>{feedback.error}</pre>
            </details>
          )}
          {!question.conceptual && (
            <div className="answer-comparison">
              <section>
                <h4>Your output</h4>
                {feedback.actual ? (
                  <ResultTable result={feedback.actual} />
                ) : (
                  <p className="no-output">
                    Your query needs a little adjustment before it can return
                    rows.
                  </p>
                )}
              </section>
              <section>
                <h4>The expected output</h4>
                <ResultTable result={feedback.expected} />
              </section>
            </div>
          )}
        </div>
      )}
      <div className="solution-area">
        <button
          className="solution-toggle"
          disabled={busy}
          aria-expanded={solutionOpen}
          onClick={() => {
            if (!solutionOpen) {
              setSolutionOpen(true);
              if (!record.solved) update({ revealed: true });
            } else setSolutionOpen(false);
          }}
        >
          <ChevronRight size={14} className={solutionOpen ? "turned" : ""} />
          {feedback?.correct
            ? "Show solution + explanation"
            : "I’d like to see the solution"}
        </button>
        {solutionOpen && (
          <div className="solution-content">
            <p className="solution-kindness">
              Looking is learning, too. This is one possible answer; other
              queries can be correct.
            </p>
            {question.kind === "predict" && (
              <p>
                <strong>The answer:</strong>{" "}
                {question.choices?.[question.correctChoice!]?.label}
              </p>
            )}
            {!question.conceptual && (
              <pre>
                <code>{question.referenceSql}</code>
              </pre>
            )}
            <p>{question.explanation}</p>
            <button
              className="text-link"
              disabled={busy}
              onClick={() => changeAnswer(solutionAnswer(question))}
            >
              {question.kind === "predict"
                ? "Choose this answer"
                : question.kind === "fill"
                  ? "Try this in the gap"
                  : "Try this answer in the editor"}{" "}
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      <p className="practice-storage-note">
        {practice.storageAvailable
          ? "Your answer, hints, and solved state save in this browser."
          : "Browser storage is unavailable. Your work will last for this visit."}{" "}
        {question.exercise
          ? "This exercise uses a fresh disposable database for each answer."
          : "Practice checks use the original sample data."}
      </p>
    </article>
  );
}
