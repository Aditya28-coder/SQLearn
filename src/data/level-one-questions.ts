import type { Question } from "./lesson-types";

type Input = Omit<
  Partial<Question>,
  "id" | "title" | "prompt" | "hints" | "explanation"
> & {
  id: string;
  title: string;
  prompt: string;
  sql: string;
  hints: [string, string];
  explanation: string;
};
function q(input: Input): Question {
  const { sql, ...rest } = input;
  return {
    dataset: "campus",
    kind: "write",
    difficulty: "easy",
    starter: "-- Your little idea goes here.\n",
    referenceSql: sql,
    solution: sql,
    ...rest,
  };
}
const names = "SELECT name FROM students";

export const anatomyQuestions: Question[] = [
  q({
    id: "anatomy-columns",
    title: "Two little details",
    prompt:
      "Return the id and name columns for every student. Any row order is fine.",
    sql: "SELECT id, name FROM students;",
    hints: [
      "SELECT names the columns you want.",
      "Use SELECT id, name followed by FROM students.",
    ],
    explanation:
      "Each returned row describes one student. The id column gives even students with the same name their own identity.",
  }),
  q({
    id: "anatomy-from",
    kind: "fill",
    title: "Where do we look?",
    prompt: "Fill the gap with the SQL word that points to a table.",
    template: "SELECT name {{blank}} students;",
    sql: names,
    solution: "FROM",
    hints: [
      "The word means ‘take the rows from this place.’",
      "It’s the four-letter word FROM.",
    ],
    explanation:
      "SELECT chooses details; FROM names the table that holds them.",
  }),
  q({
    id: "anatomy-row",
    kind: "predict",
    title: "Follow a primary key",
    prompt:
      "In the students table, which name belongs to id 3? The query below looks up that one student.",
    starter: "SELECT name FROM students WHERE id = 3;",
    sql: "SELECT name FROM students WHERE id = 3;",
    choices: [
      { label: "Aanya", sql: "SELECT 'Aanya' AS name" },
      { label: "Meera", sql: "SELECT 'Meera' AS name" },
      { label: "Kabir", sql: "SELECT 'Kabir' AS name" },
    ],
    correctChoice: 1,
    hints: [
      "Find the row whose id is 3 in the diagram or example results.",
      "That row reads 3, Meera, Pune, Science.",
    ],
    explanation:
      "A primary key points to one exact row. Here, WHERE id = 3 finds Meera; you’ll learn WHERE properly in lesson 3.",
  }),
  q({
    id: "anatomy-fix",
    kind: "fix",
    title: "A table-name hiccup",
    prompt:
      "This query names a table that isn’t there. Fix it to return every student’s name.",
    starter: "SELECT name FROM student;",
    sql: names,
    hints: [
      "Check the table name in the diagram: it ends with an s.",
      "Use FROM students, not FROM student.",
    ],
    explanation:
      "SQL needs the actual table name. Our campus table is students, in the plural.",
  }),
  q({
    id: "anatomy-rows",
    difficulty: "medium",
    title: "A little address book",
    prompt:
      "Return name and city for all 8 students. Keep rows whose city is empty, too.",
    sql: "SELECT name, city FROM students;",
    hints: [
      "Choose two columns, separated by a comma.",
      "SELECT name, city FROM students returns every row, including NULL cities.",
    ],
    explanation:
      "A column can hold an empty value, called NULL. The student’s row still exists even if one detail is missing.",
  }),
  q({
    id: "anatomy-identity",
    kind: "predict",
    difficulty: "hard",
    title: "Same name, different people",
    prompt: "Two students are named Aanya. Which IDs does this lookup return?",
    starter: "SELECT id FROM students WHERE name = 'Aanya' ORDER BY id;",
    sql: "SELECT id FROM students WHERE name = 'Aanya' ORDER BY id;",
    choices: [
      { label: "One ID: 1", sql: "SELECT 1 AS id" },
      {
        label: "Two IDs: 1 and 8",
        sql: "SELECT * FROM (VALUES (1), (8)) AS answer(id)",
      },
      { label: "One ID: 8", sql: "SELECT 8 AS id" },
    ],
    correctChoice: 1,
    ordered: true,
    hints: [
      "Names can repeat; primary keys cannot.",
      "The first and last students are different Aanyas, with IDs 1 and 8.",
    ],
    explanation:
      "A name is not a reliable unique identifier. A primary key stays unique even when names repeat. ORDER BY puts the two IDs in ascending order.",
  }),
];

