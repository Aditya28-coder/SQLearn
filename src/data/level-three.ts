import { makeLesson, task as q, choice } from "./lesson-builder";
export const levelThreeLessons = [
  makeLesson({
    level: 3,
    slug: "how-tables-belong",
    title: "How tables belong together",
    description: "One-to-one, one-to-many and many-to-many relationships.",
    dataset: "campus",
    diagram: "relationships",
    concept:
      "A relationship says how records belong together. A foreign key requires a referenced record to exist. One-to-many puts a parent's ID on many child rows; many-to-many uses a linking table with two foreign keys.",
    analogy:
      "One student can enroll in several courses, and one course can welcome several students. The enrollment list is the bridge between their two registers.",
    notes: [
      [
        "One-to-one",
        "A student profile can have student_id as both its primary key and a foreign key. That uniqueness allows at most one profile per student; it does not force every student to have a profile.",
      ],
      [
        "One-to-many",
        "One restaurant has many menu items. menu_items.restaurant_id points to restaurants.id. A foreign key can be NULL unless NOT NULL is added.",
      ],
      [
        "Many-to-many",
        "enrollments links student_id and course_id. Its composite primary key prevents the same pair being registered twice.",
        "SELECT student_id, course_id FROM enrollments;",
      ],
    ],
    mistakes: [
      "Storing comma-separated course IDs in a text field.",
      "Thinking a foreign key is automatically unique or automatically indexed in PostgreSQL.",
      "Assuming a nullable foreign key requires a parent when it is NULL.",
    ],
    engineering:
      "A shopping app uses customer → orders → order_items. Many-to-many tags use a product_tags bridge; a UNIQUE foreign key can model a one-to-one settings record.",
    recap: [
      "A foreign key protects a reference.",
      "A unique foreign key limits a relationship to one-to-one.",
      "A bridge table models many-to-many and can hold details such as a score.",
    ],
    tasks: [
      q(
        "Find a student's bridges",
        "Return course_id and score for student_id 1 from enrollments.",
        "SELECT course_id,score FROM enrollments WHERE student_id=1;",
        "Two bridge rows can belong to one student.",
        ["The linking table is enrollments.", "Filter student_id=1."],
      ),
      q(
        "Count course members",
        "Return course_id and COUNT(*) AS members from enrollments, grouped by course_id.",
        "SELECT course_id,COUNT(*) AS members FROM enrollments GROUP BY course_id;",
        "Each enrollment belongs to one course, so grouping gives each populated course's membership count.",
        ["Count linking-table rows.", "Group by course_id."],
      ),
      choice(
        "A profile per person",
        "What additional rule on profiles.student_id makes the foreign key at most one-to-one?",
        ["UNIQUE or PRIMARY KEY", "DEFAULT 1", "An ORDER BY clause"],
        0,
        "The foreign key checks existence; uniqueness prevents two profiles sharing one student ID.",
        [
          "Existence and uniqueness are different rules.",
          "A UNIQUE value cannot appear in two non-NULL rows.",
        ],
      ),
      choice(
        "A pair, once",
        "Why use PRIMARY KEY(student_id,course_id) on enrollments?",
        [
          "Every student can take only one course",
          "The same student-course pair cannot repeat",
          "Course titles must be unique",
        ],
        1,
        "Each student can appear in many different pairs; each pair itself must be unique.",
        [
          "A composite key is a combination.",
          "Only repeating both values would conflict.",
        ],
      ),
      q(
        "Who is still deciding?",
        "Return students.id and students.name for students with no enrollment, using NOT EXISTS.",
        "SELECT s.id,s.name FROM students s WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id=s.id);",
        "Zoya is preserved because there is no matching bridge row.",
        [
          "Start from students, not enrollments.",
          "Correlate e.student_id with s.id inside NOT EXISTS.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 3,
    slug: "bring-two-tables-together",
    title: "Bring two tables together",
    description: "Six join types, and the rows each one keeps.",
    dataset: "store",
    diagram: "joins",
    concept:
      "A JOIN matches rows using a condition. INNER keeps matches; LEFT and RIGHT also keep unmatched rows on one chosen side; FULL keeps unmatched rows on both. CROSS makes every pair, and a self join matches a table to itself using different aliases.",
    analogy:
      "Match a guest list to a bookings list. An inner join shows booked guests; a left join keeps everyone on the guest list, even someone who hasn't booked.",
    notes: [
      [
        "One match can become several rows",
        "A customer with two orders appears twice in a join result. This is expected, not automatically a duplicate to remove.",
      ],
      [
        "Preserve the right things",
        "With a LEFT JOIN, filtering o.status in WHERE can remove the NULL-extended unmatched rows. Put a child restriction in ON when you still want to keep every parent.",
      ],
      [
        "Six ways to match",
        "A Venn diagram is only a membership reminder; real SQL joins match rows and can multiply them. Use explicit ON conditions and table aliases.",
        "SELECT c.name,o.id FROM customers c LEFT JOIN orders o ON o.customer_id=c.id;",
      ],
    ],
    mistakes: [
      "Forgetting ON and accidentally making every combination.",
      "Using DISTINCT to hide an incorrect join condition.",
      "Filtering the optional side of a LEFT JOIN in WHERE and losing unmatched parents.",
    ],
    engineering:
      "An order history uses INNER JOIN for real orders. A customer-admin screen uses LEFT JOIN to include people who have never ordered.",
    recap: [
      "INNER keeps matches; outer joins preserve specified sides.",
      "NULLs fill the absent side of an outer join.",
      "CROSS multiplies rows; SELF uses aliases for two roles.",
    ],
    tasks: [
      q(
        "Orders meet people",
        "Return o.id AS order_id and c.name for orders matched to customers using INNER JOIN.",
        "SELECT o.id AS order_id,c.name FROM orders o INNER JOIN customers c ON c.id=o.customer_id;",
        "The customer ID is the relationship, not a matching name.",
        ["Join orders.customer_id to customers.id.", "Use aliases o and c."],
        { checkColumnNames: true },
      ),
      q(
        "Keep every customer",
        "Return c.id AS customer_id and o.id AS order_id with customers on the LEFT, including customers without orders.",
        "SELECT c.id AS customer_id,o.id AS order_id FROM customers c LEFT JOIN orders o ON o.customer_id=c.id;",
        "Sara's row has a NULL order ID; Anika has two matches.",
        [
          "Start FROM customers c.",
          "LEFT JOIN orders o ON o.customer_id=c.id.",
        ],
        { checkColumnNames: true },
      ),
      q(
        "Keep the right side",
        "Write a RIGHT JOIN with orders o on the left and customers c on the right. Return c.id AS customer_id, o.id AS order_id.",
        "SELECT c.id AS customer_id,o.id AS order_id FROM orders o RIGHT JOIN customers c ON c.id=o.customer_id;",
        "RIGHT preserves the right-hand customers table, giving the same rows as the previous left join.",
        [
          "Put orders before RIGHT JOIN customers.",
          "The relationship remains c.id=o.customer_id.",
        ],
      ),
      q(
        "Both guest lists",
        "Return c.id AS customer_id and o.id AS order_id with a FULL JOIN between customers and orders.",
        "SELECT c.id AS customer_id,o.id AS order_id FROM customers c FULL JOIN orders o ON o.customer_id=c.id;",
        "FULL preserves unmatched records on both sides. In this seed, every order has a customer, but Sara has no order.",
        ["FULL JOIN preserves both sides.", "Match o.customer_id=c.id."],
      ),
      q(
        "Every possible gift pairing",
        "Return c.id AS customer_id and p.id AS product_id for every customer-product combination using CROSS JOIN.",
        "SELECT c.id AS customer_id,p.id AS product_id FROM customers c CROSS JOIN products p;",
        "Six customers times six products creates 36 pairs.",
        [
          "There is no matching condition for every combination.",
          "Use CROSS JOIN products p.",
        ],
      ),
      q(
        "Neighbors without repeats",
        "Self join customers a and b. Return a.name AS first_name and b.name AS second_name for equal known cities, counting each pair once by requiring a.id < b.id.",
        "SELECT a.name AS first_name,b.name AS second_name FROM customers a JOIN customers b ON a.city=b.city AND a.id<b.id;",
        "The less-than key rule excludes self-pairs and mirrored duplicates. NULL cities do not compare equal.",
        [
          "Use customers twice with different aliases.",
          "Join both a.city=b.city and a.id<b.id.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 3,
    slug: "follow-a-longer-thread",
    title: "Follow a longer thread",
    description:
      "Connect three or more tables without losing the meaning of one row.",
    dataset: "store",
    diagram: "relationships",
    concept:
      "A longer join follows a chain of keys, one relationship at a time. Decide what one result row means before adding more tables. A one-to-many join changes how many rows you are counting.",
    analogy:
      "Follow a receipt from its customer to its order, each line item, and finally the product on the shelf.",
    notes: [
      [
        "Name the grain",
        "Grain means what one row represents. Before joining order_items, a row might mean an order; afterwards it usually means an order line.",
      ],
      [
        "Follow keys, not a shortcut",
        "customers.id → orders.customer_id → order_items.order_id → products.id is the path. Joining order_items.id to orders.id links unrelated IDs.",
      ],
      [
        "Count parents carefully",
        "COUNT(*) counts joined rows. COUNT(DISTINCT o.id) counts orders even when each has several items. Another option is to aggregate items before joining.",
        "SELECT o.id,SUM(i.quantity*i.unit_price) AS total FROM orders o JOIN order_items i ON i.order_id=o.id GROUP BY o.id;",
      ],
    ],
    mistakes: [
      "Counting item rows as if they were unique orders.",
      "Joining unrelated columns just because both are named id.",
      "Summing an order-level total after it has been repeated across item rows.",
    ],
    engineering:
      "A receipt endpoint joins four tables to display who ordered which product and the quantity. Revenue reporting uses the price captured on the line, not today's shelf price.",
    recap: [
      "Follow each foreign key step.",
      "Know what one output row means.",
      "Aggregate or count distinct IDs to prevent inflated totals.",
    ],
    tasks: [
      q(
        "Products on receipts",
        "Return o.id AS order_id,p.name,i.quantity by joining orders, order_items and products.",
        "SELECT o.id AS order_id,p.name,i.quantity FROM orders o JOIN order_items i ON i.order_id=o.id JOIN products p ON p.id=i.product_id;",
        "Each row is one order line, not one whole order.",
        [
          "The item table links orders to products.",
          "Join i.order_id=o.id, then p.id=i.product_id.",
        ],
      ),
      q(
        "Who bought what?",
        "Join all four shop tables and return c.name AS customer,p.name AS product,i.quantity.",
        "SELECT c.name AS customer,p.name AS product,i.quantity FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items i ON i.order_id=o.id JOIN products p ON p.id=i.product_id;",
        "The receipt follows the full key chain from person to product.",
        [
          "Start with customers and follow orders.",
          "Then join order_items and products on their keys.",
        ],
      ),
      q(
        "Receipt totals",
        "Return o.id AS order_id,SUM(i.quantity*i.unit_price) AS total per order.",
        "SELECT o.id AS order_id,SUM(i.quantity*i.unit_price) AS total FROM orders o JOIN order_items i ON i.order_id=o.id GROUP BY o.id;",
        "The stored unit_price preserves the historical receipt price.",
        [
          "Multiply each line's quantity by unit_price.",
          "Group the joined lines by o.id.",
        ],
      ),
      q(
        "Unique order counts",
        "Return c.id, COUNT(DISTINCT o.id) AS orders for customers with order lines, joining customers, orders and order_items.",
        "SELECT c.id,COUNT(DISTINCT o.id) AS orders FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items i ON i.order_id=o.id GROUP BY c.id;",
        "DISTINCT prevents an order with two lines being counted twice.",
        [
          "Each order can repeat after the item join.",
          "Count DISTINCT o.id, grouped by c.id.",
        ],
      ),
      q(
        "Delivered spending",
        "Return c.id,c.name,SUM(i.quantity*i.unit_price) AS spent, for delivered orders only, grouped by customer.",
        "SELECT c.id,c.name,SUM(i.quantity*i.unit_price) AS spent FROM customers c JOIN orders o ON o.customer_id=c.id JOIN order_items i ON i.order_id=o.id WHERE o.status='delivered' GROUP BY c.id,c.name;",
        "Filtering status before the customer totals excludes pending and cancelled receipts.",
        [
          "Join three tables and filter o.status.",
          "Group by the selected customer details.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 3,
    slug: "combine-two-lists",
    title: "Combine two little lists",
    description:
      "UNION, UNION ALL, INTERSECT and EXCEPT work with whole result rows.",
    dataset: "campus",
    diagram: "flow",
    concept:
      "Set operations combine compatible query results vertically. UNION removes duplicate rows, UNION ALL keeps them, INTERSECT keeps shared rows, and EXCEPT keeps rows from the first list that are absent from the second.",
    analogy:
      "Two clubs bring attendance lists. You can merge them, keep every sign-in, find shared guests, or find who came only to the first club.",
    notes: [
      [
        "Compatible columns",
        "Both sides need the same number of columns with compatible data types. Matching is positional, not based on aliases.",
      ],
      [
        "Duplicates are a decision",
        "UNION can remove a legitimate repeated row. Use UNION ALL when every event should remain. INTERSECT and EXCEPT also remove duplicates by default.",
      ],
      [
        "Sort the combined answer",
        "Put ORDER BY after the complete set operation. NULL values count as equal for duplicate elimination here, unlike a normal = comparison.",
        "SELECT city FROM students UNION SELECT city FROM store.customers;",
      ],
    ],
    mistakes: [
      "Using UNION ALL while expecting deduplication.",
      "Selecting different numbers of columns on the two sides.",
      "Assuming EXCEPT is symmetric: A EXCEPT B differs from B EXCEPT A.",
    ],
    engineering:
      "A unified activity feed uses UNION ALL across event sources. A reconciliation job uses EXCEPT to find IDs missing from another system.",
    recap: [
      "UNION deduplicates; UNION ALL preserves duplicates.",
      "INTERSECT finds shared rows; EXCEPT finds a one-sided difference.",
      "Align column count/types and sort the whole result.",
    ],
    tasks: [
      q(
        "All the known places",
        "Return city from students UNION city from store.customers.",
        "SELECT city FROM students UNION SELECT city FROM store.customers;",
        "The combined list includes each distinct city and at most one NULL.",
        ["Use compatible one-column queries.", "Place UNION between them."],
      ),
      q(
        "Keep every name",
        "Return name from students UNION ALL name from store.customers.",
        "SELECT name FROM students UNION ALL SELECT name FROM store.customers;",
        "Two students named Aanya remain two rows.",
        [
          "Duplicates belong to separate people here.",
          "Use UNION ALL, not UNION.",
        ],
      ),
      q(
        "Shared cities",
        "Return the INTERSECT of students.city and store.customers.city.",
        "SELECT city FROM students INTERSECT SELECT city FROM store.customers;",
        "Shared rows include the NULL row because set-operation duplicate semantics differ from =.",
        [
          "INTERSECT keeps rows appearing on both sides.",
          "Select city on each side.",
        ],
      ),
      q(
        "Only on campus",
        "Return student names absent from customer names using EXCEPT.",
        "SELECT name FROM students EXCEPT SELECT name FROM store.customers;",
        "EXCEPT removes right-hand matches and also deduplicates remaining names.",
        [
          "The first list should be students.",
          "Use EXCEPT SELECT name FROM store.customers.",
        ],
      ),
      q(
        "A sorted city list",
        "Combine non-NULL city values from students and store.customers, removing duplicates and sorting city ascending.",
        "SELECT city FROM students WHERE city IS NOT NULL UNION SELECT city FROM store.customers WHERE city IS NOT NULL ORDER BY city;",
        "Each side removes missing values before UNION; the final ORDER BY sorts the combined set.",
        [
          "Filter NULLs on both sides.",
          "Use a single ORDER BY city at the end.",
        ],
        { ordered: true },
      ),
    ],
  }),
  makeLesson({
    level: 3,
    slug: "a-question-inside-a-question",
    title: "A question inside a question",
    description: "Subqueries, correlated queries and a thoughtful EXISTS.",
    dataset: "store",
    diagram: "flow",
    concept:
      "A subquery is a query used inside another query. It can provide a value, a list, or a little table. A correlated subquery refers to the current outer row; EXISTS asks only whether a matching row is present.",
    analogy:
      "Before choosing an expensive gift, first ask the shop's average price. To find customers with orders, check whether each person's receipt folder contains anything.",
    notes: [
      [
        "Three places to nest",
        "WHERE price > (SELECT AVG(price) ...) uses a scalar value. FROM (SELECT ...) AS totals names a derived table. A SELECT-list subquery must return at most one row per outer record.",
      ],
      [
        "EXISTS asks about presence",
        "EXISTS(SELECT 1 FROM orders o WHERE o.customer_id=c.id) tests each customer. The selected 1 is just a placeholder; row existence matters.",
      ],
      [
        "The NOT IN trap",
        "If a NOT IN list contains NULL, comparisons can become unknown and reject rows you expected. NOT EXISTS often expresses an anti-match more clearly. Decide separately how outer NULL values should behave.",
        "SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id);",
      ],
    ],
    mistakes: [
      "Returning several rows from a scalar subquery.",
      "Forgetting the outer/inner key link in a correlated query.",
      "Ignoring NULLs in NOT IN.",
    ],
    engineering:
      "A dashboard selects above-average products, displays per-customer counts, and finds customers with no orders without multiplying their rows.",
    recap: [
      "A subquery can return a scalar, list or table.",
      "A correlated query references the outer row.",
      "EXISTS tests presence; inspect NULLs before choosing NOT IN.",
    ],
    tasks: [
      q(
        "Above average",
        "Return name,price from products whose price exceeds the overall AVG(price).",
        "SELECT name,price FROM products WHERE price > (SELECT AVG(price) FROM products);",
        "The inner aggregate returns one number for the outer comparison.",
        [
          "The average belongs in parentheses.",
          "Compare price > (SELECT AVG(price) FROM products).",
        ],
      ),
      q(
        "People with receipts",
        "Return c.id,c.name for customers where an order exists, using EXISTS.",
        "SELECT c.id,c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id);",
        "Each customer stays one row, even if they have two orders.",
        [
          "Correlate the inner order to the outer customer.",
          "EXISTS only needs SELECT 1.",
        ],
      ),
      q(
        "An empty receipt folder",
        "Return c.id,c.name for customers with no order, using NOT EXISTS.",
        "SELECT c.id,c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id);",
        "Sara is the customer whose matching receipt folder is empty.",
        [
          "Invert the presence test.",
          "Use NOT EXISTS with o.customer_id=c.id.",
        ],
      ),
      q(
        "A count beside each name",
        "Return c.id and a correlated scalar subquery counting their orders AS order_count, including zero counts.",
        "SELECT c.id,(SELECT COUNT(*) FROM orders o WHERE o.customer_id=c.id) AS order_count FROM customers c;",
        "COUNT always returns one row and gives zero for the empty folder.",
        [
          "Put the parenthesized count in the SELECT list.",
          "The inner WHERE must use c.id.",
        ],
        { checkColumnNames: true },
      ),
      q(
        "Totals as a little table",
        "From a derived table of order_id and SUM(quantity*unit_price) AS total, return order_id,total where total > 600.",
        "SELECT order_id,total FROM (SELECT order_id,SUM(quantity*unit_price) AS total FROM order_items GROUP BY order_id) AS totals WHERE total > 600;",
        "The outer query can filter the inner aggregate's named total.",
        [
          "Aggregate inside FROM (...).",
          "Give the subquery an alias, then WHERE total>600.",
        ],
      ),
      choice(
        "A NULL in the list",
        "What is the value of 3 NOT IN (1,NULL) in PostgreSQL?",
        ["true", "false", "NULL (unknown)"],
        2,
        "It means 3<>1 AND 3<>NULL; the second comparison is unknown, so the whole condition is unknown.",
        [
          "NULL comparisons are not true or false.",
          "NOT IN combines inequality comparisons with AND.",
        ],
      ),
    ],
  }),
];
