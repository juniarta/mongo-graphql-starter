import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("books").insert({ title: "Book 1", prices: [1.1, 2.2, 3.3] });
  await db.collection("books").insert({ title: "Book 2", prices: [1.1, 2.2, 3.3] });
  await db.collection("books").insert({ title: "Book 3", prices: [] });
  await db.collection("books").insert({ title: "Book 4", prices: [1.1] });
  await db.collection("books").insert({ title: "Book 5", prices: [9.9] });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Array match 1", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices: [1.1, 2.2, 3.3]){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Array match 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices: [], SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});

test("Array match in", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_in: [[], [1.1], [44]], SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 3" }, { title: "Book 4" }]
  });
});

test("Array match - order matters", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices: [3.3, 2.2, 1.1]){Books{title}}}",
    coll: "allBooks",
    results: []
  });
});

test("Array match - contains", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_contains: 2.2, SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Array match - contains 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_contains: 9.9, SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 5" }]
  });
});