import type { Lesson } from "./lesson-types";

export const tableRows = [
  ["1", "Aanya", "Pune"],
  ["2", "Kabir", "Mumbai"],
  ["3", "Meera", "Pune"],
];
export const pipelines = [
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "SELECT",
  "ORDER BY",
  "LIMIT",
];
export const typeCards = [
  {
    label: "integer",
    value: "42",
    note: "Whole numbers, such as a count of seats.",
  },
  {
    label: "text",
    value: "'01234'",
    note: "Words and labels. The leading zero stays.",
  },
  {
    label: "boolean",
    value: "true",
    note: "A yes/no flag; NULL is also possible if the column allows it.",
  },
  {
    label: "numeric",
    value: "10.50",
    note: "An exact decimal amount, such as a price.",
  },
  {
    label: "date",
    value: "'2026-09-01'",
    note: "A calendar day without a clock.",
  },
  {
    label: "timestamp",
    value: "'2026-09-01 09:30'",
    note: "A local date and time. Plain timestamp has no time zone.",
  },
  {
    label: "uuid",
    value: "'550e8400-…'",
    note: "A large identifier. A key constraint still enforces uniqueness.",
  },
  {
    label: "json / jsonb",
    value: '{"theme":"mint"}',
    note: "Structured details. JSON keeps input text; JSONB stores a parsed representation.",
  },
];

export function diagramCopy(kind: Lesson["diagram"]) {
  const controls =
    kind === "anatomy"
      ? ["A row", "A column", "A primary key"]
      : kind === "projection"
        ? ["All columns", "Just name", "Name & city"]
        : kind === "filter"
          ? ["All students", "Only Pune", "Unknown city"]
          : kind === "order"
            ? pipelines
            : kind === "null"
              ? ["NULL = NULL", "NULL IS NULL", "COALESCE", "NULLIF"]
              : typeCards.map((item) => item.label);
  const captions =
    kind === "anatomy"
      ? [
          "The highlighted row describes one student: Aanya.",
          "The highlighted column holds one kind of detail: a name.",
          "Each ID belongs to one student. The key cannot repeat or be missing.",
        ]
      : kind === "projection"
        ? [
            "SELECT * keeps every column. All student rows remain.",
            "SELECT name keeps one detail from every student.",
            "SELECT name, city keeps two details. Choosing columns does not filter rows.",
          ]
        : kind === "filter"
          ? [
              "Without a filter, all 8 students belong in the result. This is a three-row preview.",
              "WHERE city = 'Pune' keeps Aanya and Meera; the other rows do not pass.",
              "WHERE city IS NULL keeps Zoya. Missing is different from a known city.",
            ]
          : kind === "order"
            ? [
                "FROM finds the starting table.",
                "WHERE keeps rows that match your condition.",
                "GROUP BY makes groups. You’ll learn it in Level 2.",
                "HAVING filters those groups. Also coming in Level 2.",
                "SELECT chooses the result columns and expressions.",
                "ORDER BY sorts the result. Add a tie-breaker when values match.",
                "LIMIT keeps a smaller slice; OFFSET skips rows for another page.",
              ]
            : kind === "null"
              ? [
                  "Unknown compared with unknown is still unknown—not true or false.",
                  "IS NULL asks directly whether a value is missing. Here the answer is true.",
                  "COALESCE(NULL, 'Not shared') picks the first known value.",
                  "NULLIF(0, 0) turns equal arguments into NULL.",
                ]
              : typeCards.map((item) => item.note);
  return { controls, captions };
}