export const selectQuestions: Question[] = [
  q({
    id: "select-name",
    title: "Just the names",
    prompt: "Return only the name column for every student.",
    sql: names,
    hints: [
      "You don’t need * when you want one column.",
      "Put name between SELECT and FROM students.",
    ],
    explanation:
      "Selecting only what you need makes a result easier to read and avoids sending unnecessary data.",
  }),
  q({
    id: "select-star",
    kind: "fill",
    title: "The whole little table",
    prompt: "Fill the gap with the symbol that selects every column.",
    template: "SELECT {{blank}} FROM students;",
    solution: "*",
    sql: "SELECT * FROM students;",
    hints: [
      "It’s a single character, sometimes called a star.",
      "The symbol is *.",
    ],
    explanation:
      "SELECT * returns every column. It’s handy for exploring; explicit column names are usually clearer in application code.",
  }),
  q({
    id: "select-comma",
    kind: "fix",
    title: "A comma makes a difference",
    prompt:
      "Return two columns, name and city. At the moment SQL treats city as another name for the first column.",
    starter: "SELECT name city FROM students;",
    sql: "SELECT name, city FROM students;",
    hints: [
      "SQL permits aliases without AS, so this query has only one output column.",
      "Add a comma between name and city.",
    ],
    explanation:
      "SELECT name city means ‘call the name column city.’ A comma means you want two separate columns.",
  }),
  q({
    id: "select-alias",
    difficulty: "medium",
    title: "Names that feel familiar",
    prompt:
      "Return name as student_name and city as hometown for every student. Use those exact output column names.",
    sql: "SELECT name AS student_name, city AS hometown FROM students;",
    checkColumnNames: true,
    hints: [
      "AS gives an output column a temporary name.",
      "Write name AS student_name and city AS hometown in the SELECT list.",
    ],
    explanation:
      "Aliases rename the result, not the stored table. The underlying columns are still name and city.",
  }),
  q({
    id: "select-distinct",
    kind: "fill",
    difficulty: "medium",
    title: "One of each city",
    prompt:
      "Return each different city once. Keep the single NULL entry for an unknown city.",
    template: "SELECT {{blank}} city FROM students;",
    solution: "DISTINCT",
    sql: "SELECT DISTINCT city FROM students;",
    hints: [
      "You want to remove duplicate result rows.",
      "Put DISTINCT immediately after SELECT.",
    ],
    explanation:
      "DISTINCT removes duplicate result rows. Multiple unknowns would also collapse to one NULL for this purpose.",
  }),
  q({
    id: "select-pair",
    difficulty: "hard",
    title: "Distinct pairs",
    prompt:
      "Return each distinct city-and-favorite_subject combination. Return city and favorite_subject, keeping NULL values.",
    sql: "SELECT DISTINCT city, favorite_subject FROM students;",
    hints: [
      "DISTINCT applies to the entire selected row, not just the first column.",
      "SELECT DISTINCT city, favorite_subject FROM students gives unique pairs.",
    ],
    explanation:
      "Pune + Art and Pune + Science are different pairs, so both stay. DISTINCT looks at all the selected columns together.",
  }),
];

