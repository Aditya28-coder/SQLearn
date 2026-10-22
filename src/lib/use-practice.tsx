"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  emptyPractice,
  parsePractice,
  practiceStorageKey,
  recordCheck,
  studyDay,
  type PracticeRecord,
  type PracticeStore,
} from "./practice";

function usePracticeStore() {
  const [store, setStore] = useState<PracticeStore>(emptyPractice);
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      setStore(parsePractice(localStorage.getItem(practiceStorageKey)));
    } catch {
      setStorageAvailable(false);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(practiceStorageKey, JSON.stringify(store));
    } catch {
      setStorageAvailable(false);
    }
  }, [store, loaded]);
  const updateQuestion = useCallback((id: string, record: PracticeRecord) => {
    setStore((previous) => ({
      ...previous,
      questions: { ...previous.questions, [id]: record },
    }));
  }, []);
  const checkQuestion = useCallback(
    (id: string, record: PracticeRecord, correct: boolean, scope: string) => {
      setStore((previous) => recordCheck(previous, id, record, correct, scope));
    },
    [],
  );
  const finishLesson = useCallback((slug: string) => {
    setStore((previous) =>
      previous.completedLessons.includes(slug)
        ? previous
        : {
            ...previous,
            completedLessons: [...previous.completedLessons, slug],
            activeDays: studyDay(previous, new Date()),
          },
    );
  }, []);
  const visit = useCallback((slug: string, questionId?: string) => {
    setStore((previous) =>
      previous.resume === slug &&
      (!questionId || previous.positions[slug] === questionId)
        ? previous
        : {
            ...previous,
            resume: slug,
            positions: questionId
              ? { ...previous.positions, [slug]: questionId }
              : previous.positions,
          },
    );
  }, []);
  const reset = useCallback(() => {
    const fresh = emptyPractice();
    setStore(fresh);
    try {
      localStorage.setItem(practiceStorageKey, JSON.stringify(fresh));
      return true;
    } catch {
      setStorageAvailable(false);
      return false;
    }
  }, []);
  return {
    store,
    loaded,
    storageAvailable,
    updateQuestion,
    checkQuestion,
    finishLesson,
    visit,
    reset,
  };
}
export type PracticeState = ReturnType<typeof usePracticeStore>;
const PracticeContext = createContext<PracticeState | null>(null);
export function PracticeProvider({ children }: { children: ReactNode }) {
  const value = usePracticeStore();
  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
}
export function usePractice(): PracticeState {
  const value = useContext(PracticeContext);
  if (!value) throw new Error("usePractice requires PracticeProvider");
  return value;
}
