"use client";
import { useId, useState } from "react";
import type { Lesson } from "@/data/lesson-types";
import {
  joinModes,
  people,
  bookings,
  joinRows,
  joinCaptions,
  groupRows,
  pipelineStages,
  pipelineCaptions,
  pipelineResults,
  windowPrices,
  flowScenes,
  lessonFlows,
  models,
  transactionScenes,
  normalizationScenes,
  designScenes,
} from "@/data/advanced-diagrams";

function Controls({
  labels,
  value,
  set,
  label = "Explore the diagram",
}: {
  labels: string[];
  value: number;
  set: (value: number) => void;
  label?: string;
}) {
  return (
    <div className="diagram-controls" aria-label={label}>
      {labels.map((text, index) => (
        <button
          key={text}
          aria-pressed={value === index}
          onClick={() => set(index)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
function Box({
  x,
  y,
  w = 190,
  h = 45,
  text,
  active = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  text: string;
  active?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={9}
        className={active ? "scene-active" : "scene-box"}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        className="scene-text"
      >
        {text}
      </text>
    </g>
  );
}
export function AdvancedDiagram({
  kind,
  slug,
}: {
  kind: Lesson["diagram"];
  slug?: string;
}) {
  const vennClip = useId();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(0);
  let controls: string[] = [],
    caption = "",
    drawing: React.ReactNode = null;
  if (kind === "joins") {
    controls = joinModes;
    caption = joinCaptions[step];
    const rows = joinRows(step);
    drawing = (
      <div className="join-illustration">
        <svg viewBox="0 0 720 345" role="img" aria-label={caption}>
          <text x="35" y="24" className="scene-heading">
            {step === 5 ? "people AS a" : "guest list"}
          </text>
          <text x="480" y="24" className="scene-heading">
            {step === 5 ? "people AS b" : "booking list"}
          </text>
          <g className="join-links">
            {step === 5 ? (
              <path d="M225 71 C340 71 350 185 480 185" />
            ) : (
              people.flatMap((p, i) =>
                bookings.flatMap((b, j) =>
                  step === 4 || p.id === b.id ? (
                    <path
                      key={`${i}-${j}`}
                      d={`M225 ${71 + i * 57} C340 ${71 + i * 57} 350 ${71 + j * 57} 480 ${71 + j * 57}`}
                    />
                  ) : (
                    []
                  ),
                ),
              )
            )}
          </g>
          {people.map((p, i) => (
            <Box
              key={p.id}
              x={35}
              y={48 + i * 57}
              text={`${p.id} · ${p.name}${step === 5 ? ` · ${p.city}` : ""}`}
              active={step === 1 || step === 3 || step === 4 || i === 0}
            />
          ))}
          {(step === 5
            ? people.map((p) => ({ id: p.id, course: `${p.name} · ${p.city}` }))
            : bookings
          ).map((b, i) => (
            <Box
              key={i}
              x={480}
              y={48 + i * 57}
              text={`${b.id} · ${b.course}`}
              active={
                step === 2 ||
                step === 3 ||
                step === 4 ||
                (step === 5 ? i === 2 : i < 2)
              }
            />
          ))}
          <g transform="translate(303 223)">
            <defs>
              <clipPath id={vennClip}>
                <circle cx="40" cy="35" r="37" />
              </clipPath>
            </defs>
            <circle
              cx="40"
              cy="35"
              r="37"
              className={`venn-circle ${step === 1 || step === 3 ? "venn-on" : ""}`}
            />
            <circle
              cx="82"
              cy="35"
              r="37"
              className={`venn-circle ${step === 2 || step === 3 ? "venn-on" : ""}`}
            />
            {step === 0 && (
              <circle
                cx="82"
                cy="35"
                r="37"
                clipPath={`url(#${vennClip})`}
                className="venn-intersection"
              />
            )}
            <text x="61" y="40" textAnchor="middle" className="scene-text">
              {joinModes[step]}
            </text>
          </g>
          <text x="35" y="330" className="scene-muted">
            Illustrative lists. Venn circles show membership; matching lines
            show row multiplication.
          </text>
        </svg>
        <div className="diagram-output">
          <strong>
            {rows.length} result {rows.length === 1 ? "row" : "rows"}
          </strong>
          <table>
            <caption className="sr-only">Result of the selected join</caption>
            <thead>
              <tr>
                <th>{step === 5 ? "first person" : "person"}</th>
                <th>{step === 5 ? "second person" : "booking"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((value, j) => (
                    <td
                      key={j}
                      className={value === "NULL" ? "null-value" : ""}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } else if (kind === "group") {
    controls = ["The rows", "Make buckets", "Count each bucket"];
    caption = [
      "Each row is one person with a city. Four rows are shown.",
      "GROUP BY city puts the two Pune rows together and the two Mumbai rows together.",
      "COUNT(*) collapses each bucket to one summary row: Pune 2, Mumbai 2.",
    ][step];
    drawing = (
      <svg viewBox="0 0 720 260" role="img" aria-label={caption}>
        {step > 0 &&
          [0, 1].map((i) => (
            <g key={i}>
              <rect
                x={35 + i * 350}
                y={30}
                width={300}
                height={190}
                rx={15}
                className="scene-bucket"
              />
              <text
                x={185 + i * 350}
                y={60}
                textAnchor="middle"
                className="scene-heading"
              >
                {i === 0 ? "Pune" : "Mumbai"}
              </text>
            </g>
          ))}
        {groupRows.map((row, i) => {
          const bucket = row.city === "Pune" ? 0 : 1;
          const order = i < 2 ? 0 : 1;
          const x = step === 0 ? 35 + i * 174 : 65 + bucket * 350;
          const y = step === 0 ? 100 : 85 + order * 55;
          return (
            <g
              key={row.name}
              className="moving-row"
              style={{
                transform: `translate(${x}px,${y}px)`,
                opacity: step === 2 ? 0 : 1,
              }}
            >
              <rect
                width={step === 0 ? 155 : 240}
                height={40}
                rx={8}
                className="scene-active"
              />
              <text x={12} y={25} className="scene-text">
                {row.name}
                {step === 0 ? ` · ${row.city}` : ""}
              </text>
            </g>
          );
        })}
        {step === 2 &&
          [0, 1].map((i) => (
            <g key={i}>
              <text
                x={185 + i * 350}
                y={137}
                textAnchor="middle"
                className="scene-big"
              >
                2
              </text>
              <text
                x={185 + i * 350}
                y={168}
                textAnchor="middle"
                className="scene-text"
              >
                people in this bucket
              </text>
            </g>
          ))}
      </svg>
    );
  } else if (kind === "pipeline") {
    controls = pipelineStages;
    caption = pipelineCaptions[step];
    drawing = (
      <svg viewBox="0 0 720 265" role="img" aria-label={caption}>
        {pipelineStages.map((label, i) => {
          const x = 25 + (i % 4) * 175,
            y = 35 + Math.floor(i / 4) * 80;
          return (
            <Box
              key={label}
              x={x}
              y={y}
              w={155}
              text={`${i + 1} · ${label}`}
              active={i <= step}
            />
          );
        })}
        <text x="30" y="232" className="scene-heading">
          {pipelineResults[step][0]} · {pipelineResults[step][1]}
        </text>
      </svg>
    );
  } else if (kind === "window") {
    controls = windowPrices.map((_, i) => `Row ${i + 1}`);
    const start = mode === 0 ? 0 : Math.max(0, step - 1),
      values = windowPrices.slice(start, step + 1),
      result =
        mode === 0
          ? values.reduce((a, b) => a + b, 0)
          : values.reduce((a, b) => a + b, 0) / values.length;
    caption = `Current row ${step + 1}. ${mode === 0 ? "Running SUM" : "Two-row AVG"} includes rows ${start + 1} to ${step + 1}: ${result}.`;
    drawing = (
      <>
        <Controls
          labels={["Running sum", "Two-row average"]}
          value={mode}
          set={setMode}
          label="Choose a window frame"
        />
        <svg viewBox="0 0 720 310" role="img" aria-label={caption}>
          <text x="55" y="30" className="scene-heading">
            row
          </text>
          <text x="200" y="30" className="scene-heading">
            price
          </text>
          <rect
            x={40}
            y={48}
            width={300}
            height={(step - start + 1) * 44}
            rx={8}
            className="scene-window moving-row"
            style={{ transform: `translateY(${start * 44}px)` }}
          />
          {windowPrices.map((price, i) => (
            <g key={i}>
              <text x="55" y={77 + i * 44} className="scene-text">
                {i + 1}
                {i === step ? " ← current" : ""}
              </text>
              <text x="200" y={77 + i * 44} className="scene-text">
                {price}
              </text>
            </g>
          ))}
          <text x="420" y="105" className="scene-heading">
            {mode === 0 ? "running total" : "rolling average"}
          </text>
          <text x="420" y="160" className="scene-big">
            {result}
          </text>
          <text x="420" y="205" className="scene-muted">
            {mode === 0 ? "UNBOUNDED PRECEDING" : "1 PRECEDING"}
          </text>
          <text x="420" y="227" className="scene-muted">
            through CURRENT ROW
          </text>
        </svg>
      </>
    );
  } else if (kind === "relationships") {
    controls = Object.keys(models);
    const model = Object.values(models)[step];
    caption = model.caption;
    const pos = [
      [30, 35],
      [390, 35],
      [390, 200],
      [30, 200],
    ];
    drawing = (
      <svg viewBox="0 0 720 350" role="img" aria-label={caption}>
        {model.edges.map(([a, b, label], i) => (
          <g key={i}>
            <path
              d={`M${pos[a][0] + 145} ${pos[a][1] + 55} L${pos[b][0] + 145} ${pos[b][1] + 55}`}
              className="relation-line"
            />
            <text
              x={
                pos[a][0] === pos[b][0]
                  ? pos[a][0] + 170
                  : (pos[a][0] + pos[b][0]) / 2 + 130
              }
              y={
                (pos[a][1] + pos[b][1]) / 2 +
                (pos[a][0] === pos[b][0] ? 60 : 37)
              }
              className="scene-muted"
            >
              {label}
            </text>
          </g>
        ))}
        {model.nodes.map((node, i) => (
          <g key={node.name}>
            <rect
              x={pos[i][0]}
              y={pos[i][1]}
              width={285}
              height={120}
              rx={10}
              className="scene-box"
            />
            <text
              x={pos[i][0] + 15}
              y={pos[i][1] + 27}
              className="scene-heading"
            >
              {node.name}
            </text>
            {node.fields.map((field, j) => (
              <text
                key={field}
                x={pos[i][0] + 15}
                y={pos[i][1] + 53 + j * 24}
                className="scene-text"
              >
                {field}
              </text>
            ))}
          </g>
        ))}
      </svg>
    );
  } else if (kind === "index") {
    controls = ["Scan every row", "Follow a B-tree"];
    caption =
      step === 0
        ? "In this illustrative ordered list, a scan checks seven entries before finding key 7. Real scans and planner costs depend on the data."
        : "The illustrative balanced search follows 4 → 6 → 7. A real B-tree uses pages with many keys; this small drawing teaches the lookup idea, not a speed benchmark.";
    drawing = (
      <svg viewBox="0 0 720 285" role="img" aria-label={caption}>
        {step === 0 ? (
          <>
            {Array.from({ length: 8 }, (_, i) => (
              <Box
                key={i}
                x={24 + i * 86}
                y={90}
                w={72}
                text={String(i + 1)}
                active={i < 7}
              />
            ))}
            <text x="30" y="200" className="scene-heading">
              Find key 7: inspect entries until it appears.
            </text>
          </>
        ) : (
          <>
            <path
              d="M360 60 L190 125 M360 60 L530 125 M190 125 L105 215 M190 125 L275 215 M530 125 L445 215 M530 125 L615 215"
              className="relation-line"
            />
            <Box x={310} y={25} w={100} text="4" active />
            <Box x={140} y={100} w={100} text="2" />
            <Box x={480} y={100} w={100} text="6" active />
            {["1", "3", "5", "7 | 8"].map((text, i) => (
              <Box
                key={text}
                x={55 + i * 170}
                y={190}
                w={100}
                text={text}
                active={i === 3}
              />
            ))}
          </>
        )}
      </svg>
    );
  } else if (kind === "transaction") {
    controls = transactionScenes.map((scene) => scene.label);
    const scene = transactionScenes[step];
    caption = scene.caption;
    drawing = (
      <>
        <div className="timeline-label">
          Teaching simulation · two sessions, separate from the
          single-connection playground
        </div>
        <svg viewBox="0 0 720 300" role="img" aria-label={caption}>
          <text x="25" y="28" className="scene-heading">
            time
          </text>
          <text x="132" y="28" className="scene-heading">
            Session A
          </text>
          <text x="390" y="28" className="scene-heading">
            Session B / database
          </text>
          <line x1="75" y1="45" x2="75" y2="280" className="relation-line" />
          {scene.events.map(([session, event], i) => (
            <g key={`${step}-${i}`}>
              <text x="30" y={72 + i * 45} className="scene-muted">
                {i + 1}
              </text>
              <circle cx="75" cy={66 + i * 45} r={4} className="timeline-dot" />
              <rect
                x={session === "A" ? 110 : 355}
                y={47 + i * 45}
                width={session === "A" ? 235 : 335}
                height={35}
                rx={7}
                className="scene-active"
              />
              <text
                x={session === "A" ? 120 : 365}
                y={70 + i * 45}
                className="scene-small"
              >
                {session}: {event}
              </text>
            </g>
          ))}
        </svg>
      </>
    );
  } else if (kind === "normalize") {
    controls = normalizationScenes.map((scene) => scene.label);
    const scene = normalizationScenes[step];
    caption = scene.caption;
    drawing = (
      <svg viewBox="0 0 720 235" role="img" aria-label={caption}>
        <text x="30" y="30" className="scene-heading">
          Before
        </text>
        <text x="390" y="30" className="scene-heading">
          After
        </text>
        <rect
          x="20"
          y="50"
          width="325"
          height="155"
          rx="10"
          className="scene-box"
        />
        <rect
          x="375"
          y="50"
          width="325"
          height="155"
          rx="10"
          className="scene-active"
        />
        {scene.before.map((line, i) => (
          <text key={line} x="35" y={83 + i * 37} className="scene-small">
            {line}
          </text>
        ))}
        {scene.after.map((line, i) => (
          <text key={line} x="390" y={83 + i * 37} className="scene-small">
            {line}
          </text>
        ))}
      </svg>
    );
  } else if (kind === "json") {
    controls = ["-> JSONB", "->> text", "Missing key"];
    caption = [
      "details->'contactless' keeps the JSONB boolean true.",
      "details->>'contactless' extracts text 'true'; cast it when you need a SQL boolean.",
      "details->>'note' is SQL NULL when the note key is absent. Missing is not the same as false.",
    ][step];
    drawing = (
      <svg viewBox="0 0 720 220" role="img" aria-label={caption}>
        <Box x={30} y={65} w={315} h={85} text={'{"contactless": true}'} />
        <text x="373" y="113" className="scene-heading">
          →
        </text>
        <Box
          x={420}
          y={65}
          w={260}
          h={85}
          text={["JSONB true", "text 'true'", "SQL NULL"][step]}
          active
        />
      </svg>
    );
  } else if (kind === "security") {
    controls = ["A command", "A bound value", "Keep them separate"];
    caption = [
      "The developer controls the fixed SQL structure, including WHERE and the $1 placeholder.",
      "The driver sends the user's text separately, including quotes and punctuation.",
      "The text stays a value. It cannot rewrite the SQL command's structure.",
    ][step];
    drawing = (
      <svg viewBox="0 0 720 230" role="img" aria-label={caption}>
        <Box
          x={30}
          y={40}
          w={650}
          text="SELECT id FROM customers WHERE name = $1"
          active={step === 0 || step === 2}
        />
        <Box
          x={30}
          y={115}
          w={360}
          text={'values: ["O\'Reilly"]'}
          active={step === 1 || step === 2}
        />
        <text x="420" y="145" className="scene-heading">
          data stays data
        </text>
        <text x="35" y="205" className="scene-muted">
          Bind values through the driver's parameter API. Allowlist identifiers
          separately.
        </text>
      </svg>
    );
  } else if (kind === "design") {
    controls = designScenes.map((scene) => scene.label);
    const scene = designScenes[step];
    caption = scene.rule;
    drawing = (
      <svg viewBox="0 0 720 230" role="img" aria-label={caption}>
        <text x="30" y="40" className="scene-heading">
          {scene.label}: {scene.rule}
        </text>
        <Box x={30} y={75} w={650} text={scene.good} active />
        <Box x={30} y={140} w={650} text={scene.bad} />
      </svg>
    );
  } else {
    const scenes = lessonFlows[slug ?? ""] ?? flowScenes;
    controls = scenes.map((scene) => scene.label);
    const scene = scenes[step];
    caption = scene.caption;
    drawing = (
      <svg viewBox="0 0 720 210" role="img" aria-label={caption}>
        <path
          d="M210 100 L260 100 M450 100 L500 100"
          className="relation-line"
        />
        {scene.steps.map((text, i) => (
          <Box
            key={text}
            x={20 + i * 240}
            y={70}
            w={210}
            h={65}
            text={text}
            active={i === mode}
          />
        ))}
      </svg>
    );
  }
  return (
    <figure className="lesson-diagram advanced-diagram">
      <Controls labels={controls} value={step} set={setStep} />
      <p className="scene-scroll-hint" aria-hidden="true">
        Swipe sideways to explore the whole drawing.
      </p>
      <div
        className="scene-scroll"
        role="region"
        tabIndex={0}
        aria-label="Interactive SQL diagram, scroll to see the full drawing"
      >
        {drawing}
      </div>
      <figcaption aria-live="polite">{caption}</figcaption>
    </figure>
  );
}