export const whereQuestions: Question[] = [
  q({
    id: "where-equal",
    title: "A Pune hello",
    prompt: "Return name and city for students who live in Pune.",
    sql: "SELECT name, city FROM students WHERE city = 'Pune';",
    hints: [
      "WHERE keeps rows that pass a condition.",
      "Compare city to the text 'Pune', using single quotes.",
    ],
    explanation:
      "The condition is checked for each row. Aanya and Meera match; unknown cities do not.",
  }),
  q({
    id: "where-fix",
    kind: "fix",
    title: "Text needs the right quotes",
    prompt: "Fix this query to return the names of students in Mumbai.",
    starter: 'SELECT name FROM students WHERE city = "Mumbai";',
    sql: "SELECT name FROM students WHERE city = 'Mumbai';",
    hints: [
      "Double quotes name a column or table in Postgres.",
      "Use single quotes around the text value: 'Mumbai'.",
    ],
    explanation:
      "Postgres reads \"Mumbai\" as a column name. 'Mumbai' is a text value.",
  }),
  q({
    id: "where-in",
    kind: "fill",
    title: "Two favorite places",
    prompt:
      "Fill the gap with the operator that checks a list of allowed cities.",
    template:
      "SELECT name FROM students WHERE city {{blank}} ('Pune', 'Delhi');",
    solution: "IN",
    sql: "SELECT name FROM students WHERE city IN ('Pune', 'Delhi');",
    hints: [
      "It replaces several equality conditions joined with OR.",
      "The operator is IN.",
    ],
    explanation:
      "IN asks whether a value appears in a list. It’s a compact way to say city = 'Pune' OR city = 'Delhi'.",
  }),
  q({
    id: "where-between",
    difficulty: "medium",
    title: "Between two pages",
    prompt:
      "Return id and name for student IDs 3 through 6, including both endpoints.",
    sql: "SELECT id, name FROM students WHERE id BETWEEN 3 AND 6;",
    hints: [
      "BETWEEN includes both the lower and upper values.",
      "Use id BETWEEN 3 AND 6, or id >= 3 AND id <= 6.",
    ],
    explanation:
      "BETWEEN is inclusive: IDs 3, 4, 5 and 6 all belong in the result.",
  }),
  q({
    id: "where-like",
    difficulty: "medium",
    title: "Names that begin with A",
    prompt:
      "Return name for every student whose name begins with uppercase A. Keep repeated names.",
    sql: "SELECT name FROM students WHERE name LIKE 'A%';",
    hints: [
      "LIKE matches a text pattern; % means any number of characters.",
      "The pattern 'A%' means A followed by anything.",
    ],
    explanation:
      "LIKE is case-sensitive here. Both Aanyas and Arjun match. An underscore (_) would stand for exactly one character.",
  }),
  q({
    id: "where-null",
    difficulty: "medium",
    title: "A missing little detail",
    prompt: "Return name for students whose city is NULL.",
    sql: "SELECT name FROM students WHERE city IS NULL;",
    hints: ["An unknown value doesn’t compare using =.", "Use city IS NULL."],
    explanation:
      "NULL means unknown or missing. IS NULL checks for that missingness directly.",
  }),
  q({
    id: "where-logic",
    difficulty: "hard",
    title: "Keep the two ideas together",
    prompt:
      "Return name for students in Pune or Mumbai who also have Science as their favorite subject.",
    sql: "SELECT name FROM students WHERE (city = 'Pune' OR city = 'Mumbai') AND favorite_subject = 'Science';",
    hints: [
      "AND is evaluated before OR. Group the city choices with parentheses.",
      "Use (city = 'Pune' OR city = 'Mumbai') AND favorite_subject = 'Science'. IN is also fine.",
    ],
    explanation:
      "Parentheses make the two city choices one idea. Without them, a Pune student could slip through without having Science as their subject.",
  }),
  q({
    id: "where-not",
    difficulty: "hard",
    title: "Everyone except…",
    prompt:
      "Return id and name for students whose city is known and is not Delhi, and whose id is less than 7.",
    sql: "SELECT id, name FROM students WHERE city IS NOT NULL AND NOT city = 'Delhi' AND id < 7;",
    hints: [
      "You need a known city, a city exclusion, and an ID comparison joined by AND.",
      "Use city IS NOT NULL AND city <> 'Delhi' AND id < 7. != and NOT city = 'Delhi' are also valid.",
    ],
    explanation:
      "<> means ‘not equal.’ A comparison with NULL is unknown, so explicitly checking IS NOT NULL makes your intention clear.",
  }),
];

