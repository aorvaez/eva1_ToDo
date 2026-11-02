import type { TextStyle, ViewStyle } from "react-native";

// Material Design 3 roles, light theme, one accent. All text pairs are >= 4.5:1 (WCAG AA).
export const colors = {
  primary: "#2F5D50",
  onPrimary: "#FFFFFF",
  primaryContainer: "#D6EADF",
  background: "#F6F8F5",
  surface: "#FFFFFF",
  text: "#1B1F1C",
  textSecondary: "#4A524D",
  placeholder: "#6B736E",
  outline: "#727973",
  error: "#B3261C",
} as const;

// 8 dp scale.
export const spacing = { sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { input: 12, card: 16, pill: 24, fab: 28 } as const;

export const minTouchTarget = 48;

export const typography = {
  headline: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
  title: { fontSize: 16, lineHeight: 24, fontWeight: "700" },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
  button: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
} satisfies Record<string, TextStyle>;

export const shadow = {
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fab: {
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
} satisfies Record<string, ViewStyle>;
