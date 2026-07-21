/**
 * Single source of truth for the disciplined 4px-grid spacing scale and the
 * 5-level typography hierarchy. These values are mirrored in
 * tailwind.config.js (fontSize/borderRadius) so `className` usage and
 * direct style objects never drift apart. See .claude/plans and the
 * "Synapse — Design language" artifact for the rationale: Crafted / Warm /
 * Vivid, mobile-sized typography (not the original web mega-prompt px
 * values), SemiBold 600 for titles rather than Bold 700.
 */

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

export type TypographyVariant = "display" | "heading" | "subheading" | "body" | "caption";

export const typography: Record<TypographyVariant, { fontSize: number; lineHeight: number; fontWeight: "400" | "600" }> = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "600" },
  heading: { fontSize: 24, lineHeight: 32, fontWeight: "600" },
  subheading: { fontSize: 18, lineHeight: 26, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
};

/**
 * Radius is deliberately not one flat value everywhere: cards get a larger,
 * softer radius than buttons/badges so the two families read as distinct
 * layers (see "sentuhan ajaib" in the design-language artifact).
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  card: 24,
  full: 9999,
} as const;

/** Minimum touch target size (Apple HIG / Material baseline). */
export const minTouchTarget = 44;

/**
 * Soft, diffused card elevation (RN only supports one shadow per view, so
 * this approximates the two-layer web shadow from the design-language
 * artifact as a single tuned shadow). shadowColor is a dark violet rather
 * than pure black to match the ink accent.
 */
export const cardShadow = {
  shadowColor: "#1c143c",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 20,
  elevation: 4,
} as const;

/** Tighter, lower shadow for the hero/featured card. */
export const cardShadowLg = {
  shadowColor: "#1c143c",
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.16,
  shadowRadius: 28,
  elevation: 7,
} as const;

/**
 * Gradient stops for the primary button (top -> bottom), mirroring
 * --primary-strong -> --primary from global.css. Duplicated as literal hex
 * because expo-linear-gradient needs concrete colors, not CSS vars.
 */
export const gradients = {
  primary: {
    light: ["#322a9e", "#4338ca"] as [string, string],
    dark: ["#a3a6f4", "#8b8ff0"] as [string, string],
  },
} as const;

/**
 * Metadata/label text (timestamps, skill tags, counts) uses the platform
 * monospace face — a small, deliberate detail that reads as "developer
 * tool" rather than generic SaaS. Sourced from constants/theme.ts so it
 * stays in sync with the rest of the app's font handling.
 */
export { Fonts as fonts } from "@/constants/theme";
