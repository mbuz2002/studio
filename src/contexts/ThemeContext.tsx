
"use client";

import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = "default-light" | "default-dark" | "ocean-breeze" | "forest-haven" | "system";
const THEME_STORAGE_KEY = "app-theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: { value: Theme; label: string }[];
}

const availableThemesList: { value: Theme; label: string }[] = [
  { value: "default-light", label: "Default Cerah (Biru Tenang)" },
  { value: "default-dark", label: "Default Gelap (Cyber)" },
  { value: "ocean-breeze", label: "Angin Laut (Cerah)" },
  { value: "forest-haven", label: "Rimba Teduh (Gelap)" },
  { value: "system", label: "Sistem (Otomatis)" },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isMounted, setIsMounted] = useState(false);

  const applyThemeToDocument = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;
    // Remove all potential theme classes
    root.classList.remove("dark", "theme-ocean-breeze", "theme-forest-haven");

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      if (systemTheme === "dark") {
        root.classList.add("dark");
      }
      // 'light' system theme uses the :root defaults, no specific class needed
    } else if (newTheme === "default-dark") {
      root.classList.add("dark");
    } else if (newTheme === "ocean-breeze") {
      root.classList.add("theme-ocean-breeze");
    } else if (newTheme === "forest-haven") {
      root.classList.add("theme-forest-haven");
    }
    // 'default-light' uses the :root defaults, no specific class needed
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme = storedTheme || "system";
    setThemeState(initialTheme);
    applyThemeToDocument(initialTheme);
  }, [applyThemeToDocument]);
  

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyThemeToDocument(newTheme);
  }, [applyThemeToDocument]);

  useEffect(() => {
    if (theme === 'system' && isMounted) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyThemeToDocument('system'); 
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyThemeToDocument, isMounted]);
  
  if (!isMounted) {
    return null; 
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: availableThemesList }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
