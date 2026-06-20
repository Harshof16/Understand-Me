const moods: Record<string, string> = {
  Happy: "#E8B84B",
  Calm: "#7FB7A6",
  Anxious: "#C98BD9",
  Sad: "#7A93C9",
  Frustrated: "#D97373",
  Energized: "#E08A4B",
  Tired: "#9A98AC",
};

export const lightColors = {
  primary: "#6F67C9",
  primaryDark: "#5A52B0",
  primaryLight: "#EFEDFA",
  secondary: "#8FB9A8",
  secondaryLight: "#E6F2EC",

  background: "#FAF9FE",
  surface: "#FFFFFF",
  surfaceMuted: "#F3F1FA",
  border: "#E5E1F5",

  textPrimary: "#2B2B36",
  textSecondary: "#6E6E80",
  textMuted: "#9A98AC",
  textOnPrimary: "#FFFFFF",

  success: "#6FAE8B",
  warning: "#E0A458",
  danger: "#D97373",

  moods,
};

export const darkColors: typeof lightColors = {
  primary: "#9B92E8",
  primaryDark: "#7A70D9",
  primaryLight: "#2A2745",
  secondary: "#8FC4AE",
  secondaryLight: "#20302A",

  background: "#15131F",
  surface: "#1F1C2E",
  surfaceMuted: "#262338",
  border: "#352F4D",

  textPrimary: "#F2F0FB",
  textSecondary: "#BAB7CC",
  textMuted: "#84819C",
  textOnPrimary: "#FFFFFF",

  success: "#7FC29E",
  warning: "#E6B468",
  danger: "#E08585",

  moods,
};

export type ThemeColors = typeof lightColors;
