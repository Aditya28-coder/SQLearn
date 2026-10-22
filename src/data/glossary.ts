export const glossary = [
  {
    term: "sequence",
    definition:
      "A database object that generates successive numbers, often for IDs; its increments are not rolled back like ordinary row changes.",
  },
  {
    term: "snapshot",
    definition:
      "A transaction's view of which row versions are visible at a particular point under its isolation rules.",
  },
  {
    term: "serialization anomaly",
    definition:
      "A concurrent result that cannot be explained by running the transactions one at a time in some order.",
  },
  {
    term: "Serializable",
    definition:
      "An isolation level that rejects conflicting work when needed to preserve an outcome equivalent to a serial transaction order; applications must handle whole-transaction retries.",
  },
  {
    term: "GIN index",
    definition:
      "An index type useful for searching components within values such as JSONB documents and arrays.",
  },
  {
    term: "buffer",
    definition:
      "A place for a database page in memory; EXPLAIN BUFFERS reports page activity rather than just the number of result rows.",
  },
  {
    term: "database",
    definition:
      "An organized collection of information managed by a database system.",
  },
  {
    term: "table",
    definition: "A named collection of rows with the same defined columns.",
  },
  {
    term: "row",
    definition: "One record in a table, such as one student or one order.",
  },
  {
    term: "column",
    definition:
      "One named kind of detail in a table, with a defined data type.",
  },
  {
    term: "primary key",
    definition:
      "A column or combination that uniquely identifies a row and cannot be NULL.",
  },
  {
    term: "foreign key",
    definition:
      "A rule requiring a non-NULL reference to match a key in another or the same table.",
  },
  {
    term: "composite key",
    definition:
      "A key made from more than one column, such as a student-course pair.",
  },
  {
    term: "NULL",
    definition:
      "SQL's marker for an absent or unknown value; it is different from zero or empty text.",
  },
  {
    term: "alias",
    definition:
      "A temporary name for a table or result column, often introduced with AS.",
  },
  {
    term: "DISTINCT",
    definition: "A SELECT modifier that removes duplicate result rows.",
  },
  {
    term: "predicate",
    definition:
      "A condition evaluated as true, false or unknown, such as price > 200.",
  },
  {
    term: "aggregate",
    definition:
      "A calculation combining several rows' values into one summary, such as SUM or COUNT.",
  },
  {
    term: "GROUP BY",
    definition:
      "A clause making one group for each chosen combination of column values.",
  },
  {
    term: "HAVING",
    definition: "A condition filtering groups after aggregation.",
  },
  {
    term: "JOIN",
    definition:
      "An operation combining rows from related inputs using a matching rule.",
  },
  {
    term: "LEFT JOIN",
    definition:
      "A join retaining every left-side row, with NULLs for an absent right-side match.",
  },
  {
    term: "CROSS JOIN",
    definition: "A join returning every possible pair of input rows.",
  },
  {
    term: "self join",
    definition:
      "A join using the same table in two roles, named with different aliases.",
  },
  {
    term: "subquery",
    definition:
      "A query nested inside another query, providing a value, list or table.",
  },
  {
    term: "correlated subquery",
    definition:
      "A nested query referring to a value from its current outer row.",
  },
  {
    term: "EXISTS",
    definition:
      "A test that is true when its subquery returns at least one row.",
  },
  {
    term: "CTE",
    definition:
      "A common table expression: a query result named with WITH for one statement.",
  },
  {
    term: "recursive CTE",
    definition:
      "A WITH RECURSIVE query combining starting rows with a rule that finds more rows.",
  },
  {
    term: "window function",
    definition:
      "A calculation across related rows that keeps each row's identity rather than collapsing it.",
  },
  {
    term: "PARTITION BY",
    definition:
      "The part of a window definition that resets the calculation for separate groups.",
  },
  {
    term: "frame",
    definition:
      "The subset of a window's ordered rows used for the current row's calculation.",
  },
  {
    term: "JSONB",
    definition:
      "PostgreSQL's parsed JSON storage type, supporting operators for paths and containment.",
  },
  {
    term: "schema",
    definition:
      "A named namespace for database objects such as tables, views and functions.",
  },
  {
    term: "constraint",
    definition:
      "A database-enforced rule, such as NOT NULL, UNIQUE, CHECK or a foreign key.",
  },
  {
    term: "UNIQUE",
    definition:
      "A rule preventing duplicate key values; PostgreSQL allows multiple NULLs by default.",
  },
  {
    term: "CHECK",
    definition:
      "A constraint that rejects a row when its condition is false; add NOT NULL separately if needed.",
  },
  {
    term: "DEFAULT",
    definition:
      "A value supplied when an INSERT omits a column; it does not automatically maintain updates.",
  },
  {
    term: "UPSERT",
    definition:
      "An insert with a chosen conflict response, written INSERT ... ON CONFLICT in PostgreSQL.",
  },
  {
    term: "normalization",
    definition:
      "Organizing relational facts so each has a dependable home and repeated-update problems are reduced.",
  },
  {
    term: "denormalization",
    definition:
      "Intentionally repeating or precomputing data with an explicit consistency strategy.",
  },
  {
    term: "index",
    definition:
      "An extra data structure that can help find selected rows, at a storage and write-maintenance cost.",
  },
  {
    term: "B-tree",
    definition:
      "A balanced ordered index structure useful for equality, ranges and some ordered retrievals.",
  },
  {
    term: "query plan",
    definition:
      "The tree of scan, join, sort and other operations chosen to produce a query's result.",
  },
  {
    term: "EXPLAIN",
    definition:
      "A PostgreSQL command showing a query's planned operations and estimates.",
  },
  {
    term: "EXPLAIN ANALYZE",
    definition:
      "A command that actually executes the statement and adds measurements to its plan.",
  },
  {
    term: "sargable",
    definition:
      "Describes a condition an index can use as a search argument, often a direct comparison or range.",
  },
  {
    term: "N+1",
    definition:
      "A request pattern making one initial query and then one extra query for each of N results.",
  },
  {
    term: "view",
    definition: "A saved query definition that can be read like a table.",
  },
  {
    term: "materialized view",
    definition:
      "A stored query result that must be refreshed to reflect later source changes.",
  },
  {
    term: "transaction",
    definition:
      "A unit of work whose transactional changes can be kept with COMMIT or discarded with ROLLBACK.",
  },
  {
    term: "ACID",
    definition:
      "Atomicity, consistency, isolation and durability: properties describing dependable transactions.",
  },
  {
    term: "isolation",
    definition:
      "A transaction's rules for observing and interacting with concurrent work.",
  },
  {
    term: "dirty read",
    definition:
      "Reading another transaction's uncommitted changes; PostgreSQL's isolation levels prevent this.",
  },
  {
    term: "deadlock",
    definition:
      "A circular wait in which transactions each hold a resource another needs.",
  },
  {
    term: "savepoint",
    definition:
      "A named point within a transaction to which part of its work can be rolled back.",
  },
  {
    term: "trigger",
    definition:
      "A database rule that runs a trigger function in response to a table event.",
  },
  {
    term: "parameterized query",
    definition:
      "A command sent with separate data values, so untrusted input cannot rewrite the SQL structure.",
  },
  {
    term: "SQL injection",
    definition:
      "A vulnerability where untrusted input is interpreted as part of a SQL command.",
  },
  {
    term: "soft delete",
    definition:
      "Marking a row inactive while retaining it, with a consistent filtering and retention policy.",
  },
  {
    term: "migration",
    definition:
      "A versioned change to a database's structure or data, planned for existing records and deployment order.",
  },
  {
    term: "grain",
    definition:
      "What one row represents in a table or report, such as one order line rather than one order.",
  },
  {
    term: "cohort",
    definition:
      "A group sharing a defined start event or period, such as a first-order month.",
  },
  {
    term: "funnel",
    definition:
      "A sequence of defined events measured for the same entities in a chosen order and time window.",
  },
  {
    term: "pagination",
    definition:
      "Retrieving a stable, limited slice of an ordered result at a time.",
  },
  {
    term: "keyset pagination",
    definition:
      "Loading the next slice after a stable ordering key rather than skipping an increasing number of rows.",
  },
  {
    term: "RETURNING",
    definition:
      "A clause returning values from rows changed by INSERT, UPDATE or DELETE.",
  },
  {
    term: "cardinality",
    definition:
      "The number of rows or distinct values, or the one-to-many shape of a relationship.",
  },
  {
    term: "idempotent",
    definition:
      "An operation whose repeated application has the same intended final effect as one application.",
  },
];
export const glossaryMap = Object.fromEntries(
  glossary.map((item) => [item.term.toLowerCase(), item.definition]),
);
export const glossaryId = (term: string) =>
  term.toLowerCase().replace(/[^a-z0-9]+/g, "-");
