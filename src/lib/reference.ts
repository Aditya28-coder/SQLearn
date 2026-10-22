import { allLessons } from "@/data/course";
import { glossary } from "@/data/glossary";
export const normalizeReference = (text: string) =>
  text.toLowerCase().replace(/[_-]/g, " ");
export function findReferenceLessons(search: string, level = 0) {
  const needle = normalizeReference(search.trim());
  return allLessons.filter(
    (lesson) =>
      (!level || lesson.level === level) &&
      normalizeReference(
        [
          lesson.title,
          lesson.concept,
          ...lesson.notes.flatMap((note) => [
            note.title,
            note.body,
            note.sql ?? "",
          ]),
          ...lesson.questions.map((q) => q.referenceSql),
        ].join(" "),
      ).includes(needle),
  );
}
export function findGlossaryTerms(search: string) {
  const needle = normalizeReference(search.trim());
  return glossary.filter((item) =>
    normalizeReference(`${item.term} ${item.definition}`).includes(needle),
  );
}
