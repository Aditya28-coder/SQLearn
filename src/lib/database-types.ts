import type { DatasetId } from "@/data/datasets";

export type Field = { name: string; dataTypeID?: number };
export type QueryResult = {
  rows: Record<string, unknown>[];
  fields: Field[];
  affectedRows?: number;
  totalRows?: number;
};
export type Column = {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
  foreign: boolean;
};
export type Table = { name: string; columns: Column[]; count: number };
export type WorkerRequest = {
  id: number;
  kind: "init" | "run" | "schema" | "reset" | "grade" | "demo";
  dataset: DatasetId;
  sql?: string;
  setupSql?: string;
  referenceSql?: string;
  ordered?: boolean;
  checkColumnNames?: boolean;
  parameters?: (string | number | boolean | null)[];
  exercise?: { setup: string; verify: string };
  seeds?: { id: DatasetId; seed: string }[];
};
export type WorkerResponse = {
  id: number;
  results?: QueryResult[];
  tables?: Table[];
  error?: string;
  code?: string;
  elapsed?: number;
  grade?: {
    correct: boolean;
    reason: string;
    actual?: QueryResult;
    expected: QueryResult;
    error?: string;
    code?: string;
  };
};
