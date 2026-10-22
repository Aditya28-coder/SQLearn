"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  CircleHelp,
  Heart,
  Home,
  Map,
  Menu,
  Moon,
  Settings2,
  ShieldCheck,
  Sprout,
  Sun,
  X,
} from "lucide-react";
import { BrandMark } from "./brand";
import { usePreferences } from "./providers";
import { levels } from "@/data/curriculum";
import {
  lessonsForLevel,
  lessonMap,
  challengeSlug,
  challengeLevel,
} from "@/data/course";

const navigation = [
  { href: "/", label: "Your little home", Icon: Home },
  { href: "/path/", label: "Learning path", Icon: Map },
  { href: "/playground/", label: "SQL playground", Icon: Code2 },
  { href: "/cheat-sheet/", label: "SQL cheat sheet", Icon: BookOpen },
  { href: "/glossary/", label: "Little glossary", Icon: CircleHelp },
  { href: "/learn/review/", label: "A little review", Icon: Check },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { name, theme, toggleTheme } = usePreferences();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const title =
    navigation.find((item) => item.href === pathname)?.label ??
    (pathname.startsWith("/learn/")
      ? (lessonMap[pathname.split("/")[2]]?.title ??
        (pathname.includes("review")
          ? "Mixed review"
          : `Level ${challengeLevel(pathname.split("/")[2]) ?? 1} challenge`))
      : "Make it yours");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
      if (event.key === "Tab") {
        const items = Array.from(
          sidebarRef.current?.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled]), summary",
          ) ?? [],
        ).filter((item) => item.getClientRects().length > 0);
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
    };
  }, [open]);

  return (
    <div className="app-frame">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {open && (
        <button
          className="nav-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        ref={sidebarRef}
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Main navigation"
        {...(open ? { role: "dialog", "aria-modal": true } : {})}
      >
        <div className="sidebar-brand">
          <Link href="/" className="wordmark" aria-label="SQLearn home">
            <BrandMark />
            <span>
              SQL<span className="wordmark-soft">earn</span>
              <span className="brand-dot">.</span>
            </span>
          </Link>
          <button
            className="icon-button close-nav"
            onClick={() => {
              setOpen(false);
              menuRef.current?.focus();
            }}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <p className="brand-description">A little SQL. A little confidence.</p>
        <nav className="main-nav">
          {navigation.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href ? "active" : ""}`}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{label}</span>
              {pathname === href && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="course-nav">
          <p className="nav-group-label">A path made for you</p>
          {levels.map((level) => (
            <details
              key={level.id}
              className="lesson-nav-group"
              open={
                lessonMap[pathname.split("/")[2]]?.level === level.id ||
                challengeLevel(pathname.split("/")[2]) === level.id
              }
            >
              <summary className="course-nav-item">
                <span className={`level-dot ${level.color}`} />
                <span>{level.name}</span>
                <ChevronRight size={13} />
              </summary>
              <nav aria-label={`Level ${level.id} lessons`}>
                {lessonsForLevel(level.id).map((lesson) => (
                  <Link
                    key={lesson.slug}
                    href={`/learn/${lesson.slug}/`}
                    className={`lesson-nav-link ${pathname.includes(lesson.slug) ? "current" : ""}`}
                    aria-current={
                      pathname.includes(lesson.slug) ? "page" : undefined
                    }
                  >
                    {lesson.shortTitle}
                  </Link>
                ))}
                <Link
                  href={`/learn/${challengeSlug(level.id)}/`}
                  className={`lesson-nav-link ${pathname.includes(challengeSlug(level.id)) ? "current" : ""}`}
                >
                  Your Level {level.id} challenge
                </Link>
                <Link
                  href="/learn/review/"
                  className={`lesson-nav-link ${pathname.includes("review") ? "current" : ""}`}
                >
                  A little mixed review
                </Link>
              </nav>
            </details>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="little-note">
            <Sprout size={23} strokeWidth={1.5} />
            <p>
              You don’t have to know it all.
              <br />
              <strong>Just the next little thing.</strong>
            </p>
          </div>
          <Link
            href="/settings/"
            className={`nav-item ${pathname === "/settings/" ? "active" : ""}`}
          >
            <Settings2 size={18} strokeWidth={1.7} />
            <span>Make it yours</span>
          </Link>
          <div className="profile">
            <span className="avatar">{name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{name}’s learning nook</strong>
              <span>Wonderful things take practice</span>
            </div>
            <Heart size={15} />
          </div>
        </div>
      </aside>
      <div className="main-frame">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              ref={menuRef}
              className="icon-button mobile-menu"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              aria-expanded={open}
            >
              <Menu size={21} />
            </button>
            <BookOpen size={16} />
            <span>Your learning nook</span>
            <ChevronRight size={13} />
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="local-note">
              <ShieldCheck size={15} /> A space that’s just yours
            </span>
            <button
              className="icon-button theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <Link
              className="avatar small"
              href="/settings/"
              aria-label="Personalize your space"
            >
              {name.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          <span>
            Made with a little love, just for {name}. <Heart size={12} />
          </span>
          <span>One query at a time. You’ve got this.</span>
        </footer>
      </div>
    </div>
  );
}
