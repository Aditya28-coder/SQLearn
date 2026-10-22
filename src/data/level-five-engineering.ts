import { makeLesson, task as q, choice } from "./lesson-builder";
const ex = (setup: string, verify: string) => ({ exercise: { setup, verify } });
const wallet =
  "CREATE TABLE practice_wallet(id int PRIMARY KEY,balance int NOT NULL CHECK(balance>=0)); INSERT INTO practice_wallet VALUES(1,100),(2,50);";
const names =
  "CREATE TABLE practice_people(id int PRIMARY KEY,name text,normalized text);";
const stamp =
  "CREATE FUNCTION practice_normalize() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.normalized=lower(NEW.name); RETURN NEW; END $$;";
const social = `WITH users(id,name) AS (VALUES (1,'Mira'),(2,'Noor'),(3,'Ira'),(4,'Dev')), posts(id,user_id,likes) AS (VALUES (10,1,5),(11,1,8),(12,2,3),(13,3,8),(14,3,2)), follows(follower_id,followed_id) AS (VALUES (1,2),(1,3),(2,3),(3,1))`;
export const engineeringLessons = [
  makeLesson({
    level: 5,
    slug: "keep-a-promise-with-transactions",
    title: "Keep a database promise",
    description: "Transactions, ACID, isolation levels, locks and deadlocks.",
    dataset: "campus",
    diagram: "transaction",
    concept:
      "A transaction groups work into one unit. COMMIT keeps it; ROLLBACK discards transactional changes. Isolation controls what concurrent transactions can observe, while locks coordinate changes to shared rows.",
    analogy:
      "Move ₹10 between two jars. Taking from one jar and adding to the other belongs to one promise: either both steps happen, or neither does.",
    notes: [
      [
        "ACID, in everyday language",
        "Atomicity means all-or-nothing. Consistency means valid rules remain satisfied. Isolation controls interactions between concurrent work. Durability means committed data survives a crash under the database's configured guarantees. This learning site's in-memory database intentionally resets on refresh; it is not durable storage for your own data.",
      ],
      [
        "PostgreSQL isolation",
        "Read Committed uses a fresh committed snapshot for each statement. Repeatable Read keeps a transaction snapshot but can still allow serialization anomalies. Serializable detects conflicts that prevent a serial explanation; an application must retry the whole failed transaction. PostgreSQL treats Read Uncommitted as Read Committed, so it does not allow dirty reads.",
      ],
      [
        "Locks and waiting",
        "An update can wait for another transaction's row lock. Keep transactions short. SELECT ... FOR UPDATE can lock selected rows when coordinating a read-modify-write operation.",
      ],
      [
        "A deadlock is a cycle",
        "Session A holds row 1 and wants row 2; B holds row 2 and wants row 1. PostgreSQL aborts one participant so the other can proceed. Lock resources in a consistent order and handle retries. The two-session timeline here is a teaching simulation; the browser engine runs our queries on one connection.",
      ],
      [
        "After an error",
        "A failed transaction usually needs ROLLBACK before ordinary work can continue. A SAVEPOINT and ROLLBACK TO SAVEPOINT can recover a subsection. External side effects and sequence increments are not automatically undone like table changes.",
      ],
    ],
    mistakes: [
      "Keeping a transaction open while waiting for a human or a slow network request.",
      "Retrying only the last statement after a serialization failure.",
      "Assuming PostgreSQL allows dirty reads at Read Uncommitted.",
    ],
    engineering:
      "A transfer or inventory reservation updates related rows in one short transaction. A service catches serialization/deadlock errors, rolls back, and retries the whole unit with an appropriate bounded retry policy.",
    recap: [
      "COMMIT keeps a unit; ROLLBACK discards its transactional table changes.",
      "Isolation is a concurrency contract, not a promise that nothing can conflict.",
      "Keep locks short, order them consistently and retry failed units thoughtfully.",
    ],
    tasks: [
      q(
        "Move ten, together",
        "With practice_wallet provided, transfer 10 from id 1 to id 2 inside a transaction and commit. Preserve the total balance.",
        "BEGIN; UPDATE practice_wallet SET balance=balance-10 WHERE id=1; UPDATE practice_wallet SET balance=balance+10 WHERE id=2; COMMIT;",
        "The two balances become 90 and 60. Each check's disposable database contains the commit.",
        [
          "Wrap the two key-specific updates in BEGIN/COMMIT.",
          "Subtract from id 1 and add to id 2.",
        ],
        ex(wallet, "SELECT id,balance FROM practice_wallet ORDER BY id;"),
      ),
      q(
        "Undo a rehearsal",
        "Subtract 10 from wallet id 1 in a transaction, then roll it back so both original balances remain.",
        "BEGIN; UPDATE practice_wallet SET balance=balance-10 WHERE id=1; ROLLBACK;",
        "The final-state check sees the original balances. It evaluates the observed state, not the exact sequence of SQL you typed.",
        ["BEGIN opens the rehearsal.", "Use ROLLBACK to restore it."],
        ex(wallet, "SELECT id,balance FROM practice_wallet ORDER BY id;"),
      ),
      choice(
        "All or nothing",
        "Which part of ACID describes keeping both transfer updates or neither?",
        ["Atomicity", "Isolation", "Width"],
        0,
        "Atomicity treats the transaction's changes as one unit.",
        [
          "Think of an indivisible unit.",
          "Atomicity is the all-or-nothing property.",
        ],
      ),
      choice(
        "A tempting dirty read",
        "At PostgreSQL's Read Uncommitted level, can a query read another transaction's uncommitted row changes?",
        [
          "Yes, always",
          "No; PostgreSQL treats it as Read Committed",
          "Only with ORDER BY",
        ],
        1,
        "PostgreSQL implements Read Uncommitted with Read Committed behavior.",
        [
          "PostgreSQL can be stricter than the SQL minimum.",
          "Its weakest level still prevents dirty reads.",
        ],
      ),
      choice(
        "Two sessions stuck",
        "A locks row 1 then waits for 2; B locks 2 then waits for 1. What is a useful prevention habit?",
        [
          "Always acquire these row locks in a consistent order",
          "Keep every transaction open longer",
          "Remove every primary key",
        ],
        0,
        "A consistent resource order reduces circular waits; applications must still handle transaction failures.",
        [
          "A deadlock is a circular wait.",
          "Have both sessions ask for row 1 before row 2.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 5,
    slug: "a-small-database-helper",
    title: "A small database helper",
    description: "Stored functions and triggers, introduced with care.",
    dataset: "campus",
    diagram: "flow",
    concept:
      "A stored function is reusable logic in the database. A trigger runs a function automatically when a chosen table event occurs. Hidden side effects can be surprising, so keep trigger behavior small, documented and tested.",
    analogy:
      "A function is a reusable stamp. A trigger is a desk rule that says 'apply this stamp whenever a new form arrives'.",
    notes: [
      [
        "A simple function",
        "SQL functions can return a value from an expression or query. More procedural logic can use PL/pgSQL with BEGIN/END. CREATE FUNCTION defines a helper; SELECT calls it.",
      ],
      [
        "Before and after",
        "A BEFORE row trigger can edit NEW before it is stored. NEW is the incoming row; OLD is the old row for UPDATE/DELETE. An AFTER trigger is useful for an audit entry once the row event has occurred.",
      ],
      [
        "Make the return explicit",
        "A BEFORE INSERT/UPDATE trigger commonly returns NEW to keep the row. Returning NULL can skip the operation. Trigger functions declare RETURNS trigger and are attached with CREATE TRIGGER.",
      ],
      [
        "Use the smallest mechanism",
        "Prefer a DEFAULT, CHECK, foreign key or generated column when it directly expresses the rule. Triggers run inside the transaction and can create additional locking, recursion and maintenance work.",
      ],
    ],
    mistakes: [
      "Creating a trigger function but never attaching a trigger.",
      "Forgetting RETURN NEW in a BEFORE row trigger.",
      "Putting an unrelated network side effect inside a database transaction.",
    ],
    engineering:
      "A small BEFORE trigger can standardize an audit value. A larger application documents trigger effects so every writer understands which fields the database maintains.",
    recap: [
      "A function is called; a trigger reacts to a table event.",
      "NEW and OLD refer to row versions in trigger logic.",
      "Keep automatic behavior narrow and prefer declarative rules when possible.",
    ],
    tasks: [
      q(
        "A reusable double",
        "Create SQL function practice_double(n int) returning int with SELECT n*2.",
        "CREATE FUNCTION practice_double(n int) RETURNS int LANGUAGE sql AS $$ SELECT n*2 $$;",
        "The checker calls the function with several values, so a constant answer does not pass.",
        [
          "Declare the argument and return type.",
          "Use LANGUAGE sql AS $$ SELECT n*2 $$.",
        ],
        ex(
          "",
          "SELECT practice_double(3) AS a,practice_double(-2) AS b,practice_double(0) AS c;",
        ),
      ),
      q(
        "Attach the stamp",
        "practice_people and practice_normalize() are provided. Create trigger practice_stamp BEFORE INSERT ON practice_people FOR EACH ROW EXECUTE FUNCTION practice_normalize(). Then insert (1,'MIRA') using id,name.",
        "CREATE TRIGGER practice_stamp BEFORE INSERT ON practice_people FOR EACH ROW EXECUTE FUNCTION practice_normalize(); INSERT INTO practice_people(id,name) VALUES(1,'MIRA');",
        "The before trigger fills normalized='mira' while preserving the original name.",
        [
          "Attach a BEFORE INSERT row trigger.",
          "After creating it, insert the provided person.",
        ],
        ex(
          names + stamp,
          "SELECT id,name,normalized FROM practice_people ORDER BY id;",
        ),
      ),
      choice(
        "Keep the inserted row",
        "What should a BEFORE INSERT row trigger usually return after editing NEW?",
        ["NEW", "DROP TABLE", "The number of columns"],
        0,
        "RETURN NEW passes the edited row to the table operation.",
        [
          "The trigger function works with a row version.",
          "NEW is the incoming row.",
        ],
      ),
      q(
        "Normalize on insert and update",
        "Create trigger practice_stamp BEFORE INSERT OR UPDATE on practice_people, for each row using practice_normalize(). Insert id 1,name 'MIRA', then update that name to 'NOOR'.",
        "CREATE TRIGGER practice_stamp BEFORE INSERT OR UPDATE ON practice_people FOR EACH ROW EXECUTE FUNCTION practice_normalize(); INSERT INTO practice_people(id,name) VALUES(1,'MIRA'); UPDATE practice_people SET name='NOOR' WHERE id=1;",
        "The same helper runs for both events and the final normalized value is 'noor'.",
        [
          "One trigger can list INSERT OR UPDATE.",
          "Perform the insert before the key-specific update.",
        ],
        ex(
          names + stamp,
          "SELECT id,name,normalized FROM practice_people ORDER BY id;",
        ),
      ),
      q(
        "Remove an automatic rule",
        "A practice_stamp trigger is provided on practice_people. Drop only that trigger, then insert id 1,name 'MIRA'; normalized should remain NULL.",
        "DROP TRIGGER practice_stamp ON practice_people; INSERT INTO practice_people(id,name) VALUES(1,'MIRA');",
        "Removing the trigger stops the automatic stamp without removing its table or function.",
        [
          "DROP TRIGGER needs the table name too.",
          "Use DROP TRIGGER practice_stamp ON practice_people.",
        ],
        ex(
          names +
            stamp +
            "CREATE TRIGGER practice_stamp BEFORE INSERT ON practice_people FOR EACH ROW EXECUTE FUNCTION practice_normalize();",
          "SELECT id,name,normalized FROM practice_people ORDER BY id;",
        ),
      ),
    ],
  }),
  makeLesson({
    level: 5,
    slug: "values-are-not-sql",
    title: "Values are not SQL",
    description: "SQL injection and parameterized queries for developers.",
    dataset: "store",
    diagram: "security",
    concept:
      "SQL injection happens when untrusted text is treated as part of a command. Parameterized queries send SQL structure and data values separately. A value containing quotes then stays a value rather than becoming a new condition.",
    analogy:
      "A restaurant order form has fixed boxes for dish and quantity. A customer's note goes inside a box; it does not get to rewrite the kitchen's instructions.",
    notes: [
      [
        "Keep the command fixed",
        "In application code use db.query('SELECT id FROM customers WHERE city=$1',[city]). The driver sends the value separately. Do not build SQL with string interpolation or concatenation of user input.",
        "-- The application binds $1 separately.\nSELECT id,name FROM customers WHERE city=$1;",
      ],
      [
        "Quotes remain data",
        "A bound value such as O'Reilly or ' OR true -- is handled as text. Manually escaping strings is error-prone and is not a replacement for using the driver's parameter API.",
      ],
      [
        "Values, not identifiers",
        "A parameter cannot stand for a table name, column name or ASC/DESC keyword. Map such choices through a small allowlist of developer-controlled SQL fragments. Continue binding the actual filter values.",
      ],
      [
        "One part of a secure service",
        "Use least-privilege database roles, authorization checks and input limits as well. This static learning app has no server database to secure; these habits matter in the real backend where secrets and access rules belong.",
      ],
    ],
    mistakes: [
      "Writing SQL as '... WHERE name=\'' + userInput + '\''.",
      "Putting '$1' inside SQL quotes: that makes it literal text, not a placeholder.",
      "Assuming parameterization also grants permission to read a user's private rows.",
    ],
    engineering:
      "A search endpoint binds a search term using its database driver's API. A report's sort option maps to a fixed allowlist, while its customer filters remain bound values.",
    recap: [
      "Separate SQL structure from untrusted data.",
      "Bind values with the driver's parameter API.",
      "Allowlist identifiers and still enforce authorization.",
    ],
    tasks: [
      q(
        "A bound city",
        "Return id,name from customers where city=$1. The checker binds $1 to 'Pune'. Keep the placeholder in your SQL.",
        "SELECT id,name FROM customers WHERE city=$1;",
        "The bound city selects Anika and Neel without becoming part of the SQL grammar.",
        [
          "Use $1 without surrounding quotes.",
          "The checker supplies the value separately.",
        ],
        { parameters: ["Pune"] },
      ),
      q(
        "A suspicious-looking value",
        "Return COUNT(*) AS matches from customers where name=$1. The bound value is the text ' OR true --. It must match zero customers.",
        "SELECT COUNT(*) AS matches FROM customers WHERE name=$1;",
        "A properly bound attack-shaped string is just a name value; it cannot change WHERE into an always-true condition.",
        [
          "Keep the SQL structure unchanged.",
          "Compare name=$1 and let the API bind the string.",
        ],
        { parameters: ["' OR true --"], checkColumnNames: true },
      ),
      q(
        "An ordinary apostrophe",
        "Return $1::text AS echoed. The bound text is O'Reilly.",
        "SELECT $1::text AS echoed;",
        "The quote inside the value needs no hand-written SQL escaping because it is bound data.",
        [
          "A placeholder is an expression.",
          "Cast $1 to text and alias it echoed.",
        ],
        { parameters: ["O'Reilly"], checkColumnNames: true },
      ),
      choice(
        "Can I bind a column name?",
        "A user chooses the sort field. What is a suitable approach?",
        [
          "ORDER BY $1 with the user's column name as a value",
          "Map allowed options to fixed developer-controlled column names",
          "Paste any received text after ORDER BY",
        ],
        1,
        "Value placeholders do not substitute SQL identifiers. Choose an identifier from a narrow allowlist.",
        [
          "A column name is part of the command structure.",
          "Keep the possible SQL fragments under developer control.",
        ],
      ),
      q(
        "Two separate values",
        "Return id,name from customers where city=$1 AND name=$2. The bindings are ['Pune','Anika'].",
        "SELECT id,name FROM customers WHERE city=$1 AND name=$2;",
        "Each placeholder has a corresponding value in positional order.",
        [
          "Use two unquoted placeholders.",
          "The first value is city, the second is name.",
        ],
        { parameters: ["Pune", "Anika"] },
      ),
    ],
  }),
  makeLesson({
    level: 5,
    slug: "leave-a-thoughtful-trail",
    title: "Leave a thoughtful trail",
    description:
      "Soft deletes, audit columns and migrations that respect existing rows.",
    dataset: "campus",
    diagram: "design",
    concept:
      "Audit columns record useful lifecycle information such as created_at, updated_at and deleted_at. A soft delete marks a row as inactive while retaining it. A migration is a versioned, reviewed change to the database's structure or data.",
    analogy:
      "Instead of erasing a library member's card, file it as inactive with a date. Keep a dated notebook of changes to the filing system itself.",
    notes: [
      [
        "Created is not updated",
        "DEFAULT CURRENT_TIMESTAMP can fill created_at at insert time. It does not automatically maintain updated_at on later updates; application logic or a documented trigger must do that. CURRENT_TIMESTAMP is the transaction's start time in PostgreSQL.",
      ],
      [
        "A soft delete is a policy",
        "WHERE deleted_at IS NULL keeps active records. Apply that policy to every relevant lookup, relationship and uniqueness rule. A partial unique index can enforce uniqueness among active rows; retaining records also needs a deliberate retention/privacy policy.",
      ],
      [
        "Expand, backfill, constrain",
        "For a required new column, add it in a compatible form, backfill existing rows, then add NOT NULL after validation. Large tables can make this operationally expensive; plan lock duration and rollout order.",
      ],
      [
        "A migration history",
        "Keep ordered migration files in version control. Test on representative data and rehearse recovery. IF NOT EXISTS can make a narrow step repeatable, but does not prove an existing object has the correct definition.",
      ],
    ],
    mistakes: [
      "Assuming a DEFAULT changes updated_at on every update.",
      "Adding NOT NULL before existing NULL rows are backfilled.",
      "Forgetting the soft-delete condition in a list or uniqueness rule.",
    ],
    engineering:
      "A team rolls out a new status column without breaking the old application, backfills existing records, and then strengthens the rule once every writer is ready.",
    recap: [
      "Audit fields need explicit insert and update behavior.",
      "Soft deletion needs consistent filtering and retention rules.",
      "Migrations must account for existing data and deployment order.",
    ],
    tasks: [
      q(
        "Add an audit field",
        "Given practice_entries(id,body), add created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP.",
        "ALTER TABLE practice_entries ADD COLUMN created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;",
        "The default also supplies existing rows when this column is added.",
        [
          "Use ALTER TABLE ADD COLUMN.",
          "Set the time-zone-aware type, NOT NULL and the default.",
        ],
        ex(
          "CREATE TABLE practice_entries(id int PRIMARY KEY,body text); INSERT INTO practice_entries VALUES(1,'hello');",
          "SELECT id,body,created_at IS NOT NULL AS has_created FROM practice_entries;",
        ),
      ),
      q(
        "A soft deletion",
        "Mark only practice_entries id 2 deleted_at=DATE '2026-09-30'. Keep the rows in the table.",
        "UPDATE practice_entries SET deleted_at=DATE '2026-09-30' WHERE id=2;",
        "The row remains stored, with an explicit inactive marker.",
        ["A soft delete is an UPDATE.", "Protect other rows with WHERE id=2."],
        ex(
          "CREATE TABLE practice_entries(id int PRIMARY KEY,deleted_at date); INSERT INTO practice_entries VALUES(1,NULL),(2,NULL),(3,NULL);",
          "SELECT * FROM practice_entries ORDER BY id;",
        ),
      ),
      q(
        "Only active records",
        "From students return id,name where city is known. This is the same explicit-filter habit used by WHERE deleted_at IS NULL.",
        "SELECT id,name FROM students WHERE city IS NOT NULL;",
        "A consistent visibility rule belongs in every query that promises to apply it.",
        [
          "Use a direct NULL test.",
          "WHERE city IS NOT NULL keeps known cities.",
        ],
      ),
      q(
        "Backfill, then require",
        "practice_entries has nullable status with one NULL. Set missing statuses to 'draft', then make status NOT NULL. Preserve the existing 'published' status.",
        "UPDATE practice_entries SET status='draft' WHERE status IS NULL; ALTER TABLE practice_entries ALTER COLUMN status SET NOT NULL;",
        "The backfill makes old data satisfy the stronger rule before the constraint is applied.",
        [
          "Update NULL rows before ALTER TABLE.",
          "Use ALTER COLUMN status SET NOT NULL after the backfill.",
        ],
        ex(
          "CREATE TABLE practice_entries(id int PRIMARY KEY,status text); INSERT INTO practice_entries VALUES(1,NULL),(2,'published');",
          "SELECT e.id,e.status,c.is_nullable FROM practice_entries e CROSS JOIN information_schema.columns c WHERE c.table_schema='campus' AND c.table_name='practice_entries' AND c.column_name='status' ORDER BY e.id;",
        ),
      ),
      choice(
        "An update timestamp",
        "Does DEFAULT CURRENT_TIMESTAMP on updated_at automatically change it whenever the row is updated?",
        [
          "Yes",
          "No; a default is applied when inserting an omitted value",
          "Only on rows with even IDs",
        ],
        1,
        "Updates need explicit application code or a suitable trigger to maintain an update timestamp.",
        [
          "A default supplies a missing inserted value.",
          "An UPDATE is a separate operation.",
        ],
      ),
    ],
  }),
  makeLesson({
    level: 5,
    slug: "little-projects-real-questions",
    title: "Little projects, real questions",
    description:
      "Build useful reports for a shop, a social app and a food delivery club.",
    dataset: "store",
    diagram: "relationships",
    concept:
      "A mini project turns a product question into a query with a clear row meaning and an honest metric. Start with the question, inspect keys and edge cases, then validate with small examples before adding complexity.",
    analogy:
      "You have learned the ingredients. Now make three small meals: a shop receipt, a social profile summary and a kitchen report.",
    notes: [
      [
        "Project 1: shop receipts",
        "Use customers → orders → order_items → products. Define revenue as delivered quantity × historical unit_price. Cancelled and pending orders are not delivered revenue. Decide whether customers with no purchases belong in the report.",
      ],
      [
        "Project 2: a small social app",
        "The provided WITH fixture names four users, five posts and four follower relationships. A user with no posts should still appear in a profile summary. Counting posts and followers in one raw join multiplies rows; aggregate each relationship first or use distinct stable keys.",
      ],
      [
        "Project 3: delivery operations",
        "The delivery dataset distinguishes delivered, on the way and cancelled. Average delivery minutes should use completed deliveries; NULL times are not zero-minute journeys. Include restaurants with no completed deliveries when the report promises all kitchens.",
      ],
      [
        "A short review checklist",
        "Can you say what one result row means? Does a join multiply counts? Are NULL, zero and no matching row different? Is ordering stable? Write those decisions beside your query; they are part of the deliverable.",
      ],
    ],
    mistakes: [
      "Using today's product price for historical revenue.",
      "Counting posts after multiplying them by followers.",
      "Averaging unfinished NULL journeys as zero minutes.",
    ],
    engineering:
      "These reports resemble real API and analytics work: a spending summary, a social profile rollup and a kitchen operations view. They use fictional data, so you can inspect every contributing row.",
    recap: [
      "Define the population, row grain and metric.",
      "Aggregate independent one-to-many relationships before combining them.",
      "Validate missing, unmatched, tied and repeated details.",
    ],
    tasks: [
      q(
        "Shop: delivered receipts",
        "Return o.id AS order_id,c.name AS customer,SUM(i.quantity*i.unit_price) AS revenue for delivered orders, grouped by order and customer name.",
        "SELECT o.id AS order_id,c.name AS customer,SUM(i.quantity*i.unit_price) AS revenue FROM orders o JOIN customers c ON c.id=o.customer_id JOIN order_items i ON i.order_id=o.id WHERE o.status='delivered' GROUP BY o.id,c.name;",
        "Historical line prices and the delivered filter define the revenue correctly.",
        [
          "Follow orders to customer and item rows.",
          "Filter delivered, then group by o.id,c.name.",
        ],
      ),
      q(
        "Shop: everyone belongs",
        "Return c.id,c.name,COALESCE(SUM(t.total),0) AS spent for all customers. Only delivered order totals count; include zero spenders.",
        "WITH totals AS (SELECT order_id,SUM(quantity*unit_price) AS total FROM order_items GROUP BY order_id) SELECT c.id,c.name,COALESCE(SUM(t.total),0) AS spent FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='delivered' LEFT JOIN totals t ON t.order_id=o.id GROUP BY c.id,c.name;",
        "Restricting the optional order in ON preserves customers without delivered purchases.",
        [
          "Aggregate line totals first.",
          "Use LEFT JOIN with the delivered condition in ON and COALESCE the final SUM.",
        ],
      ),
      q(
        "Social: posts per profile",
        "Using the provided WITH fixture, return u.id,u.name,COUNT(p.id) AS posts for every user, including Dev with zero posts.",
        `${social} SELECT u.id,u.name,COUNT(p.id) AS posts FROM users u LEFT JOIN posts p ON p.user_id=u.id GROUP BY u.id,u.name;`,
        "The left join preserves the empty profile, and counting p.id returns zero for it.",
        [
          "Keep the provided users/posts/follows fixture.",
          "LEFT JOIN posts and COUNT(p.id), grouped by the user.",
        ],
        { starter: `${social}\n-- Add your SELECT here.\n` },
      ),
      q(
        "Social: people with followers",
        "Using the fixture, return u.id,u.name,COUNT(f.follower_id) AS followers for every user. followed_id identifies the profile being followed.",
        `${social} SELECT u.id,u.name,COUNT(f.follower_id) AS followers FROM users u LEFT JOIN follows f ON f.followed_id=u.id GROUP BY u.id,u.name;`,
        "The two roles of a follow are different: followed_id is the profile receiving the follower.",
        [
          "Follow the followed_id side of the relationship.",
          "Preserve all users with a LEFT JOIN.",
        ],
        { starter: `${social}\n-- Add your SELECT here.\n` },
      ),
      q(
        "Social: one favorite post per author",
        "Using the fixture, return id,user_id,likes for each author's most-liked post; break ties by the smaller post id.",
        `${social}, ranked AS (SELECT id,user_id,likes,ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY likes DESC,id) AS rn FROM posts) SELECT id,user_id,likes FROM ranked WHERE rn=1;`,
        "A partitioned ranking selects one deterministic winner per author.",
        [
          "Add another CTE after the existing fixture.",
          "Rank per user_id by likes DESC,id, then keep rn=1.",
        ],
        { starter: `${social}\n-- Add a ranking CTE and your final SELECT.\n` },
      ),
      q(
        "Delivery: completed journey times",
        "Return restaurant_id,ROUND(AVG(minutes),2) AS average_minutes from delivery.deliveries for delivered rows only, grouped by restaurant.",
        "SELECT restaurant_id,ROUND(AVG(minutes),2) AS average_minutes FROM delivery.deliveries WHERE status='delivered' GROUP BY restaurant_id;",
        "Only completed journeys contribute observed durations.",
        [
          "Filter delivered before grouping.",
          "AVG ignores missing minutes; do not replace them with zero.",
        ],
      ),
      q(
        "Delivery: every kitchen",
        "Return r.id,r.name,COUNT(d.id) AS completed for all delivery.restaurants, counting only delivered deliveries.",
        "SELECT r.id,r.name,COUNT(d.id) AS completed FROM delivery.restaurants r LEFT JOIN delivery.deliveries d ON d.restaurant_id=r.id AND d.status='delivered' GROUP BY r.id,r.name;",
        "A status restriction in ON keeps kitchens with no completed deliveries.",
        [
          "Start from the full restaurants list.",
          "Put status='delivered' in the join condition and count d.id.",
        ],
      ),
      q(
        "Delivery: rank completed kitchens",
        "From per-restaurant delivered counts, return id,name,completed,DENSE_RANK() OVER(ORDER BY completed DESC) AS rank. Include every restaurant and sort completed descending then id ascending.",
        "WITH counts AS (SELECT r.id,r.name,COUNT(d.id) AS completed FROM delivery.restaurants r LEFT JOIN delivery.deliveries d ON d.restaurant_id=r.id AND d.status='delivered' GROUP BY r.id,r.name) SELECT id,name,completed,DENSE_RANK() OVER(ORDER BY completed DESC) AS rank FROM counts ORDER BY completed DESC,id;",
        "DENSE_RANK gives tied counts the same rank; the outer ID tie-breaker stabilizes display without changing those ties.",
        [
          "Build the completed-count CTE first.",
          "Rank only on completed DESC, but display by completed DESC,id.",
        ],
        { ordered: true },
      ),
    ],
  }),
];
