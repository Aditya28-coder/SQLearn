"use client";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { glossary, glossaryMap } from "@/data/glossary";
const terms = glossary
  .map((item) => item.term)
  .filter(
    (term) =>
      ![
        "table",
        "row",
        "column",
        "database",
        "view",
        "index",
        "frame",
        "CHECK",
        "DEFAULT",
        "UNIQUE",
        "JOIN",
      ].includes(term),
  )
  .sort((a, b) => b.length - a.length);
const escaped = terms.map((term) =>
  term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
);
const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
function Term({ text, definition }: { text: string; definition: string }) {
  const id = useId(),
    button = useRef<HTMLButtonElement>(null),
    [open, setOpen] = useState(false),
    [position, setPosition] = useState({ left: 16, top: 0 });
  useLayoutEffect(() => {
    if (!open) return;
    const locate = () => {
      const rect = button.current?.getBoundingClientRect();
      if (rect)
        setPosition({
          left: Math.max(
            12,
            Math.min(
              rect.left,
              window.innerWidth - Math.min(290, window.innerWidth - 24) - 12,
            ),
          ),
          top:
            rect.bottom + 100 > window.innerHeight
              ? Math.max(12, rect.top - 100)
              : rect.bottom,
        });
    };
    locate();
    window.addEventListener("scroll", locate, true);
    window.addEventListener("resize", locate);
    return () => {
      window.removeEventListener("scroll", locate, true);
      window.removeEventListener("resize", locate);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [open]);
  return (
    <span
      className="glossary-term"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setOpen(true);
      }}
      onPointerLeave={() => {
        if (document.activeElement !== button.current) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
      >
        {text}
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="glossary-tooltip"
          style={position}
        >
          <strong>{text}</strong>
          {definition}
        </span>
      )}
    </span>
  );
}
export function GlossaryText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let from = 0,
    count = 0;
  const used = new Set<string>();
  for (const match of text.matchAll(pattern)) {
    if (count >= 2) break;
    const key = match[0].toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    const index = match.index!;
    nodes.push(
      text.slice(from, index),
      <Term
        key={`${index}-${key}`}
        text={match[0]}
        definition={glossaryMap[key]}
      />,
    );
    from = index + match[0].length;
    count++;
  }
  if (!count) return <>{text}</>;
  nodes.push(text.slice(from));
  return <>{nodes}</>;
}