export const orderQuestions: Question[] = [
  q({
    id: "order-ids",
    title: "Latest ID first",
    prompt:
      "Return id and name for every student, ordered by id from largest to smallest.",
    sql: "SELECT id, name FROM students ORDER BY id DESC;",
    ordered: true,
    hints: [
      "ORDER BY chooses the sorting column.",
      "DESC means descending: largest first.",
    ],
    explanation:
      "Without ORDER BY, SQL does not promise a row order, even if results happened to look sorted earlier.",
  }),
  q({
    id: "order-limit",
    kind: "fill",
    title: "A small first page",
    prompt: "Fill the gap to return just the first 3 students in ID order.",
    template: "SELECT id, name FROM students ORDER BY id {{blank}} 3;",
    solution: "LIMIT",
    sql: "SELECT id, name FROM students ORDER BY id LIMIT 3;",
    ordered: true,
    hints: [
      "This word caps how many rows come back.",
      "Use LIMIT 3 after ORDER BY id.",
    ],
    explanation:
      "LIMIT makes a small result. An ORDER BY tells Postgres which rows count as ‘first.’",
  }),
  q({
    id: "order-fix",
    kind: "fix",
    title: "Put the clauses in place",
    prompt:
      "Fix the clause order to return the first 2 names alphabetically, using id as a tie-breaker.",
    starter: "SELECT name FROM students LIMIT 2 ORDER BY name, id;",
    sql: "SELECT name FROM students ORDER BY name, id LIMIT 2;",
    ordered: true,
    hints: [
      "The written order is ORDER BY, then LIMIT.",
      "Move LIMIT 2 to the end of the query.",
    ],
    explanation:
      "SQL has a written clause order. Sort first, then keep the first two rows. The ID tie-breaker makes duplicate names predictable.",
  }),
  q({
    id: "order-page",
    difficulty: "medium",
    title: "Turn the page",
    prompt:
      "Return id and name for page 2, with 3 students per page, ordered by id ascending.",
    sql: "SELECT id, name FROM students ORDER BY id LIMIT 3 OFFSET 3;",
    ordered: true,
    hints: [
      "The first page uses IDs 1–3. Skip its three rows.",
      "Use ORDER BY id LIMIT 3 OFFSET 3.",
    ],
    explanation:
      "OFFSET 3 skips the first three sorted rows. LIMIT 3 then returns IDs 4, 5 and 6. Larger offsets can become slow in a large app.",
  }),
  q({
    id: "order-ties",
    difficulty: "hard",
    title: "A reliable alphabetical list",
    prompt:
      "Return id and name for all students. Sort by name alphabetically, and put lower id first when names match.",
    sql: "SELECT id, name FROM students ORDER BY name ASC, id ASC;",
    ordered: true,
    hints: [
      "Use two sort columns, separated by a comma.",
      "ORDER BY name, id breaks the tie between the two Aanyas.",
    ],
    explanation:
      "A stable tie-breaker keeps pagination consistent. A unique ID is a useful final sorting column.",
  }),
  q({
    id: "order-null",
    difficulty: "hard",
    title: "Unknown cities can wait",
    prompt:
      "Return name and city for every student. Sort city alphabetically with NULL cities last; break city ties by id ascending.",
    sql: "SELECT name, city FROM students ORDER BY city ASC NULLS LAST, id ASC;",
    ordered: true,
    hints: [
      "You can explicitly place missing values with NULLS LAST.",
      "Use ORDER BY city ASC NULLS LAST, id ASC.",
    ],
    explanation:
      "In Postgres, ascending order already defaults to NULLS LAST. Writing it explicitly makes the intention clear, especially if the sort direction changes later.",
  }),
];

