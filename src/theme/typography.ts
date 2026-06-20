import type { ThemeColors } from "./colors";

export function createTypography(colors: ThemeColors) {
  return {
    title: { fontSize: 26, fontWeight: "700" as const, color: colors.textPrimary },
    heading: { fontSize: 20, fontWeight: "700" as const, color: colors.textPrimary },
    subheading: { fontSize: 16, fontWeight: "600" as const, color: colors.textPrimary },
    body: { fontSize: 15, fontWeight: "400" as const, color: colors.textPrimary, lineHeight: 21 },
    bodyMuted: { fontSize: 14, fontWeight: "400" as const, color: colors.textSecondary, lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: "500" as const, color: colors.textMuted },
  };
}

export type Typography = ReturnType<typeof createTypography>;
