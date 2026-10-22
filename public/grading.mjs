/** Result grading is shared by the worker and the Node/Postgres tests. */
const numericTypes = new Set([20, 21, 23, 26, 700, 701, 1700]);

function stable(value) {
  if (value === null || value === undefined) return "null";
  if (value instanceof Date) return `date:${value.toISOString()}`;
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
      .join(",")}}`;
  return `${typeof value}:${JSON.stringify(value)}`;
}

function decimal(value) {
  const raw = String(value);
  const match = raw.match(/^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!match) return raw;
  let digits = (match[2] + (match[3] || "")).replace(/^0+/, "");
  if (!digits) return "0";
  let scale = (match[3]?.length || 0) - Number(match[4] || 0);
  while (digits.endsWith("0")) {
    digits = digits.slice(0, -1);
    scale--;
  }
  return `${match[1] === "-" ? "-" : ""}${digits}:${scale}`;
}

function cell(value, field) {
  if (value === null || value === undefined) return "null";
  const type = Number(field.dataTypeID);
  if (numericTypes.has(type)) return `number:${decimal(value)}`;
  if ([1082, 1114, 1184].includes(type))
    return `temporal:${type}:${stable(value)}`;
  return stable(value);
}

/**
 * Compare bags of rows without dropping duplicates. Search a single column
 * permutation for the WHOLE result, never sort values separately inside rows.
 * Array row mode preserves duplicate column labels and positional values.
 * @param {{rows: unknown[][], fields: {name:string,dataTypeID?:number}[]}} actual
 * @param {{rows: unknown[][], fields: {name:string,dataTypeID?:number}[]}} expected
 * @param {{ordered?:boolean,checkColumnNames?:boolean}} [options]
 */
export function compareResults(actual, expected, options = {}) {
  const aCount = actual.rows.length,
    eCount = expected.rows.length;
  if (aCount !== eCount)
    return {
      correct: false,
      reason: `Your query returned ${aCount} ${aCount === 1 ? "row" : "rows"}; we expected ${eCount}. Check your filter and whether DISTINCT belongs here.`,
    };
  if (actual.fields.length !== expected.fields.length)
    return {
      correct: false,
      reason: `You returned ${actual.fields.length} ${actual.fields.length === 1 ? "column" : "columns"}; this question asks for ${expected.fields.length}. Check the SELECT list.`,
    };
  const a = actual.rows.map((row) =>
    row.map((value, i) => cell(value, actual.fields[i])),
  );
  const e = expected.rows.map((row) =>
    row.map((value, i) => cell(value, expected.fields[i])),
  );
  const columnSignature = (rows, index) =>
    JSON.stringify(rows.map((row) => row[index]).sort());
  const candidates = expected.fields.map((field, i) =>
    actual.fields.flatMap((other, j) =>
      (!options.checkColumnNames || other.name === field.name) &&
      columnSignature(a, j) === columnSignature(e, i)
        ? [j]
        : [],
    ),
  );
  if (candidates.some((items) => !items.length))
    return {
      correct: false,
      reason: options.checkColumnNames
        ? "The values or column names differ. Check the requested aliases and compare the two outputs below."
        : "The number of rows matches. A value or data type is different, though—compare the two outputs below.",
    };
  const target = e.map((row) => JSON.stringify(row));
  if (!options.ordered) target.sort();
  const mapping = [],
    used = new Set();
  function search(index) {
    if (index === candidates.length) {
      const rows = a.map((row) =>
        JSON.stringify(mapping.map((column) => row[column])),
      );
      if (!options.ordered) rows.sort();
      return rows.every((row, i) => row === target[i]);
    }
    for (const column of candidates[index]) {
      if (used.has(column)) continue;
      used.add(column);
      mapping.push(column);
      if (search(index + 1)) return true;
      mapping.pop();
      used.delete(column);
    }
    return false;
  }
  const correct = search(0);
  return {
    correct,
    reason: correct
      ? "That’s the result we were looking for. Your SQL can be different from the solution and still be right."
      : options.ordered
        ? "The values are close, but their order or row pairings differ. Check ASC / DESC and add the requested tie-breaker."
        : "The values are close, but some row pairings differ. Keep each row’s details together.",
  };
}

/** One statement in a read-only transaction. Always restore the scratch state. */
export async function readOnlyResult(database, sql, dataset, parameters = []) {
  if (!new Set(["campus", "store", "delivery"]).has(dataset))
    throw new Error("Choose a sample dataset.");
  await database.exec("ROLLBACK;");
  await database.exec(
    `BEGIN READ ONLY; SET LOCAL search_path TO "${dataset}", public;`,
  );
  try {
    const result = await database.query(sql, parameters, { rowMode: "array" });
    if (!result.fields.length)
      throw new Error(
        "For this practice question, return a result with one SELECT statement. Use the playground for changing tables.",
      );
    return result;
  } finally {
    await database.exec("ROLLBACK;");
  }
}

/** A write exercise gets a disposable database, even when the answer commits. */
export async function exerciseResult(createDatabase, seeds, sql, dataset, exercise) {
  const database = await createDatabase();
  try {
    await database.exec(seeds.map(entry => entry.seed).join("\n"));
    await database.exec(`SET search_path TO "${dataset}", public;`);
    if (exercise.setup) await database.exec(exercise.setup);
    await database.exec(sql);
    const result = await database.query(exercise.verify, [], {rowMode:"array"});
    if (!result.fields.length) throw new Error("The exercise check needs a result table.");
    return result;
  } finally { await database.close(); }
}

/** Convert positional output for the existing result-table component. */
export function displayResult(result) {
  const seen = new Map();
  const fields = result.fields.map((field) => {
    const count = (seen.get(field.name) || 0) + 1;
    seen.set(field.name, count);
    return {
      ...field,
      name: count === 1 ? field.name : `${field.name} (${count})`,
    };
  });
  return {
    fields,
    totalRows: result.rows.length,
    rows: result.rows
      .slice(0, 200)
      .map((row) =>
        Object.fromEntries(fields.map((field, i) => [field.name, row[i]])),
      ),
  };
}
