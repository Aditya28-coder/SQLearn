"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { siteConfig } from "@/lib/config";
import { PracticeProvider } from "@/lib/use-practice";

type Preferences = {
  name: string;
  theme: "light" | "dark";
  setName: (name: string) => void;
  toggleTheme: () => void;
  storageAvailable: boolean;
};
const PreferencesContext = createContext<Preferences | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [name, updateName] = useState(siteConfig.friendName);
  const [theme, updateTheme] = useState<"light" | "dark">("light");
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sqlearn:preferences");
      if (saved) {
        const prefs = JSON.parse(saved);
        if (typeof prefs.name === "string" && prefs.name.trim())
          updateName(prefs.name.slice(0, 40));
        if (prefs.theme === "dark" || prefs.theme === "light") {
          updateTheme(prefs.theme);
          document.documentElement.dataset.theme = prefs.theme;
        }
      }
    } catch {
      setStorageAvailable(false);
    }
  }, []);

  function save(nextName: string, nextTheme: "light" | "dark") {
    try {
      localStorage.setItem(
        "sqlearn:preferences",
        JSON.stringify({ name: nextName, theme: nextTheme }),
      );
    } catch {
      setStorageAvailable(false);
    }
  }
  const setName = (value: string) => {
    const nextName = value.trim().slice(0, 40) || siteConfig.friendName;
    updateName(nextName);
    save(nextName, theme);
  };
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    updateTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    save(name, nextTheme);
  };
  return (
    <PreferencesContext.Provider
      value={{ name, theme, setName, toggleTheme, storageAvailable }}
    >
      <PracticeProvider>{children}</PracticeProvider>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences requires Providers");
  return value;
}
