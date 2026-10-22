import type { Lesson } from "./lesson-types";
import {
  anatomyQuestions,
  selectQuestions,
  whereQuestions,
  orderQuestions,
  nullQuestions,
  typeQuestions,
} from "./level-one-questions";

export const lessons: Lesson[] = [
  {
    slug: "meet-your-database",
    title: "Meet your database",
    shortTitle: "Tables & little details",
    description: "A table is a familiar idea in a new little outfit.",
    minutes: 5,
    diagram: "anatomy",
    concept:
      "A database is an organized home for information. Inside it, a table stores one kind of thing, such as students; each row is one student, and each column is a detail like their name or city.",
    analogy:
      "Picture a little school register. The database is the folder, the table is a sheet, the rows are students, and the columns are the questions at the top of the sheet.",
    notes: [
      {
        title: "One row, one thing",
        body: "Our students table has 8 rows. Two students are called Aanya, but they are different people, so each has a different id.",
      },
      {
        title: "A key that belongs to one row",
        body: "A primary key is a column (or group of columns) that uniquely identifies a row. It cannot be NULL, and its value cannot repeat. A name usually isn’t a good primary key.",
      },
      {
        title: "Your first question",
        body: "SELECT says which columns you want. FROM says where to find them. A semicolon ends the statement, and -- starts a comment that SQL ignores.",
      },
    ],
    examples: [
      {
        title: "Meet everyone",
        caption:
          "Run the query. Each result row is one student; the column labels tell you what each detail means.",
        dataset: "campus",
        sql: "-- Ask for a few familiar details.\nSELECT id, name, city\n-- Look in our student register.\nFROM students;",
      },
      {
        title: "A closer look",
        caption:
          "Change the selected columns. Notice that asking for fewer columns does not remove students.",
        dataset: "campus",
        sql: "-- Choose just two details about each student.\nSELECT name, favorite_subject\nFROM students;",
      },
    ],
    mistakes: [
      "Thinking a row and a column are the same thing: a row is one item, a column is one kind of detail.",
      "Using a name as a unique ID. Names can repeat; a primary key cannot.",
      "Spelling the table student when its real name is students.",
    ],
    engineering:
      "A profile page looks up one customer by their primary key. Two customers can share a name, but the unique ID keeps their orders and details separate.",
    recap: [
      "Database → tables → rows and columns.",
      "A primary key uniquely identifies one row.",
      "SELECT chooses details; FROM chooses their table.",
    ],
    questions: anatomyQuestions,
  },
  {
    slug: "choose-your-columns",
    title: "Choose your columns",
    shortTitle: "SELECT & friendly names",
    description: "Ask for just what you need, and give it a clear name.",
    minutes: 5,
    diagram: "projection",
    concept:
      "SELECT chooses which columns appear in your result. An alias gives a result column a temporary name, and DISTINCT removes duplicate result rows.",
    analogy:
      "Imagine ordering at a café: you can ask for the whole menu, choose a few favorites, or ask for one of each. The original menu stays the same.",
    notes: [
      {
        title: "A little list of details",
        body: "Separate column names with commas. SELECT * means every column; it is useful when exploring, but explicit columns are clearer in code.",
        sql: "SELECT name, city FROM students;",
      },
      {
        title: "A friendlier label",
        body: "AS gives a column a nickname in this result. It does not rename the stored column. Postgres allows an alias without AS, but writing AS makes your intention clearer.",
        sql: "SELECT name AS student_name FROM students;",
      },
      {
        title: "One of each complete row",
        body: "DISTINCT looks at the whole selected row. DISTINCT city, favorite_subject returns unique pairs, not just one row per city.",
        sql: "SELECT DISTINCT city FROM students;",
      },
    ],
    examples: [
      {
        title: "Names you can read at a glance",
        caption:
          "Try changing student_name to another alias. The data stays the same; the output label changes.",
        dataset: "campus",
        sql: "-- Give the output columns helpful names.\nSELECT name AS student_name, city AS hometown\nFROM students;",
      },
      {
        title: "One of each city",
        caption:
          "Compare this result with SELECT city FROM students. An unknown city appears once as NULL.",
        dataset: "campus",
        sql: "-- Collapse repeated city values in the result.\nSELECT DISTINCT city\nFROM students;",
      },
    ],
    mistakes: [
      "Forgetting a comma: SELECT name city is one column with an alias, not two columns.",
      "Assuming DISTINCT applies only to the first selected column; it applies to the entire selected row.",
      "Expecting an alias to rename the original table’s column.",
    ],
    engineering:
      "An API endpoint might select id, name and avatar_url rather than every profile column. Clear aliases also help a report say customer_name instead of an ambiguous name.",
    recap: [
      "Commas separate columns; * selects them all.",
      "AS changes a result label, not stored data.",
      "DISTINCT removes duplicate complete result rows.",
    ],
    questions: selectQuestions,
  },
  {
    slug: "find-the-right-rows",
    title: "Find the right rows",
    shortTitle: "WHERE & little conditions",
    description: "Keep the details that answer your question.",
    minutes: 5,
    diagram: "filter",
    concept:
      "WHERE filters rows by a condition—a question with a true, false, or unknown answer. Only rows where the condition is true remain in the result.",
    analogy:
      "Think of a guest list: ‘friends from Pune’ is one filter, while ‘friends from Pune or Mumbai who like Science’ combines two little ideas.",
    notes: [
      {
        title: "Compare a detail",
        body: "Use =, <> (or !=), >, >=, < and <=. Put text in single quotes: 'Pune'. Double quotes refer to names such as a column called \"City\".",
        sql: "SELECT name FROM students WHERE city = 'Pune';",
      },
      {
        title: "Combine your ideas",
        body: "AND means both must be true; OR means either may be true; NOT reverses a condition. AND is evaluated before OR, so use parentheses to make groups clear.",
        sql: "WHERE (city = 'Pune' OR city = 'Mumbai') AND favorite_subject = 'Science'",
      },
      {
        title: "A few helpful shortcuts",
        body: "IN checks a list. BETWEEN includes both endpoints. LIKE uses % for any number of characters and _ for exactly one; it is case-sensitive. IS NULL and IS NOT NULL check for missing details.",
        sql: "WHERE city IN ('Pune', 'Delhi')\n-- Other examples: id BETWEEN 3 AND 6; name LIKE 'A%'; city IS NULL",
      },
    ],
    examples: [
      {
        title: "A Pune hello",
        caption:
          "Try 'Mumbai' instead of 'Pune'. Text spelling and case matter.",
        dataset: "campus",
        sql: "-- Keep only students whose city matches.\nSELECT name, city\nFROM students\nWHERE city = 'Pune';",
      },
      {
        title: "Two ideas, together",
        caption:
          "Try removing the Science condition, then compare the results.",
        dataset: "campus",
        sql: "SELECT id, name, city, favorite_subject\nFROM students\n-- City must be in this list AND the subject must match.\nWHERE city IN ('Pune', 'Mumbai')\n  AND favorite_subject = 'Science';",
      },
    ],
    mistakes: [
      "Using double quotes for text values instead of single quotes.",
      "Writing city = NULL rather than city IS NULL.",
      "Combining AND and OR without grouping the ideas you want to keep together.",
    ],
    engineering:
      "A search screen filters products by category, price range and availability. The WHERE clause is how a developer translates those filter controls into one precise question.",
    recap: [
      "WHERE keeps rows whose condition is true.",
      "Group AND / OR ideas with parentheses.",
      "IN, BETWEEN, LIKE and IS NULL make common filters readable.",
    ],
    questions: whereQuestions,
  },
  {
    slug: "a-little-order",
    title: "A little order",
    shortTitle: "Sort, limit & turn the page",
    description: "Let the most useful rows come first.",
    minutes: 5,
    diagram: "order",
    concept:
      "ORDER BY sorts the result. LIMIT caps how many rows you see, and OFFSET skips rows so you can move to another page.",
    analogy:
      "It is like sorting a pile of recipe cards, taking the first three, then skipping those three to read the next page. You need a consistent sort before pages make sense.",
    notes: [
      {
        title: "Which way is first?",
        body: "ASC means ascending (A–Z or smallest first) and is the default. DESC means descending. A second sort column breaks ties. NULLS FIRST / LAST places unknown values explicitly.",
        sql: "ORDER BY name ASC, id ASC",
      },
      {
        title: "A page with a stable edge",
        body: "Use a unique tie-breaker such as id. For page 2 with 3 rows per page, skip the first 3 with OFFSET 3. Large offsets can be slow; later you’ll meet keyset pagination.",
        sql: "ORDER BY id LIMIT 3 OFFSET 3",
      },
      {
        title: "Written order and thinking order",
        body: "Write SELECT … FROM … WHERE … ORDER BY … LIMIT … OFFSET. Logically, SQL finds rows with FROM, filters with WHERE, chooses the SELECT values, then sorts and limits. Grouping stages join this pipeline in Level 2.",
      },
    ],
    examples: [
      {
        title: "A reliable roll call",
        caption:
          "Two students have the same name. The ID tie-breaker decides which comes first.",
        dataset: "campus",
        sql: "SELECT id, name\nFROM students\n-- Sort names, then break any name ties with ID.\nORDER BY name ASC, id ASC;",
      },
      {
        title: "The next little page",
        caption: "Change OFFSET to 0 for page 1, or 6 for page 3.",
        dataset: "campus",
        sql: "SELECT id, name\nFROM students\nORDER BY id\n-- Take three rows after skipping the first three.\nLIMIT 3 OFFSET 3;",
      },
    ],
    mistakes: [
      "Relying on the order SQL happens to return without ORDER BY.",
      "Sorting by a non-unique column without a tie-breaker when paging.",
      "Putting LIMIT before ORDER BY in the written query.",
    ],
    engineering:
      "A recent-orders screen uses ORDER BY created_at DESC, id DESC LIMIT 20. A stable tie-breaker keeps rows predictable when two orders share a timestamp; concurrent changes still need care in real pagination.",
    recap: [
      "No ORDER BY means no promised order.",
      "ASC goes up; DESC comes down; a second key breaks ties.",
      "LIMIT takes a little; OFFSET skips a little.",
    ],
    questions: orderQuestions,
  },
  {
    slug: "make-room-for-null",
    title: "Make room for unknowns",
    shortTitle: "NULL, COALESCE & NULLIF",
    description: "A missing detail is information, too.",
    minutes: 5,
    diagram: "null",
    concept:
      "NULL means a value is missing or unknown; it is not the same as zero, false, or an empty string. Ordinary comparisons with NULL produce unknown, so use IS NULL to check for it.",
    analogy:
      "Two sealed envelopes might contain the same thing, or different things. Without opening them, you can’t say they match. Unknown equals unknown is still unknown.",
    notes: [
      {
        title: "A third logical answer",
        body: "NULL = NULL returns NULL, not true. NULL IS NULL is true. WHERE keeps only true rows, so an unknown comparison does not pass. NOT unknown is still unknown.",
        sql: "SELECT NULL = NULL AS comparison, NULL IS NULL AS missing;",
      },
      {
        title: "A fallback when you need one",
        body: "COALESCE returns the first non-NULL argument. The types must be compatible. It doesn’t replace an empty string, because an empty string is still a known text value.",
        sql: "SELECT COALESCE(city, 'Not shared') FROM students;",
      },
      {
        title: "Turn a special value into NULL",
        body: "NULLIF(a, b) returns NULL if a equals b, otherwise a. You can use it to turn an empty string into NULL, or protect a denominator from being zero.",
        sql: "SELECT 12.0 / NULLIF(0, 0) AS ratio;",
      },
    ],
    examples: [
      {
        title: "A kindness in the output",
        caption:
          "Zoya’s unknown city gets a readable label. The original table stays untouched.",
        dataset: "campus",
        sql: "SELECT name,\n  -- Use the city if known; otherwise show a gentle fallback.\n  COALESCE(city, 'Not shared') AS city\nFROM students;",
      },
      {
        title: "The unknown comparison",
        caption: "Three different expressions, three useful distinctions.",
        dataset: "campus",
        sql: "SELECT\n  -- Ordinary equality cannot tell whether unknowns match.\n  NULL = NULL AS unknown_comparison,\n  -- This directly asks whether the value is missing.\n  NULL IS NULL AS is_missing,\n  -- Equal arguments become NULL.\n  NULLIF(0, 0) AS safe_denominator;",
      },
    ],
    mistakes: [
      "Treating NULL as the number zero, boolean false, or the text ''. They mean different things.",
      "Using = NULL or <> NULL instead of IS NULL or IS NOT NULL.",
      "Adding COALESCE just to hide missingness when an unknown value should remain visible.",
    ],
    engineering:
      "A customer can choose not to share a city. A profile page might display ‘Not shared,’ while a data-quality report deliberately keeps the NULL so engineers can see which details are missing.",
    recap: [
      "NULL means unknown, not zero or empty text.",
      "IS NULL checks missingness; ordinary equality cannot.",
      "COALESCE supplies a fallback; NULLIF can create a NULL.",
    ],
    questions: nullQuestions,
  },
  {
    slug: "the-right-kind-of-detail",
    title: "The right kind of detail",
    shortTitle: "Friendly data types",
    description: "Give each little value a home that suits it.",
    minutes: 5,
    diagram: "types",
    concept:
      "A data type tells Postgres what kind of value a column or expression holds, and which operations make sense for it. A cast converts a value to a type when that conversion is valid.",
    analogy:
      "It’s a set of labeled kitchen jars: one for whole numbers, one for words, one for dates. A label stops you from treating a phone number like an amount you should add up.",
    notes: [
      {
        title: "Numbers, words and flags",
        body: "integer (int) holds whole numbers; text holds words and labels; boolean holds true or false. numeric stores exact decimals, useful for prices. Integer division can discard a fractional part: 5 / 2 is 2, while 5.0 / 2 is 2.5.",
      },
      {
        title: "Days, clocks and identities",
        body: "date is a calendar day. timestamp stores a date and local clock time without a zone; timestamptz represents an instant, displayed in the current time zone. uuid stores a large identifier; a constraint still enforces uniqueness.",
      },
      {
        title: "Structured little details",
        body: "json stores JSON input text; jsonb stores a parsed representation that supports useful indexing. Both hold structured data. ->> reads a key as text. Today is a small introduction; a later lesson goes deeper.",
      },
      {
        title: "Trying a type on",
        body: "Use value::type or CAST(value AS type). pg_typeof(value)::text reports a type’s name. Some casts fail: a word like 'hello' cannot become an integer.",
        sql: "SELECT pg_typeof(42::integer)::text AS type;",
      },
    ],
    examples: [
      {
        title: "A little shelf of types",
        caption:
          "Change a cast and observe its type name. Postcodes belong in text when their leading zero matters.",
        dataset: "campus",
        sql: "SELECT\n  -- Labels can start with zero.\n  '01234'::text AS postcode,\n  -- A decimal calculation keeps the half.\n  5.0::numeric / 2 AS half,\n  -- Ask Postgres to tell us the type.\n  pg_typeof(true)::text AS flag_type;",
      },
      {
        title: "A date and a tiny preference",
        caption:
          "These are typed values, not rows from a table. SELECT can calculate an answer without FROM.",
        dataset: "campus",
        sql: "SELECT\n  -- A calendar day, without a clock.\n  '2026-09-01'::date AS first_day,\n  -- Read a named detail out of JSONB as text.\n  '{\"theme\":\"mint\"}'::jsonb ->> 'theme' AS theme;",
      },
    ],
    mistakes: [
      "Storing phone numbers or postcodes as numeric amounts when leading zeros matter.",
      "Assuming timestamp automatically carries a time zone. Plain timestamp does not.",
      "Trying to cast incompatible values, or storing everything as text and losing useful checks and operations.",
    ],
    engineering:
      "An order might use a UUID ID, numeric price, boolean paid flag and timestamptz created_at. Good types make bad data harder to store and correct calculations easier to write.",
    recap: [
      "Choose types by meaning, not just by how a value looks.",
      ":: and CAST convert valid values; pg_typeof names a type.",
      "Use exact decimals for prices, and be deliberate about time zones.",
    ],
    questions: typeQuestions,
  },
];
export const lessonMap = Object.fromEntries(
  lessons.map((lesson) => [lesson.slug, lesson]),
) as Record<string, Lesson>;
