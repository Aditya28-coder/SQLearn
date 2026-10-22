import { makeLesson, task as q, choice } from "./lesson-builder";

export const levelTwoLessons = [
  makeLesson({
    level: 2,
    slug: "little-totals",
    title: "A few little totals",
    description:
      "COUNT, SUM, AVG, MIN and MAX turn a pile of rows into a useful answer.",
    dataset: "store",
    diagram: "group",
    concept:
      "An aggregate function combines many values into one summary. COUNT counts, SUM adds, AVG finds a mean, and MIN or MAX finds an edge. Most aggregates ignore missing values; COUNT(*) counts every row.",
    analogy:
      "Picture the shopkeeper counting products, adding price tags, and finding the cheapest gift before opening the shop.",
    notes: [
      [
        "Rows and known details",
        "COUNT(*) counts rows. COUNT(city) counts only rows with a known city; COUNT(DISTINCT city) counts different known cities.",
        "SELECT COUNT(*), COUNT(city), COUNT(DISTINCT city) FROM customers;",
      ],
      [
        "An empty basket",
        "COUNT returns zero for no matches. SUM and AVG return NULL, so use COALESCE when zero is the right business meaning.",
      ],
      [
        "Give a total a name",
        "An alias labels a calculation. AVG(price) returns a numeric mean, not the most common price. ROUND(..., 2) makes a display-friendly value.",
      ],
    ],
    mistakes: [
      "Counting a nullable column when you meant to count every row.",
      "Treating an empty SUM as zero without deciding what missing data means.",
    ],
    engineering:
      "A checkout summary totals item quantity × unit price. A monitoring screen counts failed jobs instead of downloading every row to the application.",
    recap: [
      "COUNT(*) counts rows; COUNT(column) skips NULL.",
      "SUM, AVG, MIN and MAX summarize values.",
      "An empty total can be NULL; choose a fallback thoughtfully.",
    ],
    tasks: [
      q(
        "Count the shelves",
        "Return COUNT(*) AS products from products.",
        "SELECT COUNT(*) AS products FROM products;",
        "One aggregate returns one row for all six products.",
        ["Count rows, not a nullable detail.", "Use COUNT(*) on products."],
        { checkColumnNames: true },
      ),
      q(
        "Known cities",
        "Return COUNT(city) AS known_cities from customers.",
        "SELECT COUNT(city) AS known_cities FROM customers;",
        "The customer without a city is excluded from COUNT(city).",
        [
          "Choose the city column inside COUNT.",
          "COUNT(city) ignores its NULL.",
        ],
        { checkColumnNames: true },
      ),
      q(
        "Shelf value",
        "Return SUM(price) AS total and ROUND(AVG(price),2) AS average from products.",
        "SELECT SUM(price) AS total, ROUND(AVG(price),2) AS average FROM products;",
        "SUM adds the six price tags; AVG divides their total by the number of known prices.",
        [
          "Use two aggregates in one SELECT.",
          "ROUND(AVG(price), 2) gives two decimal places.",
        ],
        { checkColumnNames: true },
      ),
      q(
        "Smallest and largest",
        "Return MIN(price) AS cheapest and MAX(price) AS priciest from products.",
        "SELECT MIN(price) AS cheapest, MAX(price) AS priciest FROM products;",
        "MIN and MAX inspect values without needing to sort the displayed rows.",
        [
          "Ask for the two ends of the price range.",
          "MIN(price), MAX(price) are the two calculations.",
        ],
        { checkColumnNames: true },
      ),
      q(
        "An empty shelf",
        "Return COALESCE(SUM(price),0) AS total for products priced below zero.",
        "SELECT COALESCE(SUM(price),0) AS total FROM products WHERE price < 0;",
        "No product matches; the empty SUM is NULL and COALESCE supplies zero.",
        ["Filter before aggregating.", "Wrap SUM(price) in COALESCE(...,0)."],
        { checkColumnNames: true },
      ),
    ],
  }),
  makeLesson({
    level: 2,
    slug: "little-groups",
    title: "Give your rows a group",
    description: "Make buckets with GROUP BY, then ask which buckets matter.",
    dataset: "store",
    diagram: "pipeline",
    concept:
      "GROUP BY makes one summary per shared value. WHERE filters individual rows before grouping; HAVING filters whole groups after their totals are calculated.",
    analogy:
      "Sort a basket of gifts by category. Remove unavailable gifts first, then keep only baskets with two or more items.",
    notes: [
      [
        "One row per bucket",
        "Every selected value must be grouped or summarized (apart from supported primary-key dependencies). Group by category to get one row per category.",
      ],
      [
        "Before and after",
        "WHERE in_stock = true removes products before COUNT runs. HAVING COUNT(*) >= 2 tests the resulting category totals.",
      ],
      [
        "The logical route",
        "Think FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. It describes query meaning, not a promise about the physical execution plan.",
        "SELECT category, COUNT(*) AS n FROM products WHERE in_stock GROUP BY category HAVING COUNT(*) >= 2;",
      ],
    ],
    mistakes: [
      "Putting COUNT(*) in WHERE instead of HAVING.",
      "Selecting name while grouping only by category: one category can contain many names.",
    ],
    engineering:
      "An analytics endpoint finds product categories with enough available stock to advertise. Filtering before a join or aggregate also avoids counting unwanted rows.",
    recap: [
      "GROUP BY turns shared values into one summary.",
      "WHERE tests rows; HAVING tests groups.",
      "ORDER BY still controls the final result order.",
    ],
    tasks: [
      q(
        "Category buckets",
        "Return category and COUNT(*) AS n per category.",
        "SELECT category, COUNT(*) AS n FROM products GROUP BY category;",
        "Each category becomes one result row.",
        ["Group on the non-aggregate column.", "Add GROUP BY category."],
      ),
      q(
        "Category prices",
        "Return category and SUM(price) AS total per category.",
        "SELECT category, SUM(price) AS total FROM products GROUP BY category;",
        "Each bucket gets its own sum.",
        [
          "SUM adds prices within each group.",
          "Select category, SUM(price), then group by category.",
        ],
      ),
      q(
        "Available baskets",
        "Count only in-stock products per category; return category, COUNT(*) AS n.",
        "SELECT category, COUNT(*) AS n FROM products WHERE in_stock = true GROUP BY category;",
        "WHERE removes the unavailable planter before counting.",
        [
          "Availability is a row-level condition.",
          "Place WHERE in_stock = true before GROUP BY.",
        ],
      ),
      q(
        "Bigger baskets",
        "Return category and COUNT(*) AS n, keeping categories with at least two in-stock products.",
        "SELECT category, COUNT(*) AS n FROM products WHERE in_stock GROUP BY category HAVING COUNT(*) >= 2;",
        "WHERE chooses stock rows; HAVING tests the category count.",
        [
          "You need both WHERE and HAVING.",
          "Use HAVING COUNT(*) >= 2 after GROUP BY.",
        ],
      ),
      q(
        "A category shortlist",
        "For in-stock products, return category and ROUND(AVG(price),2) AS average. Keep averages at least 300; sort average descending, then category ascending.",
        "SELECT category, ROUND(AVG(price),2) AS average FROM products WHERE in_stock GROUP BY category HAVING AVG(price) >= 300 ORDER BY average DESC, category ASC;",
        "HAVING uses each category's mean, and a tie-breaker keeps the shortlist stable.",
        [
          "Filter stock first, then group and test AVG.",
          "ORDER BY average DESC, category ASC comes last.",
        ],
        { ordered: true },
      ),
    ],
  }),
  makeLesson({
    level: 2,
    slug: "a-little-case",
    title: "A little if, then, else",
    description: "CASE gives a query a thoughtful decision.",
    dataset: "store",
    diagram: "flow",
    concept:
      "CASE chooses a value using conditions. SQL checks WHEN branches in order, returns the first match, and uses ELSE when nothing matches. Without ELSE, no match means NULL.",
    analogy:
      "A gift guide might call prices below ₹200 'small', below ₹400 'medium', and everything else 'special'. The first matching shelf label wins.",
    notes: [
      [
        "A decision is a value",
        "CASE is an expression: use it in SELECT, ORDER BY, or an aggregate. END closes the decision.",
      ],
      [
        "Order your checks",
        "If you test price < 400 before price < 200, a ₹150 item already matches the first branch.",
      ],
      [
        "Count conditional events",
        "SUM(CASE WHEN in_stock THEN 1 ELSE 0 END) counts available products. PostgreSQL also supports COUNT(*) FILTER (WHERE in_stock).",
        "SELECT SUM(CASE WHEN in_stock THEN 1 ELSE 0 END) AS available FROM products;",
      ],
    ],
    mistakes: [
      "Forgetting END.",
      "Leaving out ELSE when you need an explicit fallback label.",
      "Testing a broad condition before a more specific one.",
    ],
    engineering:
      "A support queue labels priorities and a dashboard counts delivered versus pending orders without several separate requests.",
    recap: [
      "CASE returns a value, not a whole query.",
      "The first true WHEN wins.",
      "ELSE supplies a fallback; END closes CASE.",
    ],
    tasks: [
      q(
        "A stock label",
        "Return id and CASE WHEN in_stock THEN 'Ready' ELSE 'Later' END AS availability for products.",
        "SELECT id, CASE WHEN in_stock THEN 'Ready' ELSE 'Later' END AS availability FROM products;",
        "A boolean condition chooses a readable label.",
        [
          "Start with CASE WHEN in_stock.",
          "Add THEN 'Ready' ELSE 'Later' END.",
        ],
        { checkColumnNames: true },
      ),
      q(
        "Small gifts",
        "Return name and a budget label: 'Small' below 200, otherwise 'Other'. Call it budget.",
        "SELECT name, CASE WHEN price < 200 THEN 'Small' ELSE 'Other' END AS budget FROM products;",
        "The boundary price 200 belongs to Other.",
        [
          "Use a strict less-than comparison.",
          "Put the condition inside CASE, then END AS budget.",
        ],
      ),
      q(
        "Three shelves",
        "Return id and size: 'Small' below 200, 'Medium' below 400, otherwise 'Special'. Alias the label size.",
        "SELECT id, CASE WHEN price < 200 THEN 'Small' WHEN price < 400 THEN 'Medium' ELSE 'Special' END AS size FROM products;",
        "Checking the smaller range first prevents it being swallowed by the larger one.",
        ["Use two WHEN branches.", "The <200 branch must appear before <400."],
      ),
      q(
        "Count ready gifts",
        "Return SUM(CASE WHEN in_stock THEN 1 ELSE 0 END) AS available from products.",
        "SELECT SUM(CASE WHEN in_stock THEN 1 ELSE 0 END) AS available FROM products;",
        "Each available product contributes one; the unavailable one contributes zero.",
        ["Turn true/false into 1/0 first.", "SUM the CASE expression."],
        { checkColumnNames: true },
      ),
      q(
        "Order priorities",
        "Return order id and priority: 1 for pending, 2 for shipped, 3 for everything else. Sort by priority then id, both ascending.",
        "SELECT id, CASE WHEN status='pending' THEN 1 WHEN status='shipped' THEN 2 ELSE 3 END AS priority FROM orders ORDER BY priority, id;",
        "A numeric CASE label gives business rules an explicit sort order.",
        [
          "Build a priority CASE with two conditions.",
          "ORDER BY priority, id gives stable ties.",
        ],
        { ordered: true },
      ),
    ],
  }),
  makeLesson({
    level: 2,
    slug: "useful-little-functions",
    title: "Useful little functions",
    description: "Shape text, calendar dates and numbers without leaving SQL.",
    dataset: "campus",
    diagram: "flow",
    concept:
      "A function takes values and gives back a calculated value. Text functions tidy names, date functions organize time, and math functions make calculations explicit. PostgreSQL treats dates and timestamps as different kinds of values.",
    analogy:
      "Think of a desk with a label maker, a calendar and a calculator. Each tool changes a detail without changing the original record.",
    notes: [
      [
        "Text tools",
        "LOWER and UPPER change case, TRIM removes surrounding spaces, LENGTH counts characters, and || joins text. NULL in a concatenation stays NULL unless you use a fallback.",
      ],
      [
        "A calendar, not text",
        "DATE_TRUNC rounds a timestamp down to a calendar boundary. EXTRACT returns a part such as the day. A timestamp with time zone represents an instant; choose a reporting time zone before grouping by day.",
        "SELECT date_trunc('month', joined_on::timestamp) FROM students;",
      ],
      [
        "Numbers and safe division",
        "ROUND formats precision; ABS measures distance from zero. Integer division truncates, so use 5.0 / 2 or cast an operand. NULLIF(denominator,0) avoids division by zero.",
      ],
    ],
    mistakes: [
      "Dividing two integers and expecting a fraction.",
      "Using text slicing for time-zone-aware calendar reports.",
      "Comparing rounded display text instead of numeric values.",
    ],
    engineering:
      "A search endpoint normalizes an email for lookup, a report groups events by month, and a checkout computes a rounded tax amount.",
    recap: [
      "Text functions return transformed values.",
      "Use actual date/time types for calendar questions.",
      "Cast for fractional division and handle a zero denominator.",
    ],
    tasks: [
      q(
        "Name labels",
        "Return id, UPPER(name) AS label from students.",
        "SELECT id, UPPER(name) AS label FROM students;",
        "UPPER changes only the returned label.",
        ["Pass name to UPPER.", "Alias the expression label."],
      ),
      q(
        "A clean greeting",
        "Return TRIM('  hello SQL  ') AS greeting and LENGTH('Trapti') AS letters.",
        "SELECT TRIM('  hello SQL  ') AS greeting, LENGTH('Trapti') AS letters;",
        "TRIM removes surrounding spaces and LENGTH counts six characters.",
        [
          "These functions work on literal text too.",
          "Select both expressions without needing FROM.",
        ],
      ),
      q(
        "Joining months",
        "Return id and DATE_TRUNC('month', joined_on::timestamp) AS month from students.",
        "SELECT id, DATE_TRUNC('month', joined_on::timestamp) AS month FROM students;",
        "Every September joining date becomes September 1 at midnight.",
        [
          "Convert the date to a timestamp for this example.",
          "Use DATE_TRUNC('month', joined_on::timestamp).",
        ],
      ),
      q(
        "Fractional division",
        "Return ROUND(5.0/2,2) AS half and ABS(-12) AS distance.",
        "SELECT ROUND(5.0/2,2) AS half, ABS(-12) AS distance;",
        "A numeric operand keeps the fractional half; ABS removes a negative sign.",
        ["5/2 would give integer division.", "Use 5.0 and ROUND(...,2)."],
      ),
      q(
        "Days since joining",
        "Return id and DATE '2026-09-30' - joined_on AS days for students who joined on or after September 7, 2026.",
        "SELECT id, DATE '2026-09-30' - joined_on AS days FROM students WHERE joined_on >= DATE '2026-09-07';",
        "Subtracting dates returns elapsed calendar days; the filter includes its boundary.",
        [
          "Subtract a date column from a DATE literal.",
          "Filter joined_on >= DATE '2026-09-07'.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 2,
    slug: "change-rows-with-care",
    title: "Change rows with care",
    description: "INSERT, UPDATE, DELETE and a habit of checking your WHERE.",
    dataset: "campus",
    diagram: "transaction",
    concept:
      "INSERT adds rows, UPDATE changes matching rows, and DELETE removes matching rows. A transaction is a group of changes you can commit together or roll back. RETURNING shows what changed.",
    analogy:
      "Edit a school register in pencil: find the right student first, make the change, check it, then decide whether to keep it.",
    notes: [
      [
        "Preview your target",
        "Run SELECT with the same WHERE first. UPDATE and DELETE without WHERE affect every row; the database does exactly what you ask.",
      ],
      [
        "Ask what changed",
        "RETURNING id, name reveals affected rows. Prefer a primary key for one-record updates rather than a name that might repeat.",
      ],
      [
        "A safe rehearsal",
        "BEGIN starts a transaction; ROLLBACK undoes its transactional changes. COMMIT keeps them. Sequences may advance even when a transaction rolls back.",
        "BEGIN; UPDATE students SET city='Pune' WHERE id=4 RETURNING id,city; ROLLBACK;",
      ],
    ],
    mistakes: [
      "Forgetting WHERE and changing the whole table.",
      "Using a repeated name as if it identified one person.",
      "Assuming a failed statement can be followed by more work without ROLLBACK.",
    ],
    engineering:
      "A profile editor updates one user by ID. An import job inserts rows and checks RETURNING values before showing a success message.",
    recap: [
      "Preview the same WHERE with SELECT.",
      "Use RETURNING to inspect the affected rows.",
      "A transaction lets you keep or undo a group of changes.",
    ],
    tasks: [
      q(
        "One new student",
        "Insert student id 9, name 'Noor', city 'Pune'. Leave other columns at their defaults.",
        "INSERT INTO students(id,name,city) VALUES (9,'Noor','Pune');",
        "Naming columns makes defaults explicit and avoids depending on table column order.",
        [
          "List id, name, city after the table name.",
          "VALUES supplies the matching three values.",
        ],
        {
          exercise: {
            setup: "",
            verify:
              "SELECT id,name,city,favorite_subject,joined_on FROM students ORDER BY id;",
          },
        },
      ),
      q(
        "A new city",
        "Change only student id 4 to city 'Pune'.",
        "UPDATE students SET city='Pune' WHERE id=4;",
        "The primary-key condition limits the change to Ishaan.",
        ["Use UPDATE ... SET.", "Add WHERE id=4, not a name filter."],
        {
          exercise: {
            setup: "",
            verify: "SELECT id,city FROM students ORDER BY id;",
          },
        },
      ),
      q(
        "Remove a scratch entry",
        "A scratch table is provided. Delete only the row with id 2 from practice_notes.",
        "DELETE FROM practice_notes WHERE id=2;",
        "The verifier inspects every remaining row, so deleting the whole table's contents will not pass.",
        [
          "Use DELETE FROM practice_notes.",
          "Protect the other note with WHERE id=2.",
        ],
        {
          exercise: {
            setup:
              "CREATE TABLE practice_notes(id int PRIMARY KEY, body text); INSERT INTO practice_notes VALUES (1,'keep'),(2,'temporary');",
            verify: "SELECT * FROM practice_notes ORDER BY id;",
          },
        },
      ),
      q(
        "A rehearsal you undo",
        "Change student 4's city to 'Pune' inside BEGIN and ROLLBACK so the original rows remain.",
        "BEGIN; UPDATE students SET city='Pune' WHERE id=4; ROLLBACK;",
        "ROLLBACK restores the original Delhi value. The task teaches the workflow; grading observes the final state, not the exact SQL text.",
        ["Start with BEGIN.", "End with ROLLBACK, not COMMIT."],
        {
          exercise: {
            setup: "",
            verify: "SELECT id,city FROM students ORDER BY id;",
          },
        },
      ),
      q(
        "A careful bulk edit",
        "For students whose city is NULL, set city to 'Not shared'. Preserve every other city.",
        "UPDATE students SET city='Not shared' WHERE city IS NULL;",
        "IS NULL finds missing values; = NULL would not match them.",
        ["The condition concerns a missing city.", "Use WHERE city IS NULL."],
        {
          exercise: {
            setup: "",
            verify: "SELECT id,city FROM students ORDER BY id;",
          },
        },
      ),
    ],
  }),
  makeLesson({
    level: 2,
    slug: "a-friendly-upsert",
    title: "A friendly UPSERT",
    description:
      "Insert a new detail, or thoughtfully update the one already there.",
    dataset: "campus",
    diagram: "flow",
    concept:
      "An UPSERT combines an insert with a chosen response to a uniqueness conflict. PostgreSQL spells it INSERT ... ON CONFLICT. EXCLUDED refers to the row you tried to insert.",
    analogy:
      "At a club sign-up desk, a new member gets a card. An existing member's ID lets you update their city rather than create a second card.",
    notes: [
      [
        "A conflict needs a rule",
        "ON CONFLICT targets a unique constraint or suitable unique index. A primary key is one such rule. A plain non-unique name column is not.",
      ],
      [
        "Two choices",
        "DO NOTHING keeps the existing row. DO UPDATE SET ... changes it. EXCLUDED.city is the proposed city, not the old stored one.",
      ],
      [
        "Keep updates narrow",
        "Choose the conflict key and update list deliberately. UPSERT is not a substitute for permissions or business validation.",
        "INSERT INTO students(id,name,city) VALUES (1,'Aanya','Jaipur') ON CONFLICT(id) DO UPDATE SET city=EXCLUDED.city;",
      ],
    ],
    mistakes: [
      "Targeting a column without uniqueness.",
      "Replacing fields with NULL when the imported row has missing values.",
      "Thinking DO NOTHING updates the old value.",
    ],
    engineering:
      "A sync job imports customer profiles repeatedly without creating duplicate primary keys. A device sends its latest status using a stable device ID.",
    recap: [
      "A unique rule identifies the conflict.",
      "DO NOTHING keeps; DO UPDATE changes.",
      "EXCLUDED contains the attempted insert's values.",
    ],
    tasks: [
      q(
        "Keep the original",
        "Try inserting id 1 with name 'Changed'; ignore the primary-key conflict.",
        "INSERT INTO students(id,name) VALUES (1,'Changed') ON CONFLICT(id) DO NOTHING;",
        "DO NOTHING leaves the original Aanya record intact.",
        ["The primary key is id.", "End with ON CONFLICT(id) DO NOTHING."],
        {
          exercise: {
            setup: "",
            verify: "SELECT id,name,city FROM students ORDER BY id;",
          },
        },
      ),
      q(
        "A new member",
        "UPSERT id 9, name 'Noor', city 'Pune'; on an id conflict update only city.",
        "INSERT INTO students(id,name,city) VALUES (9,'Noor','Pune') ON CONFLICT(id) DO UPDATE SET city=EXCLUDED.city;",
        "With no conflicting id, this follows the insert path.",
        [
          "Supply all three fields.",
          "The update branch assigns city=EXCLUDED.city.",
        ],
        {
          exercise: {
            setup: "",
            verify: "SELECT id,name,city FROM students ORDER BY id;",
          },
        },
      ),
      q(
        "A changed city",
        "UPSERT id 1, name 'Aanya', city 'Jaipur'; on conflict update only city.",
        "INSERT INTO students(id,name,city) VALUES (1,'Aanya','Jaipur') ON CONFLICT(id) DO UPDATE SET city=EXCLUDED.city;",
        "Only the city changes; favorite subject and joined date remain untouched.",
        [
          "Use id as the conflict target.",
          "Update only city, taking its value from EXCLUDED.",
        ],
        {
          exercise: {
            setup: "",
            verify: "SELECT * FROM students ORDER BY id;",
          },
        },
      ),
      choice(
        "Whose value is it?",
        "In DO UPDATE SET city=EXCLUDED.city, what does EXCLUDED.city mean?",
        [
          "The incoming city's value",
          "The old stored city's value",
          "A city removed from the results",
        ],
        0,
        "EXCLUDED is PostgreSQL's name for the proposed insert row.",
        [
          "Think about the row waiting at the sign-up desk.",
          "EXCLUDED belongs to the attempted insert.",
        ],
      ),
      q(
        "Keep a known city",
        "UPSERT id 1 with a NULL city, but preserve the old city when the incoming city is missing. Update only city.",
        "INSERT INTO students(id,name,city) VALUES (1,'Aanya',NULL) ON CONFLICT(id) DO UPDATE SET city=COALESCE(EXCLUDED.city,students.city);",
        "COALESCE chooses an incoming known city, otherwise it keeps the existing one.",
        [
          "Use both EXCLUDED.city and students.city.",
          "COALESCE(incoming, existing) handles the missing value.",
        ],
        {
          exercise: {
            setup: "",
            verify: "SELECT * FROM students ORDER BY id;",
          },
        },
      ),
    ],
  }),
];
