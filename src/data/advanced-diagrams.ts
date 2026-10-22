export const joinModes = ["INNER", "LEFT", "RIGHT", "FULL", "CROSS", "SELF"];
export const people = [
  { id: 1, name: "Aanya", city: "Pune" },
  { id: 2, name: "Kabir", city: "Mumbai" },
  { id: 3, name: "Zoya", city: "Pune" },
];
export const bookings = [
  { id: 1, course: "Art" },
  { id: 1, course: "Music" },
  { id: 4, course: "Garden" },
];
export function joinRows(mode: number) {
  if (mode === 4)
    return people.flatMap((person) =>
      bookings.map((booking) => [person.name, booking.course]),
    );
  if (mode === 5)
    return people.flatMap((a) =>
      people
        .filter((b) => a.id < b.id && a.city === b.city)
        .map((b) => [a.name, b.name]),
    );
  const matched = people.flatMap((person) =>
    bookings
      .filter((booking) => booking.id === person.id)
      .map((booking) => [person.name, booking.course]),
  );
  if (mode === 1 || mode === 3)
    matched.push(
      ...people
        .filter((person) => !bookings.some((b) => b.id === person.id))
        .map((person) => [person.name, "NULL"]),
    );
  if (mode === 2 || mode === 3)
    matched.push(
      ...bookings
        .filter((booking) => !people.some((p) => p.id === booking.id))
        .map((booking) => ["NULL", booking.course]),
    );
  return matched;
}
export const joinCaptions = [
  "INNER keeps the two matches for Aanya. A row can match more than once.",
  "LEFT also keeps Kabir and Zoya, filling the absent booking with NULL.",
  "RIGHT also keeps the Garden booking whose ID is absent from this illustrative guest list.",
  "FULL preserves unmatched rows from both lists. NULL fills the absent side.",
  "CROSS makes 3 × 3 = 9 pairs, without an ON condition.",
  "SELF uses the people list twice: match the same city and require a.id < b.id to avoid mirrored pairs.",
];
export const groupRows = [
  { name: "Aanya", city: "Pune" },
  { name: "Kabir", city: "Mumbai" },
  { name: "Meera", city: "Pune" },
  { name: "Arjun", city: "Mumbai" },
];
export const pipelineStages = [
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "SELECT",
  "ORDER BY",
  "LIMIT",
];
export const pipelineCaptions = [
  "Start with the six shop products.",
  "WHERE in_stock keeps five products; it tests individual rows.",
  "GROUP BY category makes three category buckets.",
  "HAVING COUNT(*) >= 2 keeps the two buckets with at least two available products.",
  "SELECT chooses category and its COUNT(*) summary.",
  "ORDER BY category arranges Home before Stationery.",
  "LIMIT 1 keeps just the first sorted summary: Home, 2.",
];
export const pipelineResults = [
  ["products", "6 rows"],
  ["in stock", "5 rows"],
  ["Home / Pantry / Stationery", "3 groups"],
  ["Home / Stationery", "2 groups"],
  ["category, count", "2 rows"],
  ["Home 2 / Stationery 2", "sorted"],
  ["Home", "2 products"],
];
export const windowPrices = [10, 20, 15, 30, 25];
export const flowScenes = [
  {
    label: "A nested question",
    steps: ["products", "average price", "above-average gifts"],
    caption:
      "The inner query finds one average; the outer query compares each product with that value.",
  },
  {
    label: "Named CTE steps",
    steps: ["order_items", "totals per order", "totals above 600"],
    caption:
      "A WITH name makes each intermediate result available to the rest of this one statement.",
  },
  {
    label: "Recursive tree",
    steps: ["Mira · depth 0", "Noor · depth 1", "Ira · depth 2"],
    caption:
      "Start at Mira, then follow manager links to Noor and Ira. This tiny tree has no cycle, so the recursion ends.",
  },
];
export const lessonFlows: Record<string, typeof flowScenes> = {
  "a-little-case": [
    {
      label: "A ₹150 gift",
      steps: ["price = 150", "first WHEN: price < 200", "Small"],
      caption:
        "The first condition matches, so CASE returns Small without taking a later branch.",
    },
    {
      label: "A ₹320 gift",
      steps: ["price = 320", "next WHEN: price < 400", "Medium"],
      caption:
        "The first condition is false; the next condition matches and returns Medium.",
    },
    {
      label: "A ₹550 gift",
      steps: ["price = 550", "no WHEN matches", "ELSE: Special"],
      caption:
        "No price condition matches, so ELSE supplies the fallback label Special.",
    },
  ],
  "useful-little-functions": [
    {
      label: "Text",
      steps: ["'  Aanya  '", "TRIM, then UPPER", "'AANYA'"],
      caption:
        "TRIM removes surrounding spaces; UPPER changes the returned letters to uppercase. The stored name stays unchanged.",
    },
    {
      label: "Calendar",
      steps: ["2026-09-07", "DATE_TRUNC('month', …)", "2026-09-01 00:00"],
      caption:
        "Rounding a timestamp down to its month gives the first day at midnight.",
    },
    {
      label: "Numbers",
      steps: ["5.0 / 2", "ROUND( … , 2)", "2.50"],
      caption:
        "A numeric operand preserves the fraction, and ROUND chooses two decimal places.",
    },
  ],
  "a-friendly-upsert": [
    {
      label: "A new ID",
      steps: ["incoming id 9", "no key conflict", "insert a new row"],
      caption:
        "Without a uniqueness conflict, the UPSERT follows the normal insert path.",
    },
    {
      label: "Update a known ID",
      steps: ["incoming id 1", "ON CONFLICT(id)", "update chosen columns"],
      caption:
        "The primary-key conflict activates DO UPDATE. EXCLUDED holds the proposed insert's values.",
    },
    {
      label: "Keep the old row",
      steps: ["incoming id 1", "DO NOTHING", "existing row stays"],
      caption:
        "DO NOTHING handles the conflict by keeping the existing row unchanged.",
    },
  ],
  "combine-two-lists": [
    {
      label: "UNION",
      steps: ["Aanya, Kabir", "UNION Meera, Kabir", "3 different names"],
      caption:
        "UNION keeps Aanya, Kabir and Meera once each. It removes the repeated Kabir row.",
    },
    {
      label: "UNION ALL",
      steps: [
        "Aanya, Kabir",
        "UNION ALL Meera, Kabir",
        "4 rows, including repeats",
      ],
      caption:
        "UNION ALL keeps both Kabir rows because duplicates may represent separate events.",
    },
    {
      label: "INTERSECT",
      steps: ["Aanya, Kabir", "INTERSECT Meera, Kabir", "Kabir"],
      caption:
        "Kabir appears in both lists, so INTERSECT keeps that shared row.",
    },
    {
      label: "EXCEPT",
      steps: ["Aanya, Kabir", "EXCEPT Meera, Kabir", "Aanya"],
      caption:
        "Aanya is on the first list and absent from the second. Reversing the lists changes the answer.",
    },
  ],
  "give-a-query-a-name": [flowScenes[1], flowScenes[2]],
  "a-question-inside-a-question": [
    flowScenes[0],
    {
      label: "A correlated check",
      steps: ["one customer", "EXISTS matching order?", "keep if a row exists"],
      caption:
        "The inner query refers to the current customer's ID. EXISTS cares about presence, so several orders do not duplicate that customer.",
    },
  ],
  "a-small-database-helper": [
    {
      label: "Call a function",
      steps: ["practice_double(3)", "stored function: n * 2", "6"],
      caption: "A stored function returns a value when explicitly called.",
    },
    {
      label: "A row trigger",
      steps: [
        "INSERT name = 'MIRA'",
        "BEFORE trigger function",
        "normalized = 'mira'",
      ],
      caption:
        "The table event calls the trigger function, which edits NEW and returns the row before it is stored.",
    },
  ],
  "save-a-useful-view": [
    {
      label: "Normal view",
      steps: ["read the view", "run the saved query", "currently visible rows"],
      caption:
        "A normal view saves a definition. Reading it uses underlying rows visible to the current transaction.",
    },
    {
      label: "Materialized view",
      steps: [
        "read the materialized view",
        "use its stored result",
        "last refreshed snapshot",
      ],
      caption:
        "A materialized view reads stored rows, which can be older than the source tables.",
    },
    {
      label: "Refresh",
      steps: [
        "REFRESH MATERIALIZED VIEW",
        "re-run its definition",
        "a new stored result",
      ],
      caption:
        "An explicit refresh recomputes the materialized result. Choose its freshness policy deliberately.",
    },
  ],
};
export const models = {
  Campus: {
    nodes: [
      { name: "students", fields: ["id · PK", "name", "city"] },
      {
        name: "enrollments",
        fields: ["student_id · PK, FK", "course_id · PK, FK", "score"],
      },
      { name: "courses", fields: ["id · PK", "title · UNIQUE", "teacher"] },
    ],
    edges: [
      [0, 1, "1 → many"],
      [2, 1, "1 → many"],
    ] as [number, number, string][],
    caption:
      "The enrollment bridge models many students in many courses. Its two IDs form one composite primary key.",
  },
  Shop: {
    nodes: [
      { name: "customers", fields: ["id · PK", "name", "email · UNIQUE"] },
      { name: "orders", fields: ["id · PK", "customer_id · FK", "ordered_on"] },
      {
        name: "order_items",
        fields: ["id · PK", "order_id · FK", "product_id · FK"],
      },
      { name: "products", fields: ["id · PK", "name", "price"] },
    ],
    edges: [
      [0, 1, "1 → many"],
      [1, 2, "1 → many"],
      [3, 2, "1 → many"],
    ] as [number, number, string][],
    caption:
      "One customer can place many orders. Items connect each order to products and retain the sale's unit price.",
  },
  Delivery: {
    nodes: [
      { name: "diners", fields: ["id · PK", "name", "neighborhood"] },
      {
        name: "deliveries",
        fields: ["id · PK", "diner_id · FK", "restaurant_id · FK"],
      },
      { name: "restaurants", fields: ["id · PK", "name", "cuisine"] },
      {
        name: "menu_items",
        fields: ["id · PK", "restaurant_id · FK", "price"],
      },
    ],
    edges: [
      [0, 1, "1 → many"],
      [2, 1, "1 → many"],
      [2, 3, "1 → many"],
    ] as [number, number, string][],
    caption:
      "A delivery belongs to one diner and one restaurant. Each restaurant also has many menu items.",
  },
};
export const transactionScenes = [
  {
    label: "Commit",
    caption: "Both transfer changes become visible together when A commits.",
    events: [
      ["A", "BEGIN; read 100 / 50"],
      ["A", "subtract 10 → 90 / 50"],
      ["A", "add 10 → 90 / 60"],
      ["A", "COMMIT"],
      ["B", "reads committed 90 / 60"],
    ],
  },
  {
    label: "Rollback",
    caption: "Rolling back restores the original transactional table values.",
    events: [
      ["A", "BEGIN"],
      ["A", "subtract 10 → 90 / 50"],
      ["A", "notice an incomplete transfer"],
      ["A", "ROLLBACK"],
      ["B", "reads original 100 / 50"],
    ],
  },
  {
    label: "No dirty reads",
    caption:
      "A's uncommitted 90 is hidden. A normal Read Committed SELECT in B sees the committed 100, rather than waiting for A's update.",
    events: [
      ["A", "BEGIN; row balance is 100"],
      ["A", "UPDATE balance to 90, uncommitted"],
      ["B", "SELECT sees committed 100"],
      ["A", "COMMIT"],
      ["B", "next statement can see 90"],
    ],
  },
  {
    label: "Deadlock",
    caption:
      "This is a simulated two-session lock cycle. PostgreSQL aborts one participant; applications must handle a rollback and retry the whole unit.",
    events: [
      ["A", "locks row 1"],
      ["B", "locks row 2"],
      ["A", "waits for row 2"],
      ["B", "waits for row 1 → cycle"],
      ["DB", "aborts one participant; other proceeds"],
    ],
  },
];
export const normalizationScenes = [
  {
    label: "1NF",
    before: ["student | courses", "Aanya | Art, Music"],
    after: ["student | course", "Aanya | Art", "Aanya | Music"],
    caption:
      "Replace the repeating course list with one student-course relationship per row.",
  },
  {
    label: "2NF",
    before: [
      "(student_id, course_id) → name",
      "1, 10 → Aanya",
      "1, 20 → Aanya",
    ],
    after: ["students: 1 → Aanya", "enrollments: (1,10), (1,20)"],
    caption:
      "A student's name depends on student_id alone, not the whole enrollment key. Give it a home in students.",
  },
  {
    label: "3NF",
    before: [
      "course → teacher_id, email",
      "Art → 7, teacher@test",
      "Music → 7, teacher@test",
    ],
    after: ["teachers: 7 → teacher@test", "courses: Art → 7, Music → 7"],
    caption:
      "The teacher's email depends on teacher_id. Keep that teacher fact once instead of repeating it on each course.",
  },
];
export const designScenes = [
  {
    label: "PRIMARY KEY",
    rule: "id cannot repeat or be NULL",
    good: "id 1 · first entry",
    bad: "id 1 again · rejected",
  },
  {
    label: "FOREIGN KEY",
    rule: "parent ID must exist, unless NULL is allowed",
    good: "course_id 10 · course exists",
    bad: "course_id 99 · no parent",
  },
  {
    label: "CHECK + NOT NULL",
    rule: "price is required and must be >= 0",
    good: "price 250 · accepted",
    bad: "price -5 or NULL · rejected",
  },
  {
    label: "DEFAULT",
    rule: "supply a value when the field is omitted",
    good: "done omitted → false",
    bad: "explicit NULL stays NULL if allowed",
  },
];
