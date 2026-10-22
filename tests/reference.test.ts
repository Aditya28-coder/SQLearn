import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GlossaryText } from "../src/components/glossary-text";
import { glossary } from "../src/data/glossary";
import { joinRows } from "../src/data/advanced-diagrams";
import { findReferenceLessons, findGlossaryTerms } from "../src/lib/reference";
import { cellText } from "../src/components/result-table";
test("the glossary is unique and plain-English technical terms become keyboard buttons", () => {
  assert.equal(
    new Set(glossary.map((item) => item.term.toLowerCase())).size,
    glossary.length,
  );
  assert.ok(glossary.length >= 60);
  const rendered = renderToStaticMarkup(
    createElement(GlossaryText, {
      text: "A primary key identifies a row; a foreign key connects it. A transaction keeps changes together.",
    }),
  );
  assert.ok(rendered.includes(">primary key</button>"), rendered);
  assert.ok(rendered.includes(">foreign key</button>"), rendered);
  assert.equal((rendered.match(/<button /g) || []).length, 2);
  assert.ok(!rendered.includes('role="tooltip"'));
});
test("date-only and zone-free timestamp output does not invent an extra timezone meaning", () => {
  const date = new Date("2026-09-01T12:30:00Z");
  assert.equal(cellText(date, 1082), "2026-09-01");
  assert.equal(cellText(date, 1114), "2026-09-01 12:30:00.000");
  assert.equal(cellText(date, 1184), "2026-09-01T12:30:00.000Z");
  assert.equal(cellText(null, 1082), "NULL");
});
test("reference search matches its own concept, handles SQL syntax and supports honest empty results", () => {
  assert.equal(findReferenceLessons("").length, 33);
  assert.deepEqual(
    findReferenceLessons("JSONB").map((lesson) => lesson.slug),
    ["the-right-kind-of-detail", "a-little-json-pocket"],
  );
  assert.ok(
    findReferenceLessons("row_number", 4).some(
      (lesson) => lesson.slug === "a-window-over-your-rows",
    ),
  );
  assert.ok(
    findReferenceLessons("window", 4).every((lesson) => lesson.level === 4),
  );
  assert.deepEqual(findReferenceLessons("zz_nonexistent_topic"), []);
  assert.ok(
    findGlossaryTerms("primary key").some(
      (item) => item.term === "primary key",
    ),
  );
});
test("join drawings preserve multiplicity and unmatched records for every mode", () => {
  assert.deepEqual(joinRows(0), [
    ["Aanya", "Art"],
    ["Aanya", "Music"],
  ]);
  assert.equal(joinRows(1).length, 4);
  assert.ok(
    joinRows(2).some((row) => row[0] === "NULL" && row[1] === "Garden"),
  );
  assert.equal(joinRows(3).length, 5);
  assert.equal(joinRows(4).length, 9);
  assert.deepEqual(joinRows(5), [["Aanya", "Zoya"]]);
});
