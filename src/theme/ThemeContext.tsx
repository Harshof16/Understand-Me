import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkColors, lightColors, ThemeColors } from "./colors";
import { createTypography, Typography } from "./typography";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: Typography;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
};

const THEME_STORAGE_KEY = "@um/themeMode";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(
    Appearance.getColorScheme() === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") {
        setModeState(stored);
      }
    });
  }, []);

  function setMode(next: ThemeMode) {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }

  function toggleTheme() {
    setMode(mode === "dark" ? "light" : "dark");
  }

  const colors = mode === "dark" ? darkColors : lightColors;
  const typography = useMemo(() => createTypography(colors), [colors]);
  const value = useMemo(
    () => ({ mode, colors, typography, toggleTheme, setMode }),
    [mode, colors, typography]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
