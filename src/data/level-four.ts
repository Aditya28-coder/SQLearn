import { makeLesson, task as q } from "./lesson-builder";
export const levelFourLessons = [
  makeLesson({
    level: 4,
    slug: "give-a-query-a-name",
    title: "Give a query a name",
    description: "CTEs turn a large question into readable little steps.",
    dataset: "store",
    diagram: "flow",
    concept:
      "A common table expression, or CTE, names a query result for one statement using WITH. A recursive CTE repeats a rule, starting with a base set and finding the next related rows.",
    analogy:
      "Write a recipe as prep, mix and bake instead of one long sentence. A family tree repeats the instruction 'find each person's children'.",
    notes: [
      [
        "A name for one statement",
        "WITH totals AS (...) SELECT ... FROM totals makes a temporary query name, not a permanent table. Several CTEs can refer to earlier ones.",
      ],
      [
        "Recursion needs a starting point",
        "WITH RECURSIVE combines an anchor (the first rows) with a recursive term, often using UNION ALL. It stops when that term produces no new rows.",
      ],
      [
        "Make termination deliberate",
        "An organization tree should be acyclic. For graph data, track visited IDs or use PostgreSQL's CYCLE support so bad links do not loop forever. LIMIT is not a general replacement for a termination rule.",
      ],
      [
        "Readability and the plan",
        "A CTE is not always a stored intermediate result. PostgreSQL can inline suitable CTEs; MATERIALIZED and NOT MATERIALIZED influence that choice when applicable.",
      ],
    ],
    mistakes: [
      "Trying to use a CTE name in a later, separate statement.",
      "Writing recursion without an anchor or termination rule.",
      "Assuming WITH always makes a query faster.",
    ],
    engineering:
      "A billing report names line totals, customer totals and a final shortlist. Category trees and reporting hierarchies use bounded recursive walks.",
    recap: [
      "WITH names one statement's intermediate result.",
      "A recursive query starts at an anchor and follows a rule.",
      "Prevent cycles and inspect performance separately from readability.",
    ],
    tasks: [
      q(
        "Name the available shelf",
        "Use a CTE named ready for in-stock products. Return name,price from ready.",
        "WITH ready AS (SELECT name,price FROM products WHERE in_stock) SELECT name,price FROM ready;",
        "The outer query reads a named filtered result.",
        ["Start WITH ready AS (...).", "Select name,price from ready."],
      ),
      q(
        "A receipt-total step",
        "Use a CTE of order_id and SUM(quantity*unit_price) AS total. Return order_id,total where total > 600.",
        "WITH totals AS (SELECT order_id,SUM(quantity*unit_price) AS total FROM order_items GROUP BY order_id) SELECT order_id,total FROM totals WHERE total>600;",
        "Naming the calculation lets the final step focus on the business filter.",
        [
          "Build one total per order in WITH.",
          "The outer WHERE can use the total alias.",
        ],
      ),
      q(
        "Two readable steps",
        "Use a totals CTE per order, then a large CTE keeping total >= 900. Return order_id,total from large.",
        "WITH totals AS (SELECT order_id,SUM(quantity*unit_price) AS total FROM order_items GROUP BY order_id), large AS (SELECT * FROM totals WHERE total>=900) SELECT order_id,total FROM large;",
        "A later CTE can use the result named just before it.",
        [
          "Separate CTE definitions with a comma.",
          "Both belong after the same WITH keyword.",
        ],
      ),
      q(
        "A little counting ladder",
        "Use WITH RECURSIVE steps(n) to return n=1 through 5, in ascending order. Anchor at 1 and add 1 while n<5.",
        "WITH RECURSIVE steps(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM steps WHERE n<5) SELECT n FROM steps ORDER BY n;",
        "The predicate stops the recursion after the fifth step.",
        [
          "The recursive term reads steps.",
          "Use SELECT n+1 FROM steps WHERE n<5.",
        ],
        { ordered: true },
      ),
      q(
        "A tiny organization tree",
        "Use people(id,name,manager_id) VALUES (1,'Mira',NULL::int),(2,'Noor',1),(3,'Ira',2). Recursively return id,name,depth from the root at depth 0, ordered by id.",
        "WITH RECURSIVE people(id,name,manager_id) AS (VALUES (1,'Mira',NULL::int),(2,'Noor',1),(3,'Ira',2)), tree AS (SELECT id,name,0 AS depth FROM people WHERE manager_id IS NULL UNION ALL SELECT p.id,p.name,t.depth+1 FROM people p JOIN tree t ON p.manager_id=t.id) SELECT id,name,depth FROM tree ORDER BY id;",
        "Each round joins a person's manager to the previous round's IDs. The three acyclic rows terminate naturally.",
        [
          "Anchor at manager_id IS NULL.",
          "Join p.manager_id=t.id and add one to depth.",
        ],
        { ordered: true },
      ),
    ],
  }),
  makeLesson({
    level: 4,
    slug: "a-window-over-your-rows",
    title: "A window over your rows",
    description:
      "Rank, compare neighbors and total rows while keeping each row visible.",
    dataset: "store",
    diagram: "window",
    concept:
      "A window function calculates across related rows without collapsing them. OVER defines the window: PARTITION BY splits independent groups, ORDER BY orders their rows, and a frame chooses which nearby rows an aggregate sees.",
    analogy:
      "Keep every receipt on the desk, but slide a transparent ruler over a few at a time. Each receipt keeps its own place while you calculate a running or neighboring total.",
    notes: [
      [
        "Rows keep their identity",
        "SUM(price) OVER (PARTITION BY category) repeats a category total beside each product. GROUP BY would collapse each category to one row.",
      ],
      [
        "Three kinds of ranking",
        "ROW_NUMBER gives every row a position; RANK leaves a gap after ties; DENSE_RANK does not. Add a unique tie-breaker when you need a reproducible individual position.",
      ],
      [
        "Look next door",
        "LAG(price) sees the previous row; LEAD(price) sees the next. Boundary rows get NULL unless a default is supplied.",
      ],
      [
        "Frames matter",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW gives a running total. ROWS BETWEEN 1 PRECEDING AND CURRENT ROW gives a two-row rolling aggregate. Default ordered frames can include tied peers; write the intended frame explicitly.",
      ],
      [
        "Filter a window result outside",
        "Window functions are calculated after WHERE and grouping. Put ROW_NUMBER in a CTE or subquery, then filter rn in an outer WHERE.",
      ],
    ],
    mistakes: [
      "Putting ROW_NUMBER() directly in WHERE.",
      "Forgetting a tie-breaker for individual row positions.",
      "Expecting an ordered default frame to behave exactly like ROWS with ties.",
    ],
    engineering:
      "A feed ranks recent items per account, a report computes running revenue, and a dashboard compares each measurement to the previous one.",
    recap: [
      "OVER keeps each input row.",
      "PARTITION BY resets calculations for each group.",
      "Specify ordering and frames deliberately; filter window results outside.",
    ],
    tasks: [
      q(
        "Number the gifts",
        "Return id,name,ROW_NUMBER() OVER(ORDER BY price,id) AS position from products.",
        "SELECT id,name,ROW_NUMBER() OVER(ORDER BY price,id) AS position FROM products;",
        "The ID tie-breaker makes each position deterministic.",
        [
          "The ordering belongs inside OVER.",
          "Use ORDER BY price,id inside the window.",
        ],
      ),
      q(
        "A category total beside each gift",
        "Return id,category,SUM(price) OVER(PARTITION BY category) AS category_total.",
        "SELECT id,category,SUM(price) OVER(PARTITION BY category) AS category_total FROM products;",
        "No product row disappears; each sees its group's sum.",
        [
          "This is a window SUM, not GROUP BY.",
          "Partition the window by category.",
        ],
      ),
      q(
        "Ranks with ties",
        "Using VALUES (1,10),(2,10),(3,20) AS scores(id,score), return id,RANK() OVER(ORDER BY score) AS rank and DENSE_RANK() OVER(ORDER BY score) AS dense_rank.",
        "SELECT id,RANK() OVER(ORDER BY score) AS rank,DENSE_RANK() OVER(ORDER BY score) AS dense_rank FROM (VALUES (1,10),(2,10),(3,20)) AS scores(id,score);",
        "Ranks are 1,1,3 while dense ranks are 1,1,2. Do not add id to the rank order if score ties should remain ties.",
        [
          "Both functions see the same score ordering.",
          "Keep id out of the window ORDER BY to preserve tied ranks.",
        ],
      ),
      q(
        "The previous price",
        "Return id,price,LAG(price) OVER(ORDER BY price,id) AS previous_price from products.",
        "SELECT id,price,LAG(price) OVER(ORDER BY price,id) AS previous_price FROM products;",
        "The first product has no previous price, so its comparison value is NULL.",
        [
          "LAG reads one row backward by default.",
          "Order by price,id inside OVER.",
        ],
      ),
      q(
        "The next price",
        "Return id,LEAD(price) OVER(ORDER BY price,id) AS next_price from products.",
        "SELECT id,LEAD(price) OVER(ORDER BY price,id) AS next_price FROM products;",
        "LEAD reads forward; the last product has no following value.",
        ["Use LEAD instead of LAG.", "Keep the same stable ordering."],
      ),
      q(
        "Running shelf value",
        "Return id,SUM(price) OVER(ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total, ordered by id.",
        "SELECT id,SUM(price) OVER(ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM products ORDER BY id;",
        "The frame starts at the first ID and ends at the current product.",
        [
          "Write an explicit ROWS frame.",
          "The outer ORDER BY controls display separately.",
        ],
        { ordered: true },
      ),
      q(
        "A two-row average",
        "Return id,ROUND(AVG(price) OVER(ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW),2) AS rolling_average, ordered by id.",
        "SELECT id,ROUND(AVG(price) OVER(ORDER BY id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW),2) AS rolling_average FROM products ORDER BY id;",
        "The first row averages one value; later rows average the current and previous values.",
        [
          "Use a one-row lookback frame.",
          "ROUND the window AVG to two decimal places.",
        ],
        { ordered: true },
      ),
      q(
        "A fresh window per category",
        "Return id,category,ROW_NUMBER() OVER(PARTITION BY category ORDER BY price,id) AS position from products.",
        "SELECT id,category,ROW_NUMBER() OVER(PARTITION BY category ORDER BY price,id) AS position FROM products;",
        "Each category starts again at position 1.",
        [
          "Use both PARTITION BY and ORDER BY inside OVER.",
          "Partition by category, order by price,id.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 4,
    slug: "a-little-json-pocket",
    title: "A little JSON pocket",
    description: "Read, filter and shape JSONB details inside a row.",
    dataset: "delivery",
    diagram: "json",
    concept:
      "JSON stores nested objects and arrays; JSONB stores a parsed form that supports useful operators and indexes. Use -> to keep a JSON value and ->> to extract text. A missing key and a JSON null are different ideas, even when text extraction returns SQL NULL for both.",
    analogy:
      "A delivery has the same main columns as every other delivery, plus a little pocket for optional notes such as contactless delivery or a doorbell instruction.",
    notes: [
      [
        "JSON or text?",
        "details->'contactless' returns JSONB true. details->>'contactless' returns text 'true'. Cast extracted text when a calculation needs a number or boolean.",
      ],
      [
        "Missing is not the same as null",
        "The ? operator tests key presence. jsonb_typeof can distinguish a JSON null from another JSON type. SQL NULL means the SQL value itself is absent.",
      ],
      [
        "Containment and paths",
        "@> asks whether a JSONB object contains a smaller structure. #>> extracts text at a nested path. A GIN index can help supported containment searches, but an ordinary column is often clearer for core relational data.",
      ],
      [
        "Shape a new value",
        "jsonb_set returns an updated JSONB value; UPDATE can store it. Prefer stable columns and constraints for required business fields.",
        "SELECT jsonb_set(details,'{reviewed}','true'::jsonb,true) FROM deliveries;",
      ],
    ],
    mistakes: [
      "Comparing JSONB to unquoted SQL text without a proper cast.",
      "Assuming a missing key is the same as false.",
      "Hiding every important field in JSON instead of designing relational columns.",
    ],
    engineering:
      "A delivery app stores optional instructions in JSONB while keeping the customer ID, status and timestamp in normal indexed columns.",
    recap: [
      "-> returns JSON; ->> returns text.",
      "Test missing keys deliberately.",
      "Use JSONB for flexible details while keeping essential relationships explicit.",
    ],
    tasks: [
      q(
        "Read the note",
        "Return id,details->>'note' AS note from deliveries.",
        "SELECT id,details->>'note' AS note FROM deliveries;",
        "The note is text; rows without the key produce SQL NULL.",
        ["The ->> operator extracts text.", "Ask for the 'note' key."],
      ),
      q(
        "Who asked for contactless?",
        "Return id from deliveries where details @> '{\"contactless\":true}'::jsonb.",
        "SELECT id FROM deliveries WHERE details @> '{\"contactless\":true}'::jsonb;",
        "Containment requires a true boolean, not the string 'true'.",
        [
          "Use the JSONB containment operator @>.",
          "The right side is a JSON object cast to jsonb.",
        ],
      ),
      q(
        "Presence, not truth",
        "Return id from deliveries whose details has a contactless key, whether its value is true or false.",
        "SELECT id FROM deliveries WHERE details ? 'contactless';",
        "Key existence includes the explicitly false value too.",
        ["Do not compare the key's value.", "Use details ? 'contactless'."],
      ),
      q(
        "A nested pocket",
        'Return \'{"address":{"city":"Pune"}}\'::jsonb #>> \'{address,city}\' AS city.',
        'SELECT \'{"address":{"city":"Pune"}}\'::jsonb #>> \'{address,city}\' AS city;',
        "The path walks into address, then reads its city as text.",
        [
          "Use the text path operator #>>.",
          "The path literal is '{address,city}'.",
        ],
      ),
      q(
        "Add a flag without changing rows",
        "Return id,jsonb_set(details,'{reviewed}','true'::jsonb,true) AS updated from deliveries.",
        "SELECT id,jsonb_set(details,'{reviewed}','true'::jsonb,true) AS updated FROM deliveries;",
        "jsonb_set returns a modified object; SELECT alone does not store that change.",
        [
          "The path is an array-style literal.",
          "The third argument must be JSONB true, not SQL boolean true.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 4,
    slug: "patterns-that-answer-real-questions",
    title: "Patterns for real questions",
    description:
      "Top-N, deduplication, gaps, rolling averages, funnels and cohorts.",
    dataset: "store",
    diagram: "window",
    concept:
      "A query pattern is a reusable arrangement of simpler ideas. First define what one row means, choose a stable order, and then combine grouping, windows and joins. The business definition matters as much as the SQL.",
    analogy:
      "A recipe can become breakfast, lunch or a picnic by changing its ingredients. A ranking window can become a top-three list or a duplicate finder.",
    notes: [
      [
        "Top-N and deduplication",
        "ROW_NUMBER() per group gives an exact number of rows. RANK can include extra tied rows. To deduplicate, define the business key and an explicit winner, then keep rn=1.",
      ],
      [
        "Gaps and islands",
        "Consecutive dates shifted by their row number share a key. Deduplicate dates first, then group the equal keys into islands of activity.",
      ],
      [
        "Running versus rolling",
        "A running sum starts at the beginning. A rolling average uses a bounded frame. A ROWS frame counts observations, not calendar days; fill missing dates or use an appropriate time-based RANGE for daily reports.",
      ],
      [
        "A funnel needs ordered events",
        "A real signup → cart → purchase funnel requires event order, identity and a time window. Our delivery example is a status summary: started versus currently delivered. It does not prove a historical event sequence.",
      ],
      [
        "A cohort needs a common start",
        "Group customers by their first-order month, then count active customers in each later month. Fix the denominator to the cohort size, avoid duplicate customer counts and distinguish incomplete periods.",
      ],
    ],
    mistakes: [
      "Using ROW_NUMBER without a deterministic tie-breaker.",
      "Deleting duplicates before deciding which record should win.",
      "Calling a count of current statuses a sequenced event funnel.",
      "Treating the previous three observations as the previous three calendar days.",
    ],
    engineering:
      "Teams use these patterns for leaderboards, event cleanup, activity streaks, rolling metrics and retention reports. Definitions should live beside the dashboard so readers can interpret the result.",
    recap: [
      "Define the key, winner and time order first.",
      "Use an outer query to filter window results.",
      "Document funnel/cohort denominators and observation windows.",
    ],
    tasks: [
      q(
        "Cheapest two per category",
        "Return id,category,price for the cheapest two products per category using ROW_NUMBER ordered by price,id.",
        "WITH ranked AS (SELECT id,category,price,ROW_NUMBER() OVER(PARTITION BY category ORDER BY price,id) AS rn FROM products) SELECT id,category,price FROM ranked WHERE rn<=2;",
        "The partition resets the ranking and the outer filter keeps up to two rows per category.",
        ["Compute rn in a CTE.", "Filter rn<=2 outside that CTE."],
      ),
      q(
        "One student per repeated name",
        "From campus.students keep the earliest joined_on row per name, breaking ties by id. Return id,name,joined_on.",
        "WITH ranked AS (SELECT id,name,joined_on,ROW_NUMBER() OVER(PARTITION BY name ORDER BY joined_on,id) AS rn FROM campus.students) SELECT id,name,joined_on FROM ranked WHERE rn=1;",
        "This is a demonstration winner rule, not a claim that matching names identify the same real person.",
        [
          "Partition on name for this demonstration only.",
          "Order by joined_on,id and keep rn=1.",
        ],
      ),
      q(
        "Spot the duplicate candidates",
        "Using the same name/earliest-date rule, return id,name for rows with rn>1 in campus.students.",
        "WITH ranked AS (SELECT id,name,ROW_NUMBER() OVER(PARTITION BY name ORDER BY joined_on,id) AS rn FROM campus.students) SELECT id,name FROM ranked WHERE rn>1;",
        "These are review candidates. Two people sharing a name should not be merged automatically.",
        [
          "Keep the same stable winner order.",
          "Select the rows whose row number exceeds 1.",
        ],
      ),
      q(
        "Consecutive joining days",
        "From distinct campus.students.joined_on dates, group consecutive days into islands. Return MIN(day) AS start_day,MAX(day) AS end_day,COUNT(*) AS days.",
        "WITH dates AS (SELECT DISTINCT joined_on AS day FROM campus.students), tagged AS (SELECT day,day-ROW_NUMBER() OVER(ORDER BY day)::int AS island FROM dates) SELECT MIN(day) AS start_day,MAX(day) AS end_day,COUNT(*) AS days FROM tagged GROUP BY island;",
        "Subtracting an increasing position makes consecutive dates share an island key.",
        [
          "Deduplicate dates before numbering them.",
          "Subtract the row number cast to int from each date, then group that difference.",
        ],
      ),
      q(
        "A rolling receipt total",
        "Return order_id,ROUND(AVG(total) OVER(ORDER BY order_id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW),2) AS rolling_average from per-order item totals.",
        "WITH totals AS (SELECT order_id,SUM(quantity*unit_price) AS total FROM order_items GROUP BY order_id) SELECT order_id,ROUND(AVG(total) OVER(ORDER BY order_id ROWS BETWEEN 1 PRECEDING AND CURRENT ROW),2) AS rolling_average FROM totals;",
        "The report averages two observed orders; it is not a two-day calendar average.",
        [
          "Aggregate each order first.",
          "Apply a two-row AVG frame to those totals.",
        ],
      ),
      q(
        "A status conversion snapshot",
        "From delivery.deliveries return COUNT(*) AS started and COUNT(*) FILTER(WHERE status='delivered') AS delivered.",
        "SELECT COUNT(*) AS started,COUNT(*) FILTER(WHERE status='delivered') AS delivered FROM delivery.deliveries;",
        "This snapshot has five started rows and three currently delivered rows. Historical funnel sequencing would require an event log.",
        [
          "Both counts use the same population.",
          "FILTER restricts the second aggregate.",
        ],
      ),
      q(
        "First-order cohorts",
        "Return customer_id and DATE_TRUNC('month',MIN(ordered_on)::timestamp) AS cohort from orders, grouped by customer_id.",
        "SELECT customer_id,DATE_TRUNC('month',MIN(ordered_on)::timestamp) AS cohort FROM orders GROUP BY customer_id;",
        "Each customer's first-order month defines their cohort membership.",
        [
          "Find MIN(ordered_on) per customer.",
          "Round that first timestamp down to its month.",
        ],
      ),
      q(
        "Monthly active cohort members",
        "Return cohort,active_month,COUNT(DISTINCT customer_id) AS active_customers. Cohort is the customer's first-order month; active_month is each order month.",
        "WITH firsts AS (SELECT customer_id,DATE_TRUNC('month',MIN(ordered_on)::timestamp) AS cohort FROM orders GROUP BY customer_id), activity AS (SELECT f.cohort,DATE_TRUNC('month',o.ordered_on::timestamp) AS active_month,o.customer_id FROM orders o JOIN firsts f ON f.customer_id=o.customer_id) SELECT cohort,active_month,COUNT(DISTINCT customer_id) AS active_customers FROM activity GROUP BY cohort,active_month;",
        "Distinct customers prevent repeat orders inflating the active-member count. These sample orders all fall in one month.",
        [
          "Join each order to its customer's first-month CTE.",
          "Group by cohort and active_month and count distinct customer IDs.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 4,
    slug: "turn-rows-into-columns",
    title: "Turn rows into columns",
    description: "Pivot a small report with conditional aggregation.",
    dataset: "store",
    diagram: "group",
    concept:
      "A pivot gives known categories their own output columns. Conditional aggregation combines a condition with COUNT, SUM or AVG so each column sees only its matching rows. PostgreSQL's FILTER syntax makes that idea especially readable.",
    analogy:
      "Turn a stack of receipts into a notebook with separate columns for pending, shipped and delivered orders.",
    notes: [
      [
        "A fixed set of columns",
        "COUNT(*) FILTER(WHERE status='pending') builds one column. A query needs known column names; a dynamic pivot usually needs application-generated SQL or a different output format.",
      ],
      [
        "CASE is another route",
        "SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) expresses the same count. For money, an empty filtered SUM may be NULL; decide whether COALESCE(...,0) fits.",
      ],
      [
        "Choose the row dimension",
        "GROUP BY customer_id creates one pivoted row per customer. Without it, every selected aggregate summarizes the whole table.",
        "SELECT customer_id,COUNT(*) FILTER(WHERE status='delivered') AS delivered FROM orders GROUP BY customer_id;",
      ],
    ],
    mistakes: [
      "Filtering the entire query to one status before trying to count several statuses.",
      "Expecting NULL in a filtered SUM to mean zero automatically.",
      "Generating dynamic SQL column names from unchecked input.",
    ],
    engineering:
      "A small support report compares status counts by customer. A fixed-column export can be easier for a spreadsheet reader than many repeated category rows.",
    recap: [
      "A pivot uses one aggregate per known category.",
      "FILTER and CASE can both express conditional aggregates.",
      "GROUP BY chooses what each output row represents.",
    ],
    tasks: [
      q(
        "Two status columns",
        "Return pending and delivered counts from orders using COUNT(*) FILTER.",
        "SELECT COUNT(*) FILTER(WHERE status='pending') AS pending,COUNT(*) FILTER(WHERE status='delivered') AS delivered FROM orders;",
        "Each aggregate sees its own subset of the same order table.",
        [
          "Use two filtered counts.",
          "Keep the status tests inside FILTER, not a global WHERE.",
        ],
      ),
      q(
        "A CASE version",
        "Return SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending from orders.",
        "SELECT SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending FROM orders;",
        "A matching row contributes one; every other row contributes zero.",
        ["Build the 1/0 decision first.", "SUM the CASE expression."],
      ),
      q(
        "One report row per customer",
        "Return customer_id and counts named pending and delivered from orders, grouped by customer_id.",
        "SELECT customer_id,COUNT(*) FILTER(WHERE status='pending') AS pending,COUNT(*) FILTER(WHERE status='delivered') AS delivered FROM orders GROUP BY customer_id;",
        "The categories become columns while customer IDs remain the row dimension.",
        [
          "Add customer_id to SELECT.",
          "Group by customer_id with both filtered counts.",
        ],
      ),
      q(
        "A shelf budget pivot",
        "Return COALESCE(SUM(price) FILTER(WHERE in_stock),0) AS available and COALESCE(SUM(price) FILTER(WHERE NOT in_stock),0) AS unavailable from products.",
        "SELECT COALESCE(SUM(price) FILTER(WHERE in_stock),0) AS available,COALESCE(SUM(price) FILTER(WHERE NOT in_stock),0) AS unavailable FROM products;",
        "The same numeric calculation gets two different stock filters.",
        [
          "Each SUM has its own FILTER.",
          "COALESCE wraps the complete filtered aggregate.",
        ],
      ),
      q(
        "Categories and budgets",
        "Return category and counts small (price<300) and large (price>=300), grouped by category and ordered by category ascending.",
        "SELECT category,COUNT(*) FILTER(WHERE price<300) AS small,COUNT(*) FILTER(WHERE price>=300) AS large FROM products GROUP BY category ORDER BY category;",
        "The boundary belongs to exactly one column, so every product is counted once.",
        [
          "Use complementary price conditions.",
          "Group and then order by category.",
        ],
        { ordered: true },
      ),
    ],
  }),
];
