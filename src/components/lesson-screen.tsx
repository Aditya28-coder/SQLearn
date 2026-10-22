"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Coffee,
  Heart,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { Lesson } from "@/data/lesson-types";
import {
  allLessons,
  lessonsForLevel,
  challenges,
  challengeSlug,
  reviewGroups,
  reviewLevelForQuestion,
} from "@/data/course";
import { datasets, type DatasetId } from "@/data/datasets";
import { milestones } from "@/data/compliments";
import { useDatabase } from "@/lib/use-database";
import { usePractice } from "@/lib/use-practice";
import type { Table } from "@/lib/database-types";
import { usePreferences } from "./providers";
import { LessonDiagram } from "./lesson-diagram";
import { LessonExample } from "./lesson-example";
import { QuestionNavigator } from "./question-navigator";
import { GlossaryText } from "./glossary-text";

function useLessonWorkspace() {
  const engine = useDatabase();
  const practice = usePractice();
  const [busy, setBusy] = useState(false);
  const [tables, setTables] = useState<Partial<Record<DatasetId, Table[]>>>({});
  useEffect(() => {
    if (!engine.ready) return;
    let active = true;
    void Promise.all(
      datasets.map(async (dataset) => {
        const response = await engine.getSchema(dataset.id);
        return [dataset.id, response.tables ?? []] as const;
      }),
    )
      .then((entries) => {
        if (active) setTables(Object.fromEntries(entries));
      })
      .catch(() => {
        /* Schema completion is optional; query errors still explain missing columns. */
      });
    return () => {
      active = false;
    };
  }, [engine.ready, engine.getSchema]);
  return { engine, practice, busy, setBusy, tables };
}

function DatabaseNotice({
  workspace,
}: {
  workspace: ReturnType<typeof useLessonWorkspace>;
}) {
  const { engine, busy, setBusy } = workspace;
  if (engine.startupError)
    return (
      <div className="engine-error" role="alert">
        <div>
          <h2>Let’s give your database a fresh start.</h2>
          <p>{engine.startupError}</p>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            setBusy(false);
            engine.restart();
          }}
        >
          <RefreshCw size={15} />
          Restart database
        </button>
      </div>
    );
  return (
    <div className="lesson-engine">
      <span
        className={`engine-status ${engine.ready ? "ready" : ""}`}
        role="status"
      >
        <span />
        {engine.ready
          ? "Your practice database is ready"
          : "Waking up your little Postgres…"}
      </span>
      {busy && (
        <button
          className="text-link"
          onClick={() => {
            engine.restart();
            setBusy(false);
          }}
        >
          Stop query & restore sample data
        </button>
      )}
    </div>
  );
}

