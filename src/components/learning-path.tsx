"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Flag } from "lucide-react";
import { levels } from "@/data/curriculum";
import {
  allLessons,
  lessonsForLevel,
  challengeSlug,
  challenges,
  practiceQuestionCount,
} from "@/data/course";
import { usePractice } from "@/lib/use-practice";
export function LearningPath() {
  const practice = usePractice();
  return (
    <div className="page-content path-page">
      <div className="page-heading">
        <div>
          <h1>Your own path to SQL.</h1>
          <p>From a first little table to thoughtful, everyday engineering.</p>
        </div>
        <span className="gentle-tag">
          <Flag size={15} />
          {levels.length} levels · {allLessons.length} lessons
        </span>
      </div>
      <div className="stage-notice">
        <BookOpen size={20} />
        <p>
          <strong>The whole path is yours.</strong> {allLessons.length} short
          lessons, {practiceQuestionCount} practice questions, five challenges
          and review sets. Every lesson stays open; follow your curiosity.
        </p>
        <Link href="/learn/meet-your-database/">
          Start with the basics <ArrowRight size={15} />
        </Link>
      </div>
      <nav className="path-jump" aria-label="Choose a level">
        {levels.map((level) => (
          <a key={level.id} href={`#level-${level.id}`}>
            Level {level.id}
          </a>
        ))}
      </nav>
      <div className="path-levels">
        {levels.map((level) => (
          <section
            id={`level-${level.id}`}
            className="path-level"
            key={level.id}
          >
            <div className="path-level-heading">
              <span className={`journey-node ${level.color}`}>{level.id}</span>
              <div>
                <p className="level-caption">
                  Level {level.id} · {level.note}
                </p>
                <h2>{level.name}</h2>
                <p>{level.description}</p>
              </div>
            </div>
            <div className="topic-list">
              {lessonsForLevel(level.id).map((lesson, index) => {
                const solved = lesson.questions.filter(
                  (q) => practice.store.questions[q.id]?.solved,
                ).length;
                const read = practice.store.completedLessons.includes(
                  lesson.slug,
                );
                return (
                  <Link
                    key={lesson.slug}
                    href={`/learn/${lesson.slug}/`}
                    className="topic-row available-topic"
                  >
                    <span className="topic-number">{index + 1}</span>
                    <span>
                      <strong>{lesson.shortTitle}</strong>
                      <small className="path-topic-description">
                        {level.topics[index]}
                      </small>
                    </span>
                    <span className="topic-status">
                      {read && <Check size={12} />} {solved}/
                      {lesson.questions.length} solved{read ? " · read" : ""}
                      <ArrowRight size={12} />
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="path-practice-links">
              <Link href={`/learn/${challengeSlug(level.id)}/`}>
                {practice.store.questions[challenges[level.id].id]?.solved && (
                  <Check size={14} />
                )}
                Your Level {level.id} challenge <ArrowRight size={14} />
              </Link>
              <Link href={`/learn/review/?level=${level.id}`}>
                A little mixed review <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        ))}
      </div>
      <div className="next-card">
        <div>
          <BookOpen size={22} />
          <div>
            <h2>A familiar idea, one click away.</h2>
            <p>Keep the cheat sheet close while you practice.</p>
          </div>
        </div>
        <Link href="/cheat-sheet/" className="button primary">
          Open the cheat sheet <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}
