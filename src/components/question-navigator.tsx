"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Question } from "@/data/lesson-types";
import type { DatabaseEngine } from "@/lib/use-database";
import type { Table } from "@/lib/database-types";
import type { DatasetId } from "@/data/datasets";
import type { PracticeState } from "@/lib/use-practice";
import { PracticeQuestion } from "./practice-question";

export function QuestionNavigator({
  scope,
  questions,
  engine,
  tables,
  practice,
  busy,
  setBusy,
  onCorrect,
}: {
  scope: string;
  questions: Question[];
  engine: DatabaseEngine;
  tables: Partial<Record<DatasetId, Table[]>>;
  practice: PracticeState;
  busy: boolean;
  setBusy: (value: boolean) => void;
  onCorrect?: () => void;
}) {
  // Mount the question state only after the notebook has loaded, so saved positions win.
  if (!practice.loaded)
    return <p className="practice-loading">Finding your saved little ideas…</p>;
  return (
    <LoadedNavigator
      {...{
        scope,
        questions,
        engine,
        tables,
        practice,
        busy,
        setBusy,
        onCorrect,
      }}
    />
  );
}
function LoadedNavigator({
  scope,
  questions,
  engine,
  tables,
  practice,
  busy,
  setBusy,
  onCorrect,
}: Parameters<typeof QuestionNavigator>[0]) {
  const [index, updateIndex] = useState(() =>
    Math.max(
      0,
      questions.findIndex((q) => q.id === practice.store.positions[scope]),
    ),
  );
  function setIndex(next: number) {
    updateIndex(next);
    practice.visit(scope, questions[next].id);
  }
  const question = questions[index];
  const solved = questions.filter(
    (item) => practice.store.questions[item.id]?.solved,
  ).length;
  return (
    <div className="practice-workspace">
      <div className="practice-progress">
        <div>
          <strong>
            Question {index + 1} of {questions.length}
          </strong>
          <span>{solved} solved · take this at your own pace</span>
        </div>
        <div className="question-dots" aria-label="Choose a practice question">
          {questions.map((item, i) => (
            <button
              key={item.id}
              disabled={busy}
              onClick={() => setIndex(i)}
              aria-label={`Question ${i + 1}: ${item.title}${practice.store.questions[item.id]?.solved ? ", solved" : ""}`}
              aria-current={index === i ? "step" : undefined}
            >
              {practice.store.questions[item.id]?.solved ? (
                <Check size={13} />
              ) : (
                i + 1
              )}
            </button>
          ))}
        </div>
      </div>
      {practice.loaded ? (
        <PracticeQuestion
          key={question.id}
          scope={scope}
          question={question}
          engine={engine}
          tables={tables[question.dataset] ?? []}
          practice={practice}
          busy={busy}
          setBusy={setBusy}
          onCorrect={onCorrect}
        />
      ) : (
        <p className="practice-loading">Finding your saved little ideas…</p>
      )}
      {questions.length > 1 && (
        <div className="question-navigation">
          <button
            className="button secondary"
            disabled={index === 0 || busy}
            onClick={() => setIndex(index - 1)}
          >
            <ArrowLeft size={15} />
            Previous question
          </button>
          <span>You can skip a question and come back.</span>
          <button
            className="button secondary"
            disabled={index === questions.length - 1 || busy}
            onClick={() => setIndex(index + 1)}
          >
            Next question
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