export const nullQuestions: Question[] = [
  q({
    id: "null-fallback",
    title: "A friendly fallback",
    prompt:
      "Return name and city for every student. Replace an unknown city with 'Not shared' and call that column city.",
    sql: "SELECT name, COALESCE(city, 'Not shared') AS city FROM students;",
    checkColumnNames: true,
    hints: [
      "COALESCE returns the first non-NULL value.",
      "COALESCE(city, 'Not shared') AS city supplies the label only when needed.",
    ],
    explanation:
      "COALESCE doesn’t change the stored value. It just makes the output friendlier.",
  }),
  q({
    id: "null-fix",
    kind: "fix",
    title: "An unknown isn’t an equality",
    prompt:
      "Fix this query to return names of students with no favorite subject recorded.",
    starter: "SELECT name FROM students WHERE favorite_subject = NULL;",
    sql: "SELECT name FROM students WHERE favorite_subject IS NULL;",
    hints: [
      "= NULL is never true, even for a missing value.",
      "Replace = NULL with IS NULL.",
    ],
    explanation:
      "WHERE keeps true conditions. Comparing anything to NULL produces unknown, so those rows don’t pass an equality check.",
  }),
  q({
    id: "null-truth",
    kind: "predict",
    title: "Does unknown equal unknown?",
    prompt: "What value does this query return?",
    starter: "SELECT NULL = NULL AS same;",
    sql: "SELECT NULL = NULL AS same;",
    choices: [
      { label: "true", sql: "SELECT true AS same" },
      { label: "false", sql: "SELECT false AS same" },
      { label: "NULL (unknown)", sql: "SELECT NULL::boolean AS same" },
    ],
    correctChoice: 2,
    hints: [
      "Two sealed envelopes might contain the same thing—but you don’t know.",
      "The comparison returns NULL, not true or false.",
    ],
    explanation:
      "SQL has a third logical value: unknown, represented by NULL. NULL IS NULL, however, returns true.",
  }),
  q({
    id: "null-nullif",
    kind: "fill",
    difficulty: "medium",
    title: "Turn a sentinel into missingness",
    prompt: "Fill the function name. Return NULL when the value is zero.",
    template: "SELECT {{blank}}(0, 0) AS clean_value;",
    solution: "NULLIF",
    sql: "SELECT NULLIF(0, 0) AS clean_value;",
    hints: [
      "This function compares two values and returns NULL when they match.",
      "NULLIF(0, 0) turns that sentinel zero into NULL.",
    ],
    explanation:
      "NULLIF(a, b) returns NULL if a equals b, otherwise a. It’s useful when a special value like zero means ‘not available.’",
  }),
  q({
    id: "null-division",
    difficulty: "hard",
    title: "A gentler calculation",
    prompt:
      "Return 12.0 divided by zero as a column called ratio, but turn the zero denominator into NULL so the query doesn’t fail.",
    sql: "SELECT 12.0 / NULLIF(0, 0) AS ratio;",
    checkColumnNames: true,
    hints: [
      "A division by NULL produces NULL rather than a divide-by-zero error.",
      "Put NULLIF(0, 0) in the denominator.",
    ],
    explanation:
      "NULLIF protects the division. The NULL result tells the truth: a meaningful ratio isn’t available for a zero denominator.",
  }),
  q({
    id: "null-known",
    difficulty: "hard",
    title: "Only the known details",
    prompt:
      "Return id and name for students whose city and favorite_subject are both known. Sort by id.",
    sql: "SELECT id, name FROM students WHERE city IS NOT NULL AND favorite_subject IS NOT NULL ORDER BY id;",
    ordered: true,
    hints: [
      "Test each column with IS NOT NULL.",
      "Join the two checks with AND, then ORDER BY id.",
    ],
    explanation:
      "Ishaan has an unknown subject; Zoya has an unknown city. Neither has both details recorded, so neither belongs in this result.",
  }),
];

