"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Heart, Moon, Sun, RotateCcw } from "lucide-react";
import { usePreferences } from "./providers";
import { usePractice } from "@/lib/use-practice";

export function Settings() {
  const practice = usePractice();
  const { name, theme, setName, toggleTheme, storageAvailable } =
    usePreferences();
  const [draft, setDraft] = useState(name);
  const [saved, setSaved] = useState(false);
  const [practiceNotice, setPracticeNotice] = useState("");
  const resetDialog = useRef<HTMLDialogElement>(null);
  const resetPracticeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setDraft(name);
  }, [name]);
  return (
    <div className="page-content settings-page">
      <div className="page-heading">
        <div>
          <h1>Make yourself at home.</h1>
          <p>The little details that make this space yours.</p>
        </div>
        <Heart size={23} />
      </div>
      <div className="settings-grid">
        <section className="settings-panel">
          <h2>What should we call you?</h2>
          <p>A familiar name makes a little corner feel like home.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setName(draft);
              setSaved(true);
            }}
          >
            <label htmlFor="friend-name">Your name</label>
            <input
              id="friend-name"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setSaved(false);
              }}
              maxLength={40}
              required
              autoComplete="given-name"
            />
            <button className="button primary" type="submit">
              {saved ? (
                <>
                  <Check size={17} /> Saved with love
                </>
              ) : (
                "Save my name"
              )}
            </button>
            <p className="save-state" role="status">
              {!storageAvailable
                ? "Browser storage is unavailable. Preferences will last for this visit."
                : saved
                  ? "Your greeting is updated. Make yourself at home."
                  : "Saved only in this browser. No account needed."}
            </p>
          </form>
        </section>
        <section className="settings-panel">
          <h2>Find your comfortable light.</h2>
          <p>For sunny mornings and one-more-query evenings.</p>
          <div className={`theme-preview ${theme}`}>
            <span className="preview-sidebar" />
            <div>
              <span />
              <span />
              <span />
            </div>
          </div>
          <button className="button secondary" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}Switch
            to {theme === "light" ? "dark" : "light"} mode
          </button>
        </section>
      </div>
      <section className="practice-reset-settings">
        <div>
          <h2>A fresh practice notebook</h2>
          <p>
            You can start the questions again. This clears saved practice
            answers, hints, solution reveals, solved marks and reading
            completion, accuracy, streaks, XP, badges and your saved place in
            this browser. Your name, theme and free-playground drafts stay
            yours.
          </p>
        </div>
        <button
          ref={resetPracticeButton}
          className="button secondary"
          onClick={() => resetDialog.current?.showModal()}
        >
          <RotateCcw size={15} />
          Reset saved practice
        </button>
        {practiceNotice && (
          <p className="reset-practice-notice" role="status">
            {practiceNotice}
          </p>
        )}
      </section>
      <dialog
        ref={resetDialog}
        className="reset-dialog"
        aria-labelledby="practice-reset-title"
        onClose={() => resetPracticeButton.current?.focus()}
      >
        <div className="dialog-heading">
          <RotateCcw size={23} />
          <h2 id="practice-reset-title">Start your practice fresh?</h2>
        </div>
        <p>
          This removes the saved practice notebook for all five levels in this
          browser, including reading completion, accuracy, streaks, XP, badges
          and your saved place. It cannot be undone.
        </p>
        <div className="dialog-actions">
          <button
            className="button secondary"
            autoFocus
            onClick={() => resetDialog.current?.close()}
          >
            Keep my practice
          </button>
          <button
            className="button primary"
            onClick={() => {
              if (practice.reset()) {
                setPracticeNotice(
                  "Your practice notebook is fresh. Your name, theme and playground drafts are unchanged.",
                );
              } else {
                setPracticeNotice(
                  "Your notebook is fresh for this visit. Browser storage is unavailable, so saved data couldn’t be updated.",
                );
              }
              resetDialog.current?.close();
            }}
          >
            Yes, start fresh
          </button>
        </div>
      </dialog>
      <div className="privacy-note">
        <Heart size={20} />
        <p>
          <strong>A private little learning nook.</strong> Your name, theme, and
          SQL drafts and practice stay in this browser. Queries run on your
          device. Resetting a dataset restores its sample rows; refreshing the
          page starts a fresh database.
        </p>
      </div>
    </div>
  );
}
