import { createContext } from "react";

export type Theme = "light" | "dark";

export type ThemeContextValue = {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "webapipeople-theme";
