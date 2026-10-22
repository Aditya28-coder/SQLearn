export function explainError(message: string, code?: string): string {
  if (code === "42601" || /syntax error/i.test(message))
    return "A tiny syntax hiccup. Check commas, quotation marks, and the spelling of SQL keywords near the highlighted word.";
  if (code === "42P01" || /relation .* does not exist/i.test(message))
    return "SQL couldn’t find that table. Double-check its spelling and which sample dataset you’re using.";
  if (code === "42703" || /column .* does not exist/i.test(message))
    return "That column name doesn’t look familiar. Check the table’s column names, and put text values in single quotes, like 'Pune'.";
  if (code === "23505")
    return "That value is already used by a row that needs to be unique. Try a different ID or use ON CONFLICT.";
  if (code === "23503")
    return "This row points to a related row that isn’t there, or another row still depends on it. Check the foreign key — the link between the two tables.";
  if (code === "23502")
    return "One of the required columns is missing a value. A NOT NULL column needs something filled in.";
  if (code === "23514")
    return "This value doesn’t pass the table’s CHECK rule. For example, prices cannot be negative and quantities must be greater than zero.";
  if (code === "25P02")
    return "An earlier query in this transaction had a hiccup. Run ROLLBACK; to start fresh, or reset this dataset.";
  if (code === "22012")
    return "That calculation divides by zero. Try dividing by NULLIF(your_value, 0) so zero becomes an empty value instead.";
  if (code === "57014")
    return "This query took a little too long. Try a smaller range or a LIMIT, then give it another go.";
  return "Let’s take another look together. The Postgres message below has the details. You can edit your query, try a starter, or reset the dataset.";
}