export function LessonScreen({ lesson }: { lesson: Lesson }) {
  const workspace = useLessonWorkspace();
  const { name } = usePreferences();
  const level = lesson.level ?? 1;
  const lessons = lessonsForLevel(level);
  const index = lessons.findIndex((item) => item.slug === lesson.slug);
  const next = lessons[index + 1];
  const [message, setMessage] = useState("");
  const completed = workspace.practice.store.completedLessons.includes(
    lesson.slug,
  );
  const { loaded, visit } = workspace.practice;
  useEffect(() => {
    if (loaded) visit(lesson.slug);
  }, [loaded, visit, lesson.slug]);
  return (
    <div className="page-content lesson-page">
      <Link href={`/path/#level-${level}`} className="lesson-back">
        <ArrowLeft size={14} />
        Back to your learning path
      </Link>
      <header className="lesson-header">
        <h1>{lesson.title}</h1>
        <p>{lesson.description}</p>
        <div className="lesson-meta">
          <span>
            <BookOpen size={14} />
            Level {level} · Lesson {index + 1} of {lessons.length}
          </span>
          <span>
            <Clock3 size={14} />
            {lesson.minutes}-minute read
          </span>
          <span>{lesson.questions.length} little practice questions</span>
        </div>
      </header>
      <nav className="lesson-local-nav" aria-label="On this lesson">
        <a href="#idea">The idea</a>
        <a href="#examples">Try some SQL</a>
        <a href="#practice">Your turn</a>
        <a href="#recap">A little recap</a>
      </nav>
      <section id="idea" className="lesson-section">
        <div className="lesson-section-heading">
          <span className="section-glyph">
            <BookOpen size={18} />
          </span>
          <h2>What is this?</h2>
        </div>
        <div className="lesson-intro-grid">
          <p className="lesson-concept">
            <GlossaryText text={lesson.concept} />
          </p>
          <aside className="analogy-note">
            <Coffee size={19} />
            <div>
              <h3>Think of it this way</h3>
              <p>
                <GlossaryText text={lesson.analogy} />
              </p>
            </div>
          </aside>
        </div>
        <LessonDiagram kind={lesson.diagram} slug={lesson.slug} />
        <div className="concept-notes">
          {lesson.notes.map((note) => (
            <article key={note.title}>
              <h3>{note.title}</h3>
              <div>
                <p>
                  <GlossaryText text={note.body} />
                </p>
                {note.sql && (
                  <pre>
                    <code>{note.sql}</code>
                  </pre>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="examples" className="lesson-section">
        <div className="lesson-section-heading">
          <h2>A little SQL, in action</h2>
          <span>Edit, run, wonder, repeat.</span>
        </div>
        <DatabaseNotice workspace={workspace} />
        <div className="lesson-examples">
          {lesson.examples.map((example) => (
            <LessonExample
              key={example.title}
              example={example}
              engine={workspace.engine}
              busy={workspace.busy}
              setBusy={workspace.setBusy}
              tables={workspace.tables[example.dataset] ?? []}
            />
          ))}
        </div>
      </section>
      <div className="lesson-context-grid">
        <section className="mistakes-box">
          <h2>A few easy-to-make mistakes</h2>
          <ul>
            {lesson.mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
          <p>Noticing one is a little win, too.</p>
        </section>
        <section className="engineering-box">
          <h2>Where this shows up at work</h2>
          <p>
            <GlossaryText text={lesson.engineering} />
          </p>
          <span>Small ideas. Very real uses.</span>
        </section>
      </div>
      <section id="practice" className="lesson-section">
        <div className="lesson-section-heading">
          <h2>Your turn, at your pace</h2>
          <span>Hints are part of learning.</span>
        </div>
        <p className="practice-intro">
          A few small questions, from easy to a little more adventurous. There’s
          no timer, and there’s always a hint.
        </p>
        <QuestionNavigator
          scope={lesson.slug}
          questions={lesson.questions}
          engine={workspace.engine}
          practice={workspace.practice}
          tables={workspace.tables}
          busy={workspace.busy}
          setBusy={workspace.setBusy}
        />
      </section>
      <section id="recap" className="lesson-recap">
        <div>
          <Sparkles size={21} />
          <h2>Your little takeaways</h2>
        </div>
        <ul>
          {lesson.recap.map((item) => (
            <li key={item}>
              <Check size={15} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      {message && (
        <div className="lesson-milestone" role="status">
          <Heart size={25} />
          <p>{message}</p>
        </div>
      )}
      <footer className="lesson-next">
        <div>
          <h2>
            {completed
              ? "A lovely little chapter, read."
              : "Let that little idea settle."}
          </h2>
          <p>
            Reading and practice are separate. Come back to any question
            whenever you like.
          </p>
          <button
            className="finish-reading"
            disabled={!workspace.practice.loaded || completed}
            onClick={() => {
              workspace.practice.finishLesson(lesson.slug);
              setMessage(milestones.lesson(name, lesson.title));
            }}
          >
            <Check size={14} />
            {completed ? "Reading completed" : "I’ve finished reading"}
          </button>
        </div>
        <Link
          className="button primary"
          href={
            next ? `/learn/${next.slug}/` : `/learn/${challengeSlug(level)}/`
          }
        >
          {next ? "Next lesson" : `Try the Level ${level} challenge`}
          <ArrowRight size={17} />
        </Link>
      </footer>
    </div>
  );
}

export function PracticeCollection({
  mode,
  level = 1,
}: {
  mode: "challenge" | "review";
  level?: number;
}) {
  const workspace = useLessonWorkspace();
  const { name } = usePreferences();
  const [message, setMessage] = useState("");
  const isChallenge = mode === "challenge";
  const [reviewLevel, setReviewLevel] = useState(() =>
    reviewLevelForQuestion(workspace.practice.store.positions.review),
  );
  const questions = isChallenge
    ? [challenges[level]]
    : reviewGroups[reviewLevel];
  const nextLesson = allLessons.find((lesson) => lesson.level === level + 1);
  const { loaded, visit } = workspace.practice;
  useEffect(() => {
    if (loaded) {
      if (!isChallenge) {
        const requested = Number(
          new URLSearchParams(window.location.search).get("level"),
        );
        const selected = [1, 2, 3, 4, 5].includes(requested)
          ? requested
          : reviewLevelForQuestion(workspace.practice.store.positions.review);
        setReviewLevel(selected);
        const current = workspace.practice.store.positions.review;
        visit(
          "review",
          reviewGroups[selected].some((q) => q.id === current)
            ? current
            : reviewGroups[selected][0].id,
        );
      } else visit(challengeSlug(level));
    }
  }, [loaded, visit, isChallenge, level]);
  function celebrate() {
    const allSolved = lessonsForLevel(level).every((lesson) =>
      lesson.questions.every(
        (question) => workspace.practice.store.questions[question.id]?.solved,
      ),
    );
    if (isChallenge)
      setMessage(
        allSolved ? milestones.level(name, level) : milestones.challenge(name),
      );
  }
  return (
    <div className="page-content lesson-page collection-page">
      <Link
        href={`/path/#level-${isChallenge ? level : reviewLevel}`}
        className="lesson-back"
      >
        <ArrowLeft size={14} />
        Back to your learning path
      </Link>
      <header className="lesson-header">
        <h1>
          {isChallenge
            ? "A few ideas, beautifully together."
            : "A little refresh for your SQL."}
        </h1>
        <p>
          {isChallenge
            ? `Your Level ${level} challenge: ${challenges[level].title}.`
            : "Familiar questions, one from each lesson. Choose a level and let its ideas come back gently."}
        </p>
        <div className="lesson-meta">
          <span>
            <BookOpen size={14} />
            Level {isChallenge ? level : reviewLevel} ·{" "}
            {isChallenge ? "Final challenge" : "Mixed review"}
          </span>
          <span>No timer. Every hint is welcome.</span>
        </div>
      </header>
      <div className="collection-note">
        <Heart size={20} />
        <p>
          {isChallenge
            ? "Bring this level's ideas together in one result. If a step feels hazy, the lessons and hints are here whenever you need them."
            : "Try remembering before opening a hint. A solution you’ve seen before is still worth reasoning through again. This review is always available."}
        </p>
      </div>
      {!isChallenge && (
        <div className="review-level-picker">
          <label htmlFor="review-level">Which ideas shall we revisit?</label>
          <select
            id="review-level"
            value={reviewLevel}
            disabled={workspace.busy}
            onChange={(event) => {
              const selected = Number(event.target.value);
              setReviewLevel(selected);
              window.history.replaceState(null, "", `?level=${selected}`);
              workspace.practice.visit("review", reviewGroups[selected][0].id);
            }}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                Level {value} · {reviewGroups[value].length} little questions
              </option>
            ))}
          </select>
          <p>
            These reuse your original questions. New checks update accuracy;
            solved questions earn solve XP once.
          </p>
        </div>
      )}
      <DatabaseNotice workspace={workspace} />
      <QuestionNavigator
        key={isChallenge ? level : reviewLevel}
        scope={isChallenge ? challengeSlug(level) : "review"}
        questions={questions}
        engine={workspace.engine}
        practice={workspace.practice}
        tables={workspace.tables}
        busy={workspace.busy}
        setBusy={workspace.setBusy}
        onCorrect={celebrate}
      />
      {message && (
        <div className="lesson-milestone" role="status">
          <Heart size={26} />
          <p>{message}</p>
        </div>
      )}
      <footer className="lesson-next">
        <div>
          <h2>
            {isChallenge
              ? "There’s room to revisit."
              : "A little practice stays with you."}
          </h2>
          <p>
            Your lessons and review questions stay open. A little confidence
            grows with every thoughtful return.
          </p>
        </div>
        <Link
          href={
            isChallenge && nextLesson
              ? `/learn/${nextLesson.slug}/`
              : isChallenge
                ? "/learn/review/"
                : "/path/"
          }
          className="button primary"
        >
          {isChallenge
            ? nextLesson
              ? "Next lesson"
              : "Try a little mixed review"
            : "Back to your learning path"}
          <ArrowRight size={17} />
        </Link>
      </footer>
    </div>
  );
}
