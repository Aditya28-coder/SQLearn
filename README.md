# SQLearn

A warm SQL learning nook for Trapti, from a first table to everyday database engineering. Built with Next.js App Router, TypeScript, Tailwind, CodeMirror and real PostgreSQL in the browser through PGlite. The whole site exports as static files: no backend, account or database service is required.

## What is included

- Five complete levels and 33 short lessons, each with plain-English explanations, an analogy, notes, an interactive SVG diagram, two editable examples, mistakes, an engineering scenario, practice and a recap.
- 186 lesson questions and five final challenges: 191 distinct questions, plus five mixed-review sets reusing 33 original questions. The Basics question bank includes writing, fixing, prediction and fill-in-the-blank tasks; later lessons include real write/schema exercises and conceptual multiple-choice questions.
- All curriculum topics from the brief: selection, NULLs and types; aggregates, grouping, CASE, functions and writes; relationships, six join types, set operations and subqueries; recursive CTEs, windows/frames, JSONB, reporting patterns and pivots; schema design, normalization, indexes, plans, optimization, views, transactions, triggers, injection prevention, migrations and mini projects.
- Interactive row/column/key highlights, execution pipeline, six-mode join matching and membership diagrams, grouping buckets, sliding windows, nested/CTE/recursive flows, relationship maps for all three datasets, a B-tree lookup illustration, normalization comparisons and simulated two-session transaction timelines.
- A full-course dashboard with saved lesson/question resume, separate reading and solved progress, per-topic check accuracy, revisit suggestions, local-calendar streaks, XP and 13 earnable badges. Existing Basics notebooks retain their answers and earned work.
- A searchable cheat sheet covering every lesson, SQL copying, a searchable glossary with 60+ definitions, and inline glossary help that supports mouse, keyboard and touch. Tooltips dismiss with Escape.
- Three resettable fictional datasets (campus, shop, delivery), a free playground with a schema browser, completion, Ctrl/Cmd+Enter, result tables, CSV download and friendly Postgres errors.
- Light/dark themes, a personalized name, 64 shuffled compliments and larger lesson/level/week/course messages in one editable file. Motion respects reduced-motion preferences.

## Run locally

Use Node.js 22 or newer and npm:

```sh
npm install
npm run dev
```

Open the Local URL printed by Next.js, normally http://localhost:3000. Fonts and PGlite assets are bundled locally. `postinstall` and production builds copy the installed PGlite browser files into `public/pglite/`; this generated directory is ignored by Git. If install scripts are disabled, run `node scripts/copy-pglite.mjs`.

```sh
npm run typecheck
npm test
npm run build
node scripts/check-export.mjs
npm start
```

`npm start` serves the static `out/` directory on loopback port 3000. It does not start a Next.js application server. If another application owns that port, set the `PORT` environment variable to an available port. The Webpack build is intentional for predictable static output.

The test suite runs actual PostgreSQL, including disposable databases for writes, so a full run can take several minutes. It checks every answer, every runnable example (including repeated write examples), grading semantics, write isolation, parameters, schema/object checks, progress migration, rewards, calendar boundaries, reference search and glossary/diagram behavior. The export checker scans generated HTML for missing local links, anchors and referenced assets.

## Deploy on Vercel

Import the repository into Vercel, use the Next.js preset, and run `npm run build`. Vercel's Next.js adapter must use `.next` as its Output Directory so it can read the build manifests; it detects `output: "export"` and handles the exported static assets automatically. The included `vercel.json` explicitly sets `.next`, overriding an old `out` project setting. No environment variables or external database are needed. This project is prepared for deployment; local development does not publish it automatically.

If a deployment fails with `NEXT_NO_ROUTES_MANIFEST` and a path ending in `out/routes-manifest.json`, deploy the latest commit and check Settings → Build and Deployment: Framework Preset should be Next.js, Build Command should be `npm run build`, and Output Directory should be the Next.js default (`.next`), not `out`. The `out/` directory is the portable export used by the local static server and generic static hosts, not the build-manifest directory used by Vercel's Next.js adapter.

Any static host supporting directory indexes can serve `out/`. Serve `.wasm` as `application/wasm` and `.js`/`.mjs` as JavaScript. Do not rewrite missing asset requests to HTML. Host at the domain root: worker and WASM paths are root-relative. `trailingSlash: true` produces an `index.html` per route.

## How the database and grading work

SQL runs in a dedicated module Web Worker. The playground database is in memory: reloads restore sample data. Its committed edits persist while that playground remains open; switching datasets rolls back an open transaction. Resetting a dataset restores its schema and can cascade to dependent cross-schema objects. It preserves SQL drafts.

Read practice uses a separate sample database, one statement in a read-only transaction, and an unconditional rollback. Answers and reference results are compared as bags of complete positional rows: duplicates and row relationships remain meaningful; a single column permutation is allowed unless column names are part of the exercise. Ordering is checked where requested. Exact numeric normalization, NULLs, JSON objects, dates and duplicate column labels have focused tests. Raw SQL strings are not compared.

Write and schema questions declare `exercise: { setup, verify }`. Each answer/reference execution gets a fresh disposable PGlite database, including when a learner uses COMMIT or changes table structure. The setup is prepared first; the answer executes; then the verification query observes rows or schema metadata. The database closes in `finally`. Later questions and normal datasets stay uncontaminated. Checks observe results/final state, so they cannot prove that a particular sequence of SQL was executed when another sequence has the same observable effect. Schema checks include primary-key presence, composite-index order and normal/materialized view kind where those are the task.

