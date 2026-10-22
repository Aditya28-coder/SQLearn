import type { DatasetId } from "./datasets";

export type Question = {
  id: string;
  kind: "write" | "fix" | "predict" | "fill";
  difficulty: "easy" | "medium" | "hard";
  title: string;
  prompt: string;
  dataset: DatasetId;
  starter: string;
  referenceSql: string;
  solution: string;
  explanation: string;
  hints: [string, string];
  ordered?: boolean;
  checkColumnNames?: boolean;
  template?: string;
  choices?: { label: string; sql: string }[];
  correctChoice?: number;
  conceptual?: boolean;
  parameters?: (string | number | boolean | null)[];
  exercise?: { setup: string; verify: string };
};

export type Lesson = {
  level?: number;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  minutes: number;
  concept: string;
  analogy: string;
  notes: { title: string; body: string; sql?: string }[];
  diagram:
    | "anatomy"
    | "projection"
    | "filter"
    | "order"
    | "null"
    | "types"
    | "group"
    | "pipeline"
    | "joins"
    | "relationships"
    | "flow"
    | "window"
    | "json"
    | "index"
    | "transaction"
    | "normalize"
    | "design"
    | "security";
  examples: {
    title: string;
    caption: string;
    dataset: DatasetId;
    sql: string;
    fresh?: boolean;
    setup?: string;
    parameters?: (string | number | boolean | null)[];
  }[];
  mistakes: string[];
  engineering: string;
  recap: string[];
  questions: Question[];
};
