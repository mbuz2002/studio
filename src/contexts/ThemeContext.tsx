
"use client";

import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

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
    // Clear existing theme classes
    root.classList.remove("dark", "theme-ocean-breeze", "theme-forest-haven");

    // Apply new theme class
    if (newTheme === "system") {
      const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemIsDark) {
        root.classList.add("dark"); // Default dark theme for system dark
      }
      // If system is light, no class is added, :root (default-light) applies.
    } else if (newTheme === "default-dark") {
      root.classList.add("dark");
    } else if (newTheme === "ocean-breeze") {
      root.classList.add("theme-ocean-breeze");
    } else if (newTheme === "forest-haven") {
      root.classList.add("theme-forest-haven");
    }
    // If newTheme is "default-light", no class is added, :root applies.
  }, []);

  // Effect for initial mount and loading theme from localStorage
  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme = storedTheme || "system";
    setThemeState(initialTheme);
  }, []);

  // Effect for applying the current theme to the document
  useEffect(() => {
    if (isMounted) {
      applyThemeToDocument(theme);
    }
  }, [theme, isMounted, applyThemeToDocument]);

  // Effect for handling system theme changes
  useEffect(() => {
    if (isMounted && theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyThemeToDocument('system'); // Re-evaluate and apply system theme
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, isMounted, applyThemeToDocument]);
  

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);
  
  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    availableThemes: availableThemesList
  }), [theme, setTheme]);

  if (!isMounted) {
    // To prevent flash of unstyled content or incorrect theme during SSR/hydration
    return null; 
  }

  return (
    <ThemeContext.Provider value={contextValue}>
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

