import type { QueryResult } from "@/lib/database-types";

const numericTypes = new Set([20, 21, 23, 26, 700, 701, 1700]);
export function cellText(value: unknown, dataTypeID?: number): string {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return String(value);
    const iso = value.toISOString();
    return dataTypeID === 1082
      ? iso.slice(0, 10)
      : dataTypeID === 1114
        ? iso.replace("T", " ").replace(/Z$/, "")
        : iso;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ResultTable({ result }: { result: QueryResult }) {
  return (
    <div
      className="results-scroll"
      tabIndex={0}
      role="region"
      aria-label="SQL results, scroll to see all columns"
    >
      <table className="result-table">
        <caption className="sr-only">
          Query output, {result.totalRows ?? result.rows.length}{" "}
          {(result.totalRows ?? result.rows.length) === 1 ? "row" : "rows"}
        </caption>
        <thead>
          <tr>
            <th className="row-index" aria-label="Row number">
              #
            </th>
            {result.fields.map((field, index) => (
              <th
                key={`${field.name}-${index}`}
                className={
                  numericTypes.has(field.dataTypeID ?? 0) ? "numeric" : ""
                }
              >
                {field.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="row-index">{rowIndex + 1}</td>
              {result.fields.map((field, columnIndex) => (
                <td
                  key={columnIndex}
                  className={`${numericTypes.has(field.dataTypeID ?? 0) ? "numeric" : ""} ${row[field.name] === null ? "null-cell" : ""}`}
                  title={cellText(row[field.name], field.dataTypeID)}
                >
                  {cellText(row[field.name], field.dataTypeID)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {result.rows.length === 0 && (
        <p className="empty-result">
          No rows matched this time. Try adjusting your WHERE condition.
        </p>
      )}
      {(result.totalRows ?? 0) > 200 && (
        <p className="result-limit">
          Showing the first 200 of {result.totalRows?.toLocaleString()} rows.
          Add a LIMIT for a smaller result.
        </p>
      )}
    </div>
  );
}
