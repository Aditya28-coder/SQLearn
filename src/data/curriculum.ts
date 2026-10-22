export type Level = {
  id: number;
  name: string;
  description: string;
  note: string;
  color: string;
  topics: string[];
};

// The five-level topic map matches the ordered lessons in course.ts.
export const levels: Level[] = [
  {
    id: 1,
    name: "Meet your database",
    description:
      "Start small. Get to know tables, find your first rows, and ask good questions.",
    note: "Your first little aha",
    color: "lavender",
    topics: [
      "Databases, tables, rows, columns & primary keys",
      "SELECT, aliases, SELECT * & DISTINCT",
      "WHERE, AND / OR / NOT, IN, BETWEEN, LIKE & IS NULL",
      "ORDER BY, LIMIT, OFFSET & pagination",
      "NULL, COALESCE & NULLIF",
      "Numbers, text, booleans, dates, UUID & JSON",
    ],
  },
  {
    id: 2,
    name: "Find the bigger picture",
    description:
      "Turn individual rows into stories with groups, totals, and a little logic.",
    note: "Make your data talk",
    color: "mint",
    topics: [
      "COUNT, SUM, AVG, MIN & MAX",
      "GROUP BY, HAVING & WHERE vs HAVING",
      "CASE WHEN",
      "String, date, time & math functions",
      "INSERT, UPDATE & DELETE safely",
      "UPSERT with ON CONFLICT",
    ],
  },
  {
    id: 3,
    name: "Better together",
    description:
      "Connect the dots. Bring tables together and discover the relationships between them.",
    note: "Everything is connected",
    color: "pink",
    topics: [
      "Relationships & foreign keys",
      "INNER, LEFT, RIGHT, FULL, CROSS & SELF joins",
      "Joining three or more tables",
      "UNION, UNION ALL, INTERSECT & EXCEPT",
      "Subqueries, correlated queries & EXISTS vs IN",
    ],
  },
  {
    id: 4,
    name: "A few clever tricks",
    description:
      "Find patterns, rank your results, and give your queries a whole new perspective.",
    note: "Your SQL superpowers",
    color: "peach",
    topics: [
      "CTEs & recursive CTEs",
      "Window functions, ranks, frames & running totals",
      "Working with JSON & JSONB",
      "Top-N, deduplication, gaps, rolling averages, funnels & cohorts",
      "Pivoting with conditional aggregation",
    ],
  },
  {
    id: 5,
    name: "Think like an engineer",
    description:
      "Build thoughtful databases and write SQL that feels at home in the real world.",
    note: "Look how far you’ll go",
    color: "blue",
    topics: [
      "CREATE, ALTER, DROP & constraints",
      "Normalization: 1NF, 2NF, 3NF & denormalization",
      "B-tree & composite indexes",
      "EXPLAIN & EXPLAIN ANALYZE",
      "Query optimization, sargability & the N+1 problem",
      "Views & materialized views",
      "Transactions, ACID, isolation, locks & deadlocks",
      "Triggers & stored functions",
      "SQL injection & parameterized queries",
      "Soft deletes, audit columns & migrations",
      "Mini projects: e-commerce, social & food delivery",
    ],
  },
];
export const topicCount = levels.reduce(
  (total, level) => total + level.topics.length,
  0,
);
