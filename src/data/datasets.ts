export type DatasetId = "campus" | "store" | "delivery";
export type Starter = { label: string; description: string; sql: string };
export type Dataset = {
  id: DatasetId;
  name: string;
  description: string;
  tables: string[];
  starters: Starter[];
  seed: string;
};

export const datasets: Dataset[] = [
  {
    id: "campus",
    name: "Little campus",
    description: "Students, classes, and new beginnings.",
    tables: ["students", "courses", "enrollments"],
    starters: [
      {
        label: "Meet the students",
        description:
          "SELECT asks for columns. FROM tells SQL which table to look in.",
        sql: "-- A table is a little like a spreadsheet.\n-- Let’s meet everyone in our campus.\nSELECT name, city, favorite_subject\nFROM students\nORDER BY id;",
      },
      {
        label: "Find your people",
        description: "WHERE keeps only the rows that match your question.",
        sql: "-- Find students who live in Pune.\nSELECT name, city\nFROM students\nWHERE city = 'Pune';",
      },
      {
        label: "Connect two tables",
        description:
          "A JOIN matches related rows, like names on two guest lists.",
        sql: "-- Find out what everyone is learning.\nSELECT s.name, c.title AS course\nFROM students AS s\nJOIN enrollments AS e ON e.student_id = s.id\nJOIN courses AS c ON c.id = e.course_id\nORDER BY s.name;",
      },
    ],
    seed: `CREATE SCHEMA campus;
      CREATE TABLE campus.students (id int PRIMARY KEY, name text NOT NULL, city text, favorite_subject text, joined_on date DEFAULT '2026-09-01');
      CREATE TABLE campus.courses (id int PRIMARY KEY, title text NOT NULL UNIQUE, teacher text, seats int CHECK (seats >= 0));
      CREATE TABLE campus.enrollments (student_id int REFERENCES campus.students(id), course_id int REFERENCES campus.courses(id), score numeric(5,2), PRIMARY KEY(student_id, course_id));
      INSERT INTO campus.students VALUES (1,'Aanya','Pune','Art','2026-09-01'),(2,'Kabir','Mumbai','Music','2026-09-02'),(3,'Meera','Pune','Science','2026-09-04'),(4,'Ishaan','Delhi',NULL,'2026-09-05'),(5,'Zoya',NULL,'Art','2026-09-07'),(6,'Arjun','Mumbai','Science','2026-09-08'),(7,'Tara','Jaipur','Music','2026-09-10'),(8,'Aanya','Delhi','Literature','2026-09-12');
      INSERT INTO campus.courses VALUES (1,'Creative coding','Nisha',12),(2,'Everyday science','Rohan',16),(3,'Stories & poems','Diya',10),(4,'Making music','Neil',8),(5,'Garden club','Leela',6);
      INSERT INTO campus.enrollments VALUES (1,1,92),(1,3,87),(2,4,89),(3,2,95),(3,1,88),(4,1,NULL),(6,2,79),(7,4,91),(8,3,84);`,
  },
  {
    id: "store",
    name: "The little shop",
    description: "Thoughtful things and the people who love them.",
    tables: ["customers", "products", "orders", "order_items"],
    starters: [
      {
        label: "Browse the shelves",
        description:
          "ORDER BY arranges your results. Try changing ASC to DESC.",
        sql: "-- What’s on the shelves?\nSELECT name, category, price\nFROM products\nORDER BY price ASC;",
      },
      {
        label: "A few lovely orders",
        description: "JOIN lets an order find the customer it belongs to.",
        sql: "-- Match orders to the people who placed them.\nSELECT o.id, c.name, o.status, o.ordered_on\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id\nORDER BY o.id;",
      },
      {
        label: "Add things up",
        description:
          "SUM adds values together. GROUP BY makes one total for each order.",
        sql: "-- How much is each order worth?\nSELECT order_id, SUM(quantity * unit_price) AS total\nFROM order_items\nGROUP BY order_id\nORDER BY order_id;",
      },
    ],
    seed: `CREATE SCHEMA store;
      CREATE TABLE store.customers (id int PRIMARY KEY, name text NOT NULL, city text, email text UNIQUE);
      CREATE TABLE store.products (id int PRIMARY KEY, name text NOT NULL, category text, price numeric(10,2) CHECK (price >= 0), in_stock boolean DEFAULT true);
      CREATE TABLE store.orders (id int PRIMARY KEY, customer_id int REFERENCES store.customers(id), status text, ordered_on date);
      CREATE TABLE store.order_items (id int PRIMARY KEY, order_id int REFERENCES store.orders(id), product_id int REFERENCES store.products(id), quantity int CHECK (quantity > 0), unit_price numeric(10,2));
      INSERT INTO store.customers VALUES (1,'Anika','Pune','anika@littleshop.test'),(2,'Dev','Delhi','dev@littleshop.test'),(3,'Riya','Mumbai',NULL),(4,'Neel','Pune','neel@littleshop.test'),(5,'Maya',NULL,'maya@littleshop.test'),(6,'Sara','Jaipur','sara@littleshop.test');
      INSERT INTO store.products VALUES (1,'Sunday notebook','Stationery',250,true),(2,'Cloud mug','Home',450,true),(3,'Mint tea','Pantry',320,true),(4,'Little planter','Home',380,false),(5,'Kind words postcards','Stationery',150,true),(6,'Lavender candle','Home',550,true);
      INSERT INTO store.orders VALUES (101,1,'delivered','2026-09-10'),(102,2,'shipped','2026-09-12'),(103,1,'delivered','2026-09-15'),(104,3,'pending','2026-09-18'),(105,4,'cancelled','2026-09-19'),(106,5,'pending','2026-09-20');
      INSERT INTO store.order_items VALUES (1,101,1,2,250),(2,101,2,1,450),(3,102,3,1,320),(4,102,5,2,150),(5,103,6,1,550),(6,104,2,2,450),(7,105,4,1,380),(8,106,1,1,250);`,
  },
  {
    id: "delivery",
    name: "Comfort food club",
    description: "Neighborhood kitchens, happy plates, and little journeys.",
    tables: ["restaurants", "diners", "menu_items", "deliveries"],
    starters: [
      {
        label: "What’s cooking?",
        description: "An alias gives a column a helpful name in your results.",
        sql: "-- Find something lovely for lunch.\nSELECT name, cuisine, rating\nFROM restaurants\nORDER BY rating DESC NULLS LAST;",
      },
      {
        label: "Under ₹200",
        description:
          "A comparison keeps only prices smaller than the number you choose.",
        sql: "-- Good food, little budget.\nSELECT name, price\nFROM menu_items\nWHERE price < 200\nORDER BY price;",
      },
      {
        label: "Kitchen favorites",
        description: "COUNT tells you how many rows belong to each group.",
        sql: "-- How many deliveries came from each kitchen?\nSELECT r.name, COUNT(d.id) AS deliveries\nFROM restaurants AS r\nLEFT JOIN deliveries AS d ON d.restaurant_id = r.id\nGROUP BY r.id, r.name\nORDER BY deliveries DESC, r.name;",
      },
    ],
    seed: `CREATE SCHEMA delivery;
      CREATE TABLE delivery.restaurants (id int PRIMARY KEY, name text NOT NULL, cuisine text, rating numeric(2,1));
      CREATE TABLE delivery.diners (id int PRIMARY KEY, name text NOT NULL, neighborhood text);
      CREATE TABLE delivery.menu_items (id int PRIMARY KEY, restaurant_id int REFERENCES delivery.restaurants(id), name text, price numeric(10,2), vegetarian boolean);
      CREATE TABLE delivery.deliveries (id int PRIMARY KEY, diner_id int REFERENCES delivery.diners(id), restaurant_id int REFERENCES delivery.restaurants(id), status text, minutes int, ordered_at timestamp, details jsonb DEFAULT '{}');
      INSERT INTO delivery.restaurants VALUES (1,'The Cozy Kitchen','Indian',4.8),(2,'Noodle & Co.','Asian',4.5),(3,'Sunday Bakehouse','Bakery',4.7),(4,'New Leaf','Salads',NULL);
      INSERT INTO delivery.diners VALUES (1,'Aditi','Koregaon Park'),(2,'Vihaan','Baner'),(3,'Sana','Kothrud'),(4,'Rohit',NULL),(5,'Ira','Baner');
      INSERT INTO delivery.menu_items VALUES (1,1,'Dal & rice bowl',180,true),(2,1,'Paneer wrap',220,true),(3,2,'Veggie noodles',190,true),(4,2,'Chicken ramen',320,false),(5,3,'Cinnamon roll',120,true),(6,4,'Garden bowl',260,true);
      INSERT INTO delivery.deliveries VALUES (1,1,1,'delivered',28,'2026-09-20 12:30','{"contactless":true}'),(2,2,2,'delivered',35,'2026-09-20 13:00','{"contactless":false}'),(3,3,1,'delivered',24,'2026-09-20 13:15','{}'),(4,1,3,'on the way',NULL,'2026-09-21 09:00','{"note":"Ring the bell"}'),(5,5,2,'cancelled',NULL,'2026-09-21 12:00','{}');`,
  },
];
export const datasetMap = Object.fromEntries(
  datasets.map((dataset) => [dataset.id, dataset]),
) as Record<DatasetId, Dataset>;
