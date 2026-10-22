import { makeLesson, task as q, choice } from "./lesson-builder";
const ex = (setup: string, verify: string, ordered = false) => ({
  exercise: { setup, verify },
  ordered,
});
const bookSetup =
  "CREATE TABLE practice_books(id int PRIMARY KEY,title text NOT NULL,price numeric CHECK(price>=0)); INSERT INTO practice_books VALUES(1,'Small beginnings',200),(2,'Little discoveries',350);";
export const schemaLessons = [
  makeLesson({
    level: 5,
    slug: "build-a-thoughtful-table",
    title: "Build a thoughtful table",
    description: "CREATE, ALTER, DROP and the rules that protect a row.",
    dataset: "campus",
    diagram: "design",
    concept:
      "A schema is the structure of your database: its tables, columns and rules. CREATE TABLE introduces a table, ALTER TABLE changes it, and DROP TABLE removes it. Constraints reject data that breaks your chosen rules.",
    analogy:
      "Design a registration form before people start filling it in. Required fields, unique membership numbers and valid ages keep the register useful.",
    notes: [
      [
        "Choose the shape",
        "Each column has a data type. PRIMARY KEY uniquely identifies a row and implies NOT NULL. A composite key combines several columns.",
      ],
      [
        "Rules with a purpose",
        "NOT NULL requires a value. UNIQUE prevents repeated non-NULL values by default. CHECK tests an expression; a NULL check result does not fail, so add NOT NULL when a missing value is forbidden. DEFAULT supplies a value when a column is omitted.",
      ],
      [
        "Connect and evolve",
        "FOREIGN KEY links a child to an existing parent. ALTER TABLE can add columns or constraints, but existing rows must satisfy new rules. DROP removes the table, not just its rows; review dependencies before using CASCADE.",
        "CREATE TABLE reading_list(id int PRIMARY KEY,title text NOT NULL,finished boolean DEFAULT false);",
      ],
    ],
    mistakes: [
      "Using CHECK(price>=0) as a substitute for NOT NULL.",
      "Using DROP when you meant DELETE some rows.",
      "Adding a required column without planning for existing data.",
    ],
    engineering:
      "A migration creates an orders table with keys and constraints before application code begins writing to it. Database rules protect data regardless of which service writes it.",
    recap: [
      "CREATE defines, ALTER changes, DROP removes structure.",
      "Constraints encode rules that every writer must obey.",
      "Plan how existing rows will satisfy a new constraint.",
    ],
    tasks: [
      q(
        "A new notebook table",
        "Create practice_notebook with id int PRIMARY KEY, title text NOT NULL and done boolean DEFAULT false.",
        "CREATE TABLE practice_notebook(id int PRIMARY KEY,title text NOT NULL,done boolean DEFAULT false);",
        "Naming the key, required title and default makes the intended shape explicit.",
        [
          "Use CREATE TABLE with three named columns.",
          "Attach PRIMARY KEY, NOT NULL and DEFAULT false to their columns.",
        ],
        ex(
          "",
          "SELECT col.column_name,col.data_type,col.is_nullable,col.column_default,EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=ANY(c.conkey) WHERE c.conrelid='campus.practice_notebook'::regclass AND c.contype='p' AND a.attname=col.column_name) AS primary_key FROM information_schema.columns col WHERE col.table_schema='campus' AND col.table_name='practice_notebook' ORDER BY col.ordinal_position;",
        ),
      ),
      q(
        "Add a little detail",
        "The practice_books table is provided. Add a nullable text column called note.",
        "ALTER TABLE practice_books ADD COLUMN note text;",
        "A nullable addition preserves both existing rows without needing a backfill.",
        [
          "Use ALTER TABLE, not CREATE again.",
          "ADD COLUMN note text adds the field.",
        ],
        ex(
          bookSetup,
          "SELECT id,title,price,note FROM practice_books ORDER BY id;",
        ),
      ),
      q(
        "Keep a default",
        "Insert practice_books id 3 and title 'A new page', with price 150.",
        "INSERT INTO practice_books(id,title,price) VALUES(3,'A new page',150);",
        "The primary key and required title rules are checked on insert.",
        [
          "List the three target columns.",
          "Use a fresh primary key value of 3.",
        ],
        ex(bookSetup, "SELECT * FROM practice_books ORDER BY id;"),
      ),
      choice(
        "A missing price",
        "A nullable price has CHECK(price>=0). Does inserting NULL violate that CHECK?",
        [
          "Yes, every CHECK rejects NULL",
          "No; add NOT NULL if a price is required",
          "Only if the table has an index",
        ],
        1,
        "A CHECK rejects false, not unknown. NOT NULL is a separate rule.",
        ["NULL>=0 is unknown.", "Unknown does not fail a CHECK constraint."],
      ),
      q(
        "Remove a scratch table",
        "Drop the provided practice_books table. Preserve the real students table.",
        "DROP TABLE practice_books;",
        "DROP removes the scratch structure; other dataset tables remain available.",
        [
          "Target only the provided scratch table.",
          "DROP TABLE practice_books is sufficient.",
        ],
        ex(
          bookSetup,
          "SELECT to_regclass('campus.practice_books') IS NULL AS scratch_removed,(SELECT COUNT(*) FROM students) AS students_kept;",
        ),
      ),
    ],
  }),
  makeLesson({
    level: 5,
    slug: "one-fact-one-home",
    title: "One fact, one home",
    description:
      "Normalization, from repeated lists to dependable relationships.",
    dataset: "campus",
    diagram: "normalize",
    concept:
      "Normalization arranges tables so each fact has one dependable home. It reduces update anomalies: situations where changing one fact requires edits in many places. Denormalization deliberately repeats some facts when a measured need justifies the extra maintenance.",
    analogy:
      "Keep a teacher's contact details in one address book instead of rewriting them on every student's course slip. Changing a phone number then needs one edit.",
    notes: [
      [
        "First normal form (1NF)",
        "Use one value at each row-column intersection for the chosen relational model, with no repeating column groups. Replace courses='Art,Music' with separate enrollment rows. What counts as an atomic value depends on your data model; a JSON document does not automatically solve a relational relationship.",
      ],
      [
        "Second normal form (2NF)",
        "With a composite key such as (student_id,course_id), every non-key fact should depend on the whole key. A student_name depends only on student_id, so move it to students.",
      ],
      [
        "Third normal form (3NF)",
        "Avoid non-key facts depending on other non-key facts. If a course's teacher_id determines teacher_email, put that email in teachers instead of repeating it on courses.",
      ],
      [
        "When repetition is intentional",
        "A receipt stores unit_price as a historical fact about that sale; it should not change with today's product price. A cached summary is another deliberate duplication, with an explicit refresh or update strategy.",
      ],
    ],
    mistakes: [
      "Putting several foreign keys into a comma-separated string.",
      "Treating every repeated value as a duplicate person.",
      "Denormalizing before measuring the actual query and update costs.",
    ],
    engineering:
      "A course system keeps students, courses and enrollments separate. An order line keeps its historical unit price while a product table holds the current price.",
    recap: [
      "1NF avoids repeating groups; 2NF removes partial key dependencies.",
      "3NF separates transitive non-key dependencies.",
      "Denormalize deliberately, with an owner for consistency.",
    ],
    tasks: [
      q(
        "Read the normalized bridge",
        "Return s.id,s.name,e.course_id from students joined to enrollments on the student key.",
        "SELECT s.id,s.name,e.course_id FROM students s JOIN enrollments e ON e.student_id=s.id;",
        "Names stay in students while each enrollment stores the relationship.",
        [
          "Join the normalized student and bridge tables.",
          "Match e.student_id=s.id.",
        ],
      ),
      choice(
        "A repeating list",
        "A student row stores course_ids as '1,3,4'. Which redesign is most useful for relational querying?",
        [
          "Three text columns course1/course2/course3",
          "An enrollments table with one row per student-course pair",
          "A longer comma-separated field",
        ],
        1,
        "A linking table allows any number of relationships and supports foreign keys.",
        [
          "The number of courses can vary.",
          "One relationship per row is easier to constrain and join.",
        ],
      ),
      choice(
        "A partial dependency",
        "In a table keyed by (student_id,course_id), student_name depends only on student_id. What is the problem?",
        ["A 2NF partial dependency", "A missing ORDER BY", "An index scan"],
        0,
        "A fact depending on only part of a composite key belongs with that part's entity.",
        [
          "Compare the fact with the whole key.",
          "Student name belongs to the student, not a particular enrollment.",
        ],
      ),
      choice(
        "A fact about another fact",
        "A course stores teacher_id and teacher_email, and teacher_id determines teacher_email. Where should the email usually live?",
        [
          "On every enrollment",
          "In a teachers table keyed by teacher_id",
          "In a concatenated course title",
        ],
        1,
        "The email depends on the teacher, so one teacher record avoids repeated updates.",
        [
          "Changing one teacher email should need one edit.",
          "Give that teacher fact one home.",
        ],
      ),
      q(
        "Historical price, present price",
        "Join store.order_items i to store.products p. Return i.id,i.unit_price AS sale_price,p.price AS current_price.",
        "SELECT i.id,i.unit_price AS sale_price,p.price AS current_price FROM store.order_items i JOIN store.products p ON p.id=i.product_id;",
        "A sale price and a current shelf price are different facts, even when their values happen to match.",
        [
          "The item records the price at purchase time.",
          "Join i.product_id to p.id and keep both price columns.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 5,
    slug: "a-shortcut-to-a-row",
    title: "A shortcut to a row",
    description:
      "B-tree intuition, composite indexes and the cost of keeping shortcuts.",
    dataset: "store",
    diagram: "index",
    concept:
      "An index is an extra data structure that helps PostgreSQL locate some rows without checking the entire table. A B-tree keeps keys in an ordered, balanced structure. Indexes consume space and must be maintained when indexed data changes.",
    analogy:
      "A book's index lets you jump to a topic, but somebody has to keep it accurate when pages change. Reading a tiny pamphlet from start to finish may be quicker.",
    notes: [
      [
        "Equality and ranges",
        "B-tree indexes commonly support =, ordered ranges and useful ORDER BY patterns. The planner may still choose a sequential scan for a tiny table or a filter matching most rows.",
      ],
      [
        "Two keys, one order",
        "An index on (customer_id,ordered_on) is ordered first by customer, then by date within that customer. Leading-key equality plus a date range is a natural match. Some queries can use other access strategies, so avoid treating the leftmost-prefix idea as an absolute planner rule.",
      ],
      [
        "The write tradeoff",
        "INSERT and changes to indexed keys update the index too. PostgreSQL builds indexes for primary-key and unique constraints, but does not automatically index every referencing foreign-key column.",
      ],
      [
        "Design for an actual query",
        "Choose columns from real filters, joins and ordering, then inspect EXPLAIN. Remove redundant indexes thoughtfully; adding an index is not a substitute for checking the query's result.",
      ],
    ],
    mistakes: [
      "Expecting an index to win on a six-row sample table.",
      "Creating one index per column without examining query patterns.",
      "Assuming the foreign-key constraint created an index on its child column.",
    ],
    engineering:
      "An order-history endpoint filters customer_id and an ordered_on range. A composite index can reduce the work for a large table; write-heavy imports must also pay its maintenance cost.",
    recap: [
      "Indexes trade storage and write work for useful lookup paths.",
      "Composite key order follows a specific query pattern.",
      "Inspect the planner's choice instead of forcing an index blindly.",
    ],
    tasks: [
      q(
        "A date shortcut",
        "Create a B-tree index named practice_order_date on orders(ordered_on).",
        "CREATE INDEX practice_order_date ON orders(ordered_on);",
        "B-tree is PostgreSQL's default index method.",
        [
          "Use CREATE INDEX ... ON orders.",
          "Put ordered_on inside parentheses.",
        ],
        ex(
          "",
          "SELECT a.attname,am.amname FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid JOIN pg_am am ON am.oid=c.relam CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY k(attnum,n) JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=k.attnum WHERE c.relname='practice_order_date' ORDER BY k.n;",
        ),
      ),
      q(
        "Customer, then date",
        "Create index practice_customer_date on orders(customer_id,ordered_on), in that order.",
        "CREATE INDEX practice_customer_date ON orders(customer_id,ordered_on);",
        "The first column groups a customer's entries; the second orders their dates.",
        [
          "Use two columns in one index.",
          "Write customer_id before ordered_on.",
        ],
        ex(
          "",
          "SELECT a.attname FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY k(attnum,n) JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=k.attnum WHERE c.relname='practice_customer_date' AND i.indrelid='store.orders'::regclass ORDER BY k.n;",
          true,
        ),
      ),
      choice(
        "A tiny table scan",
        "EXPLAIN still chooses Seq Scan on our six-order table after adding an index. What does that mean?",
        [
          "The index is necessarily broken",
          "The planner estimates reading the tiny table is cheaper",
          "Indexes never work on dates",
        ],
        1,
        "A sequential scan can be the sensible plan for a tiny table.",
        [
          "An index lookup has overhead too.",
          "The planner compares estimated costs.",
        ],
      ),
      q(
        "The matching lookup",
        "Return id,ordered_on for customer_id 1 with ordered_on >= September 1 and < October 1, 2026; sort by ordered_on,id.",
        "SELECT id,ordered_on FROM orders WHERE customer_id=1 AND ordered_on>=DATE '2026-09-01' AND ordered_on<DATE '2026-10-01' ORDER BY ordered_on,id;",
        "An equality on the leading key followed by a date range fits the composite index's ordering.",
        [
          "Use a half-open date range.",
          "Match customer_id first and keep the raw date column in the comparisons.",
        ],
        { ordered: true },
      ),
      choice(
        "The cost of a shortcut",
        "What is a common cost of adding several indexes?",
        [
          "Extra storage and maintenance during writes",
          "Automatic removal of all constraints",
          "Every SELECT becomes slower by definition",
        ],
        0,
        "Each useful index needs storage and must reflect changes to its indexed data.",
        [
          "An index is extra stored structure.",
          "Writes must keep that structure accurate.",
        ],
      ),
    ],
    examples: [
      {
        title: "Look at the available plan",
        caption:
          "A sequential scan is sensible for this tiny sample. Costs are estimates, not milliseconds.",
        dataset: "store",
        sql: "-- Ask how PostgreSQL expects to find these orders.\nEXPLAIN SELECT id,ordered_on FROM orders WHERE customer_id=1;",
      },
      {
        title: "A composite shortcut",
        caption:
          "Create a scratch index, inspect the plan, then roll it back. A small table may still use a sequential scan.",
        dataset: "store",
        sql: "BEGIN;\nCREATE INDEX practice_demo_idx ON orders(customer_id,ordered_on);\nEXPLAIN SELECT id FROM orders WHERE customer_id=1 AND ordered_on>=DATE '2026-09-01';\nROLLBACK;",
      },
    ],
  }),
  makeLesson({
    level: 5,
    slug: "read-a-querys-plan",
    title: "Read a query’s plan",
    description: "EXPLAIN makes the database's route visible.",
    dataset: "store",
    diagram: "index",
    concept:
      "A query plan is a tree of operations PostgreSQL chooses to produce your result. EXPLAIN shows estimates. EXPLAIN ANALYZE actually runs the statement and adds measurements, so use special care with writes.",
    analogy:
      "EXPLAIN is a route planner's prediction. EXPLAIN ANALYZE is the trip log after taking the route; seeing the log means the trip actually happened.",
    notes: [
      [
        "Read the leaves upward",
        "Scan nodes find rows; joins combine them; aggregate and sort nodes shape the result. Indentation shows parent-child structure. Data generally flows from child nodes to their parents.",
      ],
      [
        "Estimate versus measurement",
        "cost=a..b is estimated startup and total cost in planner units, not milliseconds. rows and width are estimates. With ANALYZE, actual time is in milliseconds and loops tells you how often a node ran; node row/time figures are per-loop averages.",
      ],
      [
        "Look for mismatches",
        "Large estimated-versus-actual row differences can signal poor statistics or a misunderstood filter. Repeated inner loops can reveal expensive work. BUFFERS adds buffer activity; this tiny in-browser dataset is for reading plans, not production benchmarking.",
      ],
      [
        "ANALYZE does execute",
        "EXPLAIN ANALYZE UPDATE changes rows unless you deliberately roll its transaction back. Plan timing changes across runs, so our practice checks query meaning or plan concepts instead of matching timing text.",
      ],
    ],
    mistakes: [
      "Reading cost as elapsed milliseconds.",
      "Assuming EXPLAIN ANALYZE is a harmless preview of a DELETE.",
      "Comparing tiny WASM timing numbers with production database performance.",
    ],
    engineering:
      "Before changing a slow query, an engineer captures its plan on representative data, checks row estimates and repeated work, then measures an intentional change.",
    recap: [
      "EXPLAIN predicts; EXPLAIN ANALYZE executes and measures.",
      "Read scan/join/aggregate structure from the child nodes upward.",
      "Check row estimates, loops and actual work on representative data.",
    ],
    tasks: [
      q(
        "The query behind the plan",
        "Return id,name,price for products with price >= 400. This is the result whose plan you will inspect in the example.",
        "SELECT id,name,price FROM products WHERE price>=400;",
        "Understand the intended answer before optimizing its plan.",
        ["Select the three requested columns.", "The filter is price>=400."],
      ),
      choice(
        "Cost units",
        "A plan says cost=0.00..12.50. Is 12.50 the measured runtime in milliseconds?",
        [
          "Yes",
          "No, it is an estimated planner cost",
          "It is the number of rows",
        ],
        1,
        "Planner costs are relative estimates; actual time requires ANALYZE.",
        [
          "Look for the word estimated.",
          "Only actual time reports execution timing.",
        ],
      ),
      choice(
        "Does it run?",
        "What happens with EXPLAIN ANALYZE DELETE FROM a_table?",
        [
          "It only prints a prediction",
          "It executes the DELETE while measuring it",
          "It makes a backup first",
        ],
        1,
        "ANALYZE executes the statement, including its write effects.",
        [
          "ANALYZE needs a real execution to measure.",
          "Use an intentional rollback when rehearsing writes.",
        ],
      ),
      q(
        "A selective lookup",
        "Return id,status from orders for the exact primary key id=103.",
        "SELECT id,status FROM orders WHERE id=103;",
        "A known primary-key lookup is a natural candidate for an index path on a larger table.",
        ["Choose the stable unique key.", "WHERE id=103 limits the result."],
      ),
      choice(
        "Repeated work",
        "An inner plan node has actual rows=2 and loops=100. Roughly how many rows did it produce across all loops?",
        ["2", "100", "200"],
        2,
        "Actual rows is per-loop average, so approximately 2 × 100 rows were produced.",
        [
          "The node ran more than once.",
          "Multiply the per-loop figure by the number of loops.",
        ],
      ),
    ],
    examples: [
      {
        title: "A predicted route",
        caption:
          "Read the scan and filter lines. Estimated cost uses planner units.",
        dataset: "store",
        sql: "-- Predict how the filter is applied.\nEXPLAIN SELECT id,name,price FROM products WHERE price>=400;",
      },
      {
        title: "A measured read",
        caption:
          "This is a SELECT, so measuring it does not change rows. Timings depend on this device and run.",
        dataset: "store",
        sql: "-- Execute the read and show measurements.\nEXPLAIN (ANALYZE, BUFFERS) SELECT id,status FROM orders WHERE id=103;",
      },
    ],
  }),
  makeLesson({
    level: 5,
    slug: "make-less-work-for-sql",
    title: "Make less work for SQL",
    description:
      "Useful columns, index-friendly conditions and one query instead of N+1.",
    dataset: "store",
    diagram: "pipeline",
    concept:
      "Optimization starts with a correct query and a measured bottleneck. Return only needed columns and rows. A sargable condition is one an index can use as a search argument, often by comparing an indexed column directly with a value or range.",
    analogy:
      "Give a librarian the shelf number and a short reading list instead of asking them to open every book and then bring the entire library home.",
    notes: [
      [
        "Select what the screen needs",
        "SELECT * can transfer unused data and couples consumers to schema changes. Explicit columns document a contract; selecting every column is still reasonable when you actually need them.",
      ],
      [
        "Keep a searchable range",
        "WHERE ordered_on >= DATE '2026-09-01' AND ordered_on < DATE '2026-10-01' can use a normal date index. Applying a function to the column may require an expression index instead.",
      ],
      [
        "The N+1 pattern",
        "One query loads N customers, then N more queries load each customer's order count. A grouped join or one batched IN query can do that work in fewer round trips. Avoid multiplying rows when fetching several one-to-many relationships.",
      ],
      [
        "Measure the whole tradeoff",
        "An index on LOWER(email) can support that expression; a plain email index may not. LIMIT without a stable ORDER BY is not predictable pagination. Prefer keyset pagination for deep, ordered feeds when the product supports it.",
      ],
    ],
    mistakes: [
      "Optimizing a query before checking its result.",
      "Assuming a function-wrapped column always uses the ordinary column index.",
      "Replacing N+1 with a huge join that accidentally multiplies totals.",
    ],
    engineering:
      "A customer list endpoint gets each user's order count in one grouped query, returns only visible fields, and filters date ranges in a way its actual indexes can support.",
    recap: [
      "Start with correct results and a measured bottleneck.",
      "Keep searchable columns direct or create a matching expression index.",
      "Batch related work to avoid N+1 round trips.",
    ],
    tasks: [
      q(
        "A smaller payload",
        "Return only id,name from customers in Pune.",
        "SELECT id,name FROM customers WHERE city='Pune';",
        "The endpoint gets the two requested fields instead of unused emails and cities.",
        ["Use an explicit SELECT list.", "Filter city='Pune'."],
      ),
      q(
        "An index-friendly month",
        "Return id from orders placed in September 2026 using a half-open date range.",
        "SELECT id FROM orders WHERE ordered_on>=DATE '2026-09-01' AND ordered_on<DATE '2026-10-01';",
        "Direct comparisons can match a normal ordered_on index and include every September date.",
        [
          "Use >= for the beginning and < for the next month.",
          "Do not wrap ordered_on in a month function.",
        ],
      ),
      q(
        "One grouped request",
        "Return c.id,c.name,COUNT(o.id) AS order_count for all customers, including zero orders.",
        "SELECT c.id,c.name,COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id,c.name;",
        "COUNT(o.id) ignores the NULL-extended unmatched row, so Sara gets zero.",
        [
          "Preserve customers with LEFT JOIN.",
          "Count the optional order ID, not COUNT(*).",
        ],
      ),
      q(
        "A stable next page",
        "Return id,ordered_on for orders whose (ordered_on,id) is after ('2026-09-12',102), sorted by ordered_on,id, limited to 2.",
        "SELECT id,ordered_on FROM orders WHERE (ordered_on,id)>(DATE '2026-09-12',102) ORDER BY ordered_on,id LIMIT 2;",
        "The compound cursor handles ties and avoids skipping a growing number of earlier rows.",
        [
          "Compare the same key pair used for ordering.",
          "Use the tuple (ordered_on,id) > (DATE '2026-09-12',102).",
        ],
        { ordered: true },
      ),
      choice(
        "A function and its index",
        "A large query often filters LOWER(email)=$1. What may help after measuring its plan?",
        [
          "A matching expression index on LOWER(email)",
          "An index only on an unrelated city column",
          "Removing the WHERE clause",
        ],
        0,
        "An expression index stores the function result used by the search condition.",
        [
          "The indexed expression should match the filter.",
          "Consider CREATE INDEX ... ON customers(LOWER(email)).",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 5,
    slug: "save-a-useful-view",
    title: "Save a useful view",
    description:
      "Views name a query; materialized views keep a refreshable result.",
    dataset: "store",
    diagram: "flow",
    concept:
      "A view is a stored query definition you can read like a table. A materialized view stores its query's result and needs a refresh to reflect later changes. Neither is automatically a replacement for appropriate permissions or a well-designed query.",
    analogy:
      "A view is a recipe card you follow each time. A materialized view is the prepared meal in the fridge: quick to serve, but it reflects when you last cooked it.",
    notes: [
      [
        "A reusable definition",
        "CREATE VIEW ready_gifts AS SELECT ... gives repeated logic a name. A normal view usually reads current underlying rows when queried, with the surrounding transaction's visibility rules.",
      ],
      [
        "A stored snapshot",
        "CREATE MATERIALIZED VIEW stores the result. REFRESH MATERIALIZED VIEW recomputes it; choose an acceptable freshness interval. PostgreSQL's concurrent refresh has additional requirements, including a suitable unique index.",
      ],
      [
        "Name the contract",
        "Use explicit view columns and document their meaning. Dropping or changing a source column can affect dependent views. Some simple views are updatable, but aggregate views generally are not directly updatable.",
      ],
    ],
    mistakes: [
      "Expecting a materialized view to update automatically.",
      "Assuming every view stores its result rows.",
      "Using a view as an unexamined security boundary.",
    ],
    engineering:
      "A reporting system materializes an expensive daily summary, while a normal view gives several endpoints the same definition of an available product.",
    recap: [
      "A normal view stores a definition, not a precomputed result.",
      "A materialized view needs deliberate refreshes.",
      "Document view columns, freshness and dependencies.",
    ],
    tasks: [
      q(
        "A shelf view",
        "Create practice_ready as a view returning id,name,price from in-stock products.",
        "CREATE VIEW practice_ready AS SELECT id,name,price FROM products WHERE in_stock;",
        "The view names the current available shelf.",
        [
          "CREATE VIEW ... AS introduces its SELECT.",
          "Filter in_stock in the definition.",
        ],
        ex(
          "",
          "SELECT id,name,price,(SELECT relkind::text FROM pg_class WHERE oid='store.practice_ready'::regclass) AS object_kind FROM practice_ready ORDER BY id;",
        ),
      ),
      q(
        "A category snapshot",
        "Create materialized view practice_totals with category and COUNT(*) AS n per product category.",
        "CREATE MATERIALIZED VIEW practice_totals AS SELECT category,COUNT(*) AS n FROM products GROUP BY category;",
        "The aggregate's rows are stored at creation time.",
        ["Use CREATE MATERIALIZED VIEW ... AS.", "Group products by category."],
        ex(
          "",
          "SELECT category,n,(SELECT relkind::text FROM pg_class WHERE oid='store.practice_totals'::regclass) AS object_kind FROM practice_totals ORDER BY category;",
        ),
      ),
      choice(
        "An old snapshot",
        "A new product is inserted after a materialized view was created. What makes the stored result reflect it?",
        ["Reading it once", "REFRESH MATERIALIZED VIEW", "Renaming a column"],
        1,
        "A refresh recomputes the materialized result from its definition.",
        [
          "The stored rows do not update themselves.",
          "The refresh command rebuilds the snapshot.",
        ],
      ),
      q(
        "Refresh a count",
        "A provided materialized view practice_count stores product count. Insert product 7, name 'New bookmark', category 'Stationery', price 90, then refresh practice_count.",
        "INSERT INTO products(id,name,category,price) VALUES(7,'New bookmark','Stationery',90); REFRESH MATERIALIZED VIEW practice_count;",
        "The count becomes seven only after both the insert and refresh.",
        [
          "Insert the new row first.",
          "REFRESH MATERIALIZED VIEW practice_count follows the insert.",
        ],
        ex(
          "CREATE MATERIALIZED VIEW practice_count AS SELECT COUNT(*) AS n FROM products;",
          "SELECT n FROM practice_count;",
        ),
      ),
      q(
        "Read through a normal view",
        "A practice_ready view is provided. Change product 4 to in_stock=true; the normal view should include it immediately.",
        "UPDATE products SET in_stock=true WHERE id=4;",
        "A normal view reads the underlying product rows, so it needs no refresh.",
        [
          "Update the underlying products table.",
          "Use WHERE id=4 to preserve other stock flags.",
        ],
        ex(
          "CREATE VIEW practice_ready AS SELECT id,name FROM products WHERE in_stock;",
          "SELECT id,name FROM practice_ready ORDER BY id;",
        ),
      ),
    ],
  }),
];