Write demonstrations also start fresh on every run. Their setup is a separate call before the editable script, so a demonstration's ROLLBACK cannot remove its own starting workspace. Normal read examples and the free playground remain editable, resettable sandboxes.

Questions with `parameters` bind values through PGlite's query API; `$1`, `$2`, etc. stay in the SQL. The injection lessons explain why values cannot substitute identifiers, and why backend authorization and least privilege still matter.

Ordinary queries have a 15-second limit; initial startup, disposable write checks and fresh demonstrations allow 60 seconds. Read practice allows 30 seconds, including lazy initialization. Stop/timeout terminates the worker and offers a fresh start, restoring all sample databases. Results display at most 200 rows; grading compares complete results before truncation. CSV exports the displayed rows.

The two-session transaction/locking diagrams are explicitly teaching simulations: the playground has one connection. EXPLAIN examples run in real Postgres, but tiny WASM sample timings are not production performance measurements.

## Progress and privacy

Preferences use `sqlearn:preferences`, free-playground drafts use `sqlearn:drafts`, and the notebook uses the retained key `sqlearn:practice:v1`. The notebook document is version 2. Older notebooks migrate in place, preserving drafts, hints, solution reveals, solved marks, attempt counts and finished reading. Older attempts lack outcomes/timestamps, so no historical accuracy or study dates are invented.

- A first correct lesson question earns 10 XP; each first challenge earns 25 XP; each finished read earns 20 XP; each completed level review set earns 30 XP once. Hints earn the same XP. Rechecking changes accuracy but cannot duplicate solve XP.
- Accuracy is correct checks / recorded checks, including retries. Supported checks are disclosed. Missing history prints as missing, not zero accuracy. Worker failures do not count as attempts; evaluated SQL errors do.
- A finished read or graded check marks one device-local calendar day. Opening pages and typing do not. Yesterday's streak remains current until today ends; best streaks and earned badges survive breaks.
- Topics to revisit use observed low accuracy, supported practice and successful topics last checked at least seven calendar days ago. Untouched topics are not labeled weak.
- Level completion requires its finished reads, lesson solves and challenge. Course completion requires all five levels; review remains available afterwards. JOIN Master and Window Wizard depend on their actual lesson questions.

Data stays in that browser and origin; it is not synced across devices. Blocked/full storage produces a visible session-only notice. Settings includes a confirmed reset of practice/progress for all levels, keeping preferences and free-playground drafts. No analytics, account credentials or sample-query data are transmitted to a server.

## Personalize and author content

Change the default name in `src/lib/config.ts`, or use Settings for a browser-specific name. Edit the compliment bank and all milestone messages in `src/data/compliments.ts`.

```text
src/app/                       Static App Router pages and styles
src/data/course.ts             Ordered course, challenge and review manifest
src/data/curriculum.ts         Five-level topic descriptions
src/data/level-one*.ts         Original Basics lessons and question bank
src/data/level-two.ts          Core queries and writes
src/data/level-three.ts        Relationships, joins, sets and subqueries
src/data/level-four.ts         Advanced queries and reporting patterns
src/data/level-five-*.ts       Design, engineering and mini projects
src/data/lesson-builder.ts     Typed authoring helpers for later lessons
src/data/lesson-types.ts       Lesson/question/example contracts
src/data/*diagrams.ts          Diagram fixtures, relationships and scenes
src/data/glossary.ts           Editable term definitions
src/data/datasets.ts           Dataset metadata and seed SQL
src/components/                Shared UI, diagrams, editor and results
src/lib/practice.ts            Notebook parsing/migration and check records
src/lib/use-practice.tsx       Shared local progress provider
src/lib/progress.ts            Whole-course statistics and rewards
src/lib/reference.ts           Concept-specific search
src/lib/use-database.ts        Worker messaging, lifecycle and timeouts
public/database-worker.js      Browser Postgres execution
public/grading.mjs             Shared result and exercise evaluation
scripts/                      Asset copying, static serving and export checks
tests/                        Real Postgres and deterministic unit checks
```

To add a lesson, use a typed `Lesson` or `makeLesson` plan with a unique slug, complete teaching sections, two examples and 5–8 questions. Add it to the appropriate level list and keep the syllabus order aligned. Routes, navigation and numeric progress counts derive from the course manifest. Update badge copy if the course scope changes.

Questions need a stable unique ID, dataset, prompt, solution/reference SQL, explanation and two hints. `makeLesson` supplies conventional IDs from slug + position: append new questions, or set an explicit stable `options.id` before inserting/reordering so old saved work does not point at another exercise. Prediction questions supply distinct SQL outputs and a correct choice; blanks supply `template` with `{{blank}}`. Set `ordered` or `checkColumnNames` when the requested result needs them. A write exercise supplies a deterministic setup and verification query; use booleans instead of comparing a live timestamp exactly.

## Validation limits

Desktop, tablet and phone-width layouts are checked in the connected browser, including dark/light themes, keyboard interaction and page overflow. Safe-area, input-size, touch-target and reduced-motion rules are included. Physical iOS/Android keyboard, browser chrome and safe-area behavior still need hardware verification; desktop viewport testing cannot reproduce those fully.

All sample people, shops and prices are fictional. Fonts are local Nunito Variable; diagrams and the table-and-sprout illustration are code-native SVG. No external photographs or generated raster assets are required.
