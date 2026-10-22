"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { datasets, type DatasetId } from "@/data/datasets";
import type { WorkerRequest, WorkerResponse } from "./database-types";

type Pending = {
  resolve: (value: WorkerResponse) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function useDatabase() {
  const worker = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, Pending>());
  const nextId = useRef(0);
  const [generation, setGeneration] = useState(0);
  const [ready, setReady] = useState(false);
  const [startupError, setStartupError] = useState("");

  const rejectAll = useCallback((reason: string) => {
    for (const entry of pending.current.values()) {
      clearTimeout(entry.timer);
      entry.reject(new Error(reason));
    }
    pending.current.clear();
  }, []);

  const request = useCallback(
    (input: Omit<WorkerRequest, "id">, timeout = 15000) => {
      return new Promise<WorkerResponse>((resolve, reject) => {
        if (!worker.current) {
          reject(new Error("Your database is not ready yet."));
          return;
        }
        const id = ++nextId.current;
        const timer = setTimeout(() => {
          const message =
            "This query took too long, so we stopped it to keep your browser happy. Restart the database to try a smaller query. Restarting restores all sample data.";
          worker.current?.terminate();
          worker.current = null;
          setReady(false);
          setStartupError(message);
          rejectAll(message);
        }, timeout);
        pending.current.set(id, { resolve, reject, timer });
        worker.current.postMessage({ ...input, id });
      });
    },
    [rejectAll],
  );

  useEffect(() => {
    let active = true;
    const instance = new Worker("/database-worker.js", { type: "module" });
    worker.current = instance;
    instance.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      const entry = pending.current.get(data.id);
      if (!entry) return;
      clearTimeout(entry.timer);
      pending.current.delete(data.id);
      entry.resolve(data);
    };
    instance.onerror = () => {
      if (!active) return;
      setReady(false);
      setStartupError(
        "We couldn’t start the browser database. Please retry. Make sure the PGlite files have finished downloading.",
      );
      rejectAll("Database startup failed.");
    };
    request(
      {
        kind: "init",
        dataset: "campus",
        seeds: datasets.map(({ id, seed }) => ({ id, seed })),
      },
      60000,
    )
      .then((response) => {
        if (!active) return;
        if (response.error) setStartupError(response.error);
        else setReady(true);
      })
      .catch((error) => {
        if (active) setStartupError(error.message);
      });
    return () => {
      active = false;
      instance.terminate();
      worker.current = null;
      rejectAll(
        "The playground closed. Your sample data will start fresh next time.",
      );
    };
  }, [generation, rejectAll, request]);

  const restart = useCallback(() => {
    setReady(false);
    setStartupError("");
    rejectAll("Query stopped. All sample datasets are being restored.");
    worker.current?.terminate();
    setGeneration((value) => value + 1);
  }, [rejectAll]);

  const run = useCallback(
    (
      sql: string,
      dataset: DatasetId,
      fresh = false,
      setupSql?: string,
      parameters?: (string | number | boolean | null)[],
    ) =>
      request(
        { kind: fresh ? "demo" : "run", dataset, sql, setupSql, parameters },
        fresh ? 60000 : 15000,
      ),
    [request],
  );
  const getSchema = useCallback(
    (dataset: DatasetId) => request({ kind: "schema", dataset }),
    [request],
  );
  const reset = useCallback(
    (dataset: DatasetId) => request({ kind: "reset", dataset }),
    [request],
  );
  const grade = useCallback(
    (
      sql: string,
      referenceSql: string,
      dataset: DatasetId,
      options: {
        ordered?: boolean;
        checkColumnNames?: boolean;
        parameters?: (string | number | boolean | null)[];
        exercise?: { setup: string; verify: string };
      } = {},
    ) =>
      request(
        { kind: "grade", dataset, sql, referenceSql, ...options },
        options.exercise ? 60000 : 30000,
      ),
    [request],
  );
  return { ready, startupError, restart, run, getSchema, reset, grade };
}
export type DatabaseEngine = ReturnType<typeof useDatabase>;
