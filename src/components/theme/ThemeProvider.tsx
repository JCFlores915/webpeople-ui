import React, { useEffect, useMemo, useState } from "react";
import { ThemeContext, THEME_STORAGE_KEY, type Theme, type ThemeContextValue } from "./theme-context";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark") return saved;

        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
        return prefersDark ? "dark" : "light";
    });

    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            setTheme: (t) => setThemeState(t),
            toggle: () => setThemeState((p) => (p === "dark" ? "light" : "dark")),
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
