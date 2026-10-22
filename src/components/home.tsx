"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Heart,
  Leaf,
  LockKeyhole,
  Sparkles,
  Sprout,
  Trophy,
} from "lucide-react";
import { usePreferences } from "./providers";
import { TableGarden } from "./table-garden";
import { usePractice } from "@/lib/use-practice";
import { getProgress } from "@/lib/progress";
import { localDay } from "@/lib/practice";
import { levels } from "@/data/curriculum";
import { milestones } from "@/data/compliments";
import { practiceQuestionCount } from "@/data/course";

export function Home() {
  const { name } = usePreferences();
  const practice = usePractice();
  const [topicLevel, setTopicLevel] = useState(1);
  const keepsakes = useRef<HTMLDetailsElement>(null);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const refresh = () => setNow(new Date());
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const progress = getProgress(practice.store, now ?? new Date(0));
  const ready = practice.loaded && now !== null;
  const badgeCount = progress.badges.filter((badge) => badge.unlocked).length;
  const days = ready
    ? Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setDate(date.getDate() - 6 + index);
        return {
          key: localDay(date),
          label: date.toLocaleDateString(undefined, { weekday: "short" }),
          full: date.toLocaleDateString(undefined, { dateStyle: "full" }),
          active: practice.store.activeDays.includes(localDay(date)),
        };
      })
    : [];
  return (
    <div className="page-content home-page progress-home" aria-busy={!ready}>
      <div className="page-heading">
        <div>
          <h1>Hi {name}, a little more confidence.</h1>
          <p>Your own pace. Every small discovery counts.</p>
        </div>
        <span className="gentle-tag">
          <Leaf size={15} /> Grow at your own pace
        </span>
      </div>
      <section
        className="welcome-card progress-welcome"
        aria-labelledby="welcome-title"
      >
        <div className="welcome-copy">
          <h2 id="welcome-title">
            {ready && progress.hasStarted
              ? "Pick up your little thread."
              : "Small beginnings. Lovely possibilities."}
          </h2>
          <p>
            {ready ? progress.resumeTitle : "Finding your saved place…"}
            {ready && progress.questionIndex >= 0
              ? ` · Question ${progress.questionIndex + 1}`
              : ""}
          </p>
          <Link href={progress.resumeHref} className="button primary">
            {ready && progress.hasStarted
              ? "Continue where you left off"
              : "Start your first lesson"}
            <ArrowRight size={17} />
          </Link>
          <div className="level-progress">
            <div>
              <span>Your whole SQL journey · 5 levels</span>
              <strong>{ready ? progress.percent : 0}%</strong>
            </div>
            <progress
              aria-label="Whole course completion"
              value={ready ? progress.completedSteps : 0}
              max={progress.totalSteps}
            />
            <p>
              {ready ? progress.read : 0}/{progress.lessonCount} lessons read{" "}
              <span>·</span>{" "}
              {ready ? progress.solved + progress.challengeCount : 0}/
              {progress.questionCount} questions solved
            </p>
          </div>
        </div>
        <TableGarden />
      </section>
      <dl className="progress-figures" aria-label="Your learning so far">
        <div>
          <dt>A little experience</dt>
          <dd>
            {ready ? progress.xp : "—"}
            <span> XP</span>
          </dd>
          <p>Each first solve and finished read.</p>
        </div>
        <div>
          <dt>Practice accuracy</dt>
          <dd>
            {ready && progress.accuracy !== null
              ? `${progress.accuracy}%`
              : "—"}
          </dd>
          <p>
            {ready && progress.total
              ? `${progress.correct} correct / ${progress.total} checks`
              : "Your first check starts the picture."}
          </p>
        </div>
        <div>
          <dt>Your gentle streak</dt>
          <dd>
            {ready ? progress.streak.current : "—"}
            <span> {progress.streak.current === 1 ? "day" : "days"}</span>
          </dd>
          <p>
            Best: {ready ? progress.streak.best : 0}{" "}
            {progress.streak.best === 1 ? "day" : "days"}. Rest days are
            welcome.
          </p>
        </div>
        <div>
          <dt>Little keepsakes</dt>
          <dd>
            {ready ? badgeCount : "—"}
            <span> / {progress.badges.length} badges</span>
          </dd>
          <p>
            <a
              href="#keepsakes"
              onClick={() => {
                if (keepsakes.current) keepsakes.current.open = true;
              }}
            >
              See what you’ve grown <ArrowUpRight size={12} />
            </a>
          </p>
        </div>
      </dl>
      {!practice.storageAvailable && (
        <p className="progress-storage" role="status">
          Browser storage is unavailable. Your progress will last for this
          visit.
        </p>
      )}
      <div className="progress-workspace">
        <section className="topic-progress" aria-labelledby="topics-title">
          <div className="section-heading">
            <div>
              <h2 id="topics-title">Your ideas, taking root</h2>
              <p>Reading is a start. Practice helps it stick.</p>
            </div>
            <select
              className="dashboard-level"
              aria-label="Show progress for level"
              value={topicLevel}
              onChange={(event) => setTopicLevel(Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>
          <div
            className="topic-progress-scroll"
            role="region"
            tabIndex={0}
            aria-label={`Level ${topicLevel} progress by topic`}
          >
            <table>
              <caption className="sr-only">
                Level {topicLevel} reading, solved questions and accuracy by
                topic
              </caption>
              <thead>
                <tr>
                  <th scope="col">Topic</th>
                  <th scope="col">Read</th>
                  <th scope="col">Solved</th>
                  <th scope="col">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {progress.topics
                  .filter((topic) => topic.lesson.level === topicLevel)
                  .map((topic, index) => (
                    <tr key={topic.lesson.slug}>
                      <th scope="row">
                        <Link href={`/learn/${topic.lesson.slug}/`}>
                          <span className="topic-index">{index + 1}</span>
                          {topic.lesson.shortTitle}
                          <ArrowUpRight size={13} />
                        </Link>
                      </th>
                      <td>
                        {topic.read ? (
                          <span className="read-complete">
                            <Check size={15} />
                            <span className="sr-only">Reading completed</span>
                          </span>
                        ) : (
                          <span aria-label="Not read yet">—</span>
                        )}
                      </td>
                      <td>
                        {topic.solved}
                        <span className="stat-denominator">
                          /{topic.lesson.questions.length}
                        </span>
                      </td>
                      <td>
                        {topic.accuracy === null ? (
                          <span aria-label="No recorded checks">—</span>
                        ) : (
                          <>
                            <strong>{topic.accuracy}%</strong>
                            <small>
                              {topic.correct}/{topic.total} checks
                            </small>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="progress-method">
            Accuracy counts every checked answer, including retries and hints.{" "}
            {progress.supported > 0
              ? `${progress.supported} of your ${progress.total} checks used a hint or a revealed solution. `
              : ""}
            Saved solves from before tracking began stay solved; their accuracy
            is unknown.
          </p>
          <Link
            className="text-link progress-review-link"
            href="/learn/review/"
          >
            A little mixed review <ArrowRight size={15} />
          </Link>
        </section>
        <div className="progress-side">
          <section className="revisit-card" aria-labelledby="revisit-title">
            <div className="section-heading">
              <h2 id="revisit-title">Topics to revisit</h2>
              <Sprout size={20} />
            </div>
            {progress.revisit.length ? (
              <ul>
                {progress.revisit.map((topic) => (
                  <li key={topic.lesson.slug}>
                    <Link href={`/learn/${topic.lesson.slug}/#practice`}>
                      <strong>{topic.lesson.shortTitle}</strong>
                      <span>
                        {topic.correct < topic.total
                          ? `${topic.correct} of ${topic.total} checks matched. Try another little query.`
                          : topic.supported > 0
                            ? "A little help supported this idea. Let it settle with another try."
                            : "A week since your last correct check. A gentle refresh?"}
                      </span>
                      <ArrowUpRight size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="revisit-empty">
                <p>
                  {progress.total
                    ? "Your checked ideas are looking comfortable."
                    : "A few little queries will show us what needs another look."}
                </p>
                <span>
                  {progress.total
                    ? "Older ideas will appear here for a gentle refresh, too."
                    : "No topics to revisit yet. There’s no rush to fill this space."}
                </span>
              </div>
            )}
          </section>
          <section className="study-week" aria-labelledby="week-title">
            <div className="section-heading">
              <h2 id="week-title">A week of little moments</h2>
              <Leaf size={18} />
            </div>
            <ol aria-label="Study activity over the last seven days">
              {days.map((day) => (
                <li
                  key={day.key}
                  aria-label={`${day.full}: ${day.active ? "studied" : "no study recorded"}`}
                >
                  <span
                    className={day.active ? "day-mark studied" : "day-mark"}
                  >
                    {day.active ? <Check size={15} /> : <span />}
                  </span>
                  <span>{day.label}</span>
                </li>
              ))}
            </ol>
            <p>
              A finished read or an answer check marks a day. Opening a page
              doesn’t. Days follow your device’s local calendar.
            </p>
          </section>
          <details className="keepsakes" id="keepsakes" ref={keepsakes}>
            <summary>
              <span>
                <Trophy size={18} />
                <strong>Your little keepsakes</strong>
              </span>
              <span>
                {badgeCount} earned <ArrowRight size={14} />
              </span>
            </summary>
            <div className="badge-list">
              {progress.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={badge.unlocked ? "badge earned" : "badge"}
                >
                  {badge.unlocked ? (
                    <Sparkles size={19} />
                  ) : (
                    <LockKeyhole size={17} />
                  )}
                  <div>
                    <h3>{badge.title}</h3>
                    <p>{badge.description}</p>
                    <span>
                      {badge.unlocked
                        ? "Earned with care"
                        : badge.future
                          ? "Coming with a future level"
                          : "A little possibility"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
      {progress.levelComplete && (
        <div className="lesson-milestone">
          <Heart size={26} />
          <p>{milestones.level(name)}</p>
        </div>
      )}
      {progress.courseComplete && (
        <div className="lesson-milestone">
          <Heart size={26} />
          <p>{milestones.course(name)}</p>
        </div>
      )}
      {progress.streak.best >= 7 && (
        <div className="lesson-milestone">
          <Heart size={26} />
          <p>{milestones.week(name)}</p>
        </div>
      )}
      <section className="dashboard-roadmap" aria-labelledby="journey-title">
        <div className="section-heading">
          <div>
            <h2 id="journey-title">Room to grow</h2>
            <p>One friendly level at a time.</p>
          </div>
          <Link href="/path/" className="text-link">
            See the full path <ArrowUpRight size={15} />
          </Link>
        </div>
        <ol>
          {levels.map((level) => (
            <li key={level.id}>
              <Link href={`/path/#level-${level.id}`}>
                <span className={`journey-node ${level.color}`}>
                  {progress.levelStats[level.id - 1].complete ? (
                    <Check size={17} />
                  ) : (
                    level.id
                  )}
                </span>
                <div>
                  <h3>{level.name}</h3>
                  <p>
                    {progress.levelStats[level.id - 1].complete
                      ? "A lovely level, completed"
                      : `${progress.levelStats[level.id - 1].solved + Number(progress.levelStats[level.id - 1].challenge)}/${progress.levelStats[level.id - 1].questionCount + 1} questions solved`}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <details className="progress-rules">
        <summary>How your notebook counts the little things</summary>
        <p>
          Each of the {practiceQuestionCount} lesson questions earns 10 XP on
          its first correct answer. Each level challenge earns 25 XP, each
          finished lesson read earns 20 XP, and completing a level's
          mixed-review set earns 30 XP once. Hints are welcome and earn the same
          XP. Rechecking a solved question changes accuracy, but adds no solve
          XP.
        </p>
        <p>
          A completed level combines its finished reads, solved lesson questions
          and challenge. The full journey has {progress.lessonCount} lessons and{" "}
          {progress.questionCount} unique questions. A streak is consecutive
          study days; yesterday’s streak stays current while today is still
          open. Your best streak and earned badges stay with you after a break.
          JOIN Master and Window Wizard unlock through their own lesson's
          practice.
        </p>
        <p>
          Your name, drafts and progress stay in this browser. You can start a
          fresh notebook in <Link href="/settings/">Settings</Link>.
        </p>
      </details>
    </div>
  );
}
