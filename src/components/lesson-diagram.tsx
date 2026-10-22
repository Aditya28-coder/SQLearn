"use client";
import { useState } from "react";
import type { Lesson } from "@/data/lesson-types";
import { AdvancedDiagram } from "./advanced-diagram";

import {
  tableRows,
  pipelines,
  typeCards,
  diagramCopy,
} from "@/data/lesson-diagrams";

export function LessonDiagram({
  kind,
  slug,
}: {
  kind: Lesson["diagram"];
  slug?: string;
}) {
  return ["anatomy", "projection", "filter", "order", "null", "types"].includes(
    kind,
  ) ? (
    <BasicDiagram kind={kind} />
  ) : (
    <AdvancedDiagram key={`${kind}-${slug}`} kind={kind} slug={slug} />
  );
}
function BasicDiagram({ kind }: { kind: Lesson["diagram"] }) {
  const [step, setStep] = useState(0);
  const { controls, captions } = diagramCopy(kind);
  return (
    <figure className="lesson-diagram">
      <div className="diagram-controls" aria-label="Explore the diagram">
        {controls.map((label, index) => (
          <button
            key={label}
            onClick={() => setStep(index)}
            aria-pressed={step === index}
          >
            {label}
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 640 225"
        role="img"
        aria-label={captions[step]}
        className="concept-svg"
      >
        {kind === "anatomy" || kind === "projection" || kind === "filter" ? (
          <>
            <text x="40" y="31" className="svg-caption">
              students{" "}
              {kind === "filter"
                ? "→ matching rows"
                : "→ a little school register"}
            </text>
            <rect
              x="40"
              y="49"
              width="560"
              height="153"
              rx="12"
              className="svg-surface"
            />
            <rect
              x="41"
              y="50"
              width="558"
              height="35"
              rx="11"
              className="svg-header"
            />
            {kind === "anatomy" && (
              <rect
                x={step === 1 ? 210 : 42}
                y={step === 0 ? 86 : 50}
                width={step === 1 ? 170 : step === 2 ? 145 : 556}
                height={step === 0 ? 38 : 150}
                rx="8"
                className="svg-highlight"
              />
            )}
            {["id", "name", "city"].map((label, column) => (
              <text
                key={label}
                x={[65, 235, 425][column]}
                y="73"
                className="svg-table-heading"
                opacity={
                  kind === "projection" &&
                  ((step === 1 && column !== 1) || (step === 2 && column === 0))
                    ? 0.28
                    : 1
                }
              >
                {label}
                {kind === "anatomy" && column === 0 && step === 2
                  ? " · key"
                  : ""}
              </text>
            ))}
            {(kind === "filter" && step === 2
              ? [
                  ["5", "Zoya", "NULL"],
                  ["", "", ""],
                  ["", "", ""],
                ]
              : tableRows
            ).map((row, i) => (
              <g
                key={i}
                opacity={
                  kind === "filter" && step === 1 && row[2] !== "Pune"
                    ? 0.22
                    : 1
                }
                className="diagram-row"
              >
                {row.map((value, j) => (
                  <text
                    key={j}
                    x={[65, 235, 425][j]}
                    y={111 + i * 38}
                    className="svg-cell"
                    opacity={
                      kind === "projection" &&
                      ((step === 1 && j !== 1) || (step === 2 && j === 0))
                        ? 0.2
                        : 1
                    }
                  >
                    {value}
                  </text>
                ))}
              </g>
            ))}
          </>
        ) : kind === "order" ? (
          <>
            <text x="40" y="38" className="svg-caption">
              A query’s logical journey · not its written clause order
            </text>
            {pipelines.map((label, index) => {
              const x = 40 + (index % 4) * 147,
                y = index < 4 ? 70 : 141;
              return (
                <g key={label}>
                  <rect
                    x={x}
                    y={y}
                    width="124"
                    height="46"
                    rx="10"
                    className={step === index ? "svg-selected" : "svg-surface"}
                  />
                  <text
                    x={x + 62}
                    y={y + 28}
                    textAnchor="middle"
                    className="svg-cell"
                    fill={step === index ? "var(--accent)" : undefined}
                  >
                    {label}
                  </text>
                  {index !== 3 && index !== 6 && (
                    <path
                      d={`M${x + 131} ${y + 23}h10m-3-3 3 3-3 3`}
                      className="svg-arrow"
                    />
                  )}
                </g>
              );
            })}
          </>
        ) : kind === "null" ? (
          <>
            <text x="40" y="35" className="svg-caption">
              A missing detail is not a zero, false, or empty text.
            </text>
            <rect
              x="40"
              y="66"
              width="350"
              height="101"
              rx="13"
              className="svg-surface"
            />
            <text
              x="215"
              y="124"
              textAnchor="middle"
              className="svg-expression"
            >
              {
                [
                  "NULL = NULL",
                  "NULL IS NULL",
                  "COALESCE(NULL, 'Not shared')",
                  "NULLIF(0, 0)",
                ][step]
              }
            </text>
            <path d="M403 116h32m-6-5 6 5-6 5" className="svg-arrow" />
            <rect
              x="450"
              y="66"
              width="150"
              height="101"
              rx="13"
              className="svg-highlight"
            />
            <text x="525" y="123" textAnchor="middle" className="svg-cell">
              {["NULL", "true", "Not shared", "NULL"][step]}
            </text>
          </>
        ) : (
          <>
            <text x="40" y="35" className="svg-caption">
              Choose a jar that fits the meaning of your value.
            </text>
            <rect
              x="103"
              y="61"
              width="434"
              height="124"
              rx="15"
              className="svg-highlight"
            />
            <text
              x="320"
              y="100"
              textAnchor="middle"
              className="svg-table-heading"
            >
              {typeCards[step].label}
            </text>
            <text
              x="320"
              y="143"
              textAnchor="middle"
              className="svg-expression"
            >
              {typeCards[step].value}
            </text>
          </>
        )}
      </svg>
      <figcaption aria-live="polite">{captions[step]}</figcaption>
    </figure>
  );
}