export const typeQuestions: Question[] = [
  q({
    id: "types-int",
    kind: "fill",
    title: "A whole-number label",
    prompt:
      "Cast 42 to a whole-number type. pg_typeof returns its type name as text.",
    template: "SELECT pg_typeof(42::{{blank}})::text AS type;",
    solution: "integer",
    sql: "SELECT pg_typeof(42::integer)::text AS type;",
    hints: [
      "The type name is integer; int is a shorter spelling.",
      "Put integer or int after the :: cast operator.",
    ],
    explanation:
      "integer stores whole numbers. The :: operator asks Postgres to treat a value as a particular type, and pg_typeof tells you which type it is.",
  }),
  q({
    id: "types-text",
    kind: "fix",
    title: "Keep a postcode’s zero",
    prompt:
      "The postcode should stay as the text '01234'. Fix the cast so the leading zero survives.",
    starter: "SELECT '01234'::integer AS postcode;",
    sql: "SELECT '01234'::text AS postcode;",
    hints: [
      "A postcode is a label, not an amount you add up.",
      "Use ::text instead of ::integer.",
    ],
    explanation:
      "Numeric conversion drops the leading zero. Text keeps labels such as postcodes and phone numbers exactly as written.",
  }),
  q({
    id: "types-boolean",
    title: "A true little flag",
    dataset: "store",
    prompt: "Return name for every product whose in_stock boolean is true.",
    sql: "SELECT name FROM products WHERE in_stock = true;",
    hints: [
      "A boolean stores true or false (or NULL if allowed).",
      "Use WHERE in_stock = true. WHERE in_stock is also valid.",
    ],
    explanation:
      "A boolean is a yes/no value. The little planter is out of stock, so it is excluded.",
  }),
  q({
    id: "types-numeric",
    difficulty: "medium",
    title: "A precise little price",
    prompt:
      "Divide 10.50 by 2 using decimal arithmetic. Return the answer in a column called half_price.",
    sql: "SELECT 10.50::numeric / 2 AS half_price;",
    checkColumnNames: true,
    hints: [
      "numeric preserves decimal values; integer division can lose the fractional part.",
      "SELECT 10.50::numeric / 2 AS half_price returns 5.25.",
    ],
    explanation:
      "numeric is useful for exact decimal amounts such as prices. In contrast, 10 / 2 is integer arithmetic and starts from a different value.",
  }),
  q({
    id: "types-date",
    kind: "fill",
    difficulty: "medium",
    title: "A date without a clock",
    prompt:
      "Choose the type that stores a calendar day, without a time of day.",
    template: "SELECT '2026-09-01'::{{blank}} AS first_day;",
    solution: "date",
    sql: "SELECT '2026-09-01'::date AS first_day;",
    hints: [
      "A timestamp includes a time. This question only needs a date.",
      "Use the type date.",
    ],
    explanation:
      "date describes a calendar day. A timestamp stores a date and time; timestamptz represents an instant and displays it in the session time zone.",
  }),
  q({
    id: "types-timestamp",
    difficulty: "medium",
    title: "Keep the time, too",
    prompt:
      "Return the type name of '2026-09-01 09:30:00' cast to timestamp, as a text column called type. Use pg_typeof.",
    sql: "SELECT pg_typeof('2026-09-01 09:30:00'::timestamp)::text AS type;",
    hints: [
      "Nest the cast value inside pg_typeof(...), then cast its result to text.",
      "pg_typeof('2026-09-01 09:30:00'::timestamp)::text AS type returns the full Postgres type name.",
    ],
    explanation:
      "Plain timestamp means timestamp without time zone. For events across time zones, engineers often prefer timestamptz.",
  }),
  q({
    id: "types-uuid",
    difficulty: "hard",
    title: "An ID with room to grow",
    prompt:
      "Cast '550e8400-e29b-41d4-a716-446655440000' to uuid. Return its type name using pg_typeof(...)::text, in a column called type.",
    sql: "SELECT pg_typeof('550e8400-e29b-41d4-a716-446655440000'::uuid)::text AS type;",
    hints: [
      "uuid is an identifier type, not a whole number.",
      "Put ::uuid after the quoted value, inside pg_typeof(...).",
    ],
    explanation:
      "A UUID is a large identifier designed to make collisions very unlikely. A PRIMARY KEY or UNIQUE constraint still enforces uniqueness in your table.",
  }),
  q({
    id: "types-json",
    difficulty: "hard",
    title: "A tiny bag of details",
    prompt:
      'From the JSONB value \'{"theme":"mint"}\', read the theme as text. Name the output column theme.',
    sql: "SELECT '{\"theme\":\"mint\"}'::jsonb ->> 'theme' AS theme;",
    checkColumnNames: true,
    hints: [
      "JSONB holds structured key/value data. ->> reads a key’s value as text.",
      "Use the quoted JSON value, cast it with ::jsonb, then ->> 'theme' AS theme.",
    ],
    explanation:
      'json preserves the input JSON text; jsonb stores a parsed representation. ->> returns text, so the result is mint rather than the JSON string "mint".',
  }),
];

export const levelOneChallenge = q({
  id: "level-one-challenge",
  difficulty: "hard",
  dataset: "store",
  title: "A thoughtful little gift list",
  prompt:
    "The little shop is putting together gift pairs. Find in-stock products priced from ₹150 through ₹450 (inclusive). Return name as product and twice the price as pair_price. Sort by price ascending, then name ascending, and keep the first 3 products. Use the exact output column names.",
  sql: "SELECT name AS product, price * 2 AS pair_price\nFROM products\nWHERE in_stock = true AND price BETWEEN 150 AND 450\nORDER BY price ASC, name ASC\nLIMIT 3;",
  ordered: true,
  checkColumnNames: true,
  hints: [
    "Start with the two SELECT expressions and aliases. Filter in_stock and the inclusive price range before sorting.",
    "Use WHERE in_stock = true AND price BETWEEN 150 AND 450, then ORDER BY price, name LIMIT 3.",
  ],
  explanation:
    "You combined selection, aliases, decimal math, booleans, an inclusive filter, ordering and a limit. The postcards, notebook and tea make the shortlist, with pair prices ₹300, ₹500 and ₹640. That’s a lovely first-level toolkit.",
});

export const reviewQuestions = [
  anatomyQuestions[0],
  selectQuestions[3],
  whereQuestions[6],
  orderQuestions[3],
  nullQuestions[2],
  typeQuestions[7],
];
