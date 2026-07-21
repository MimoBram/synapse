/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Typography scale — see .claude/plans design tokens: 5 disciplined
      // levels, sized for mobile screens rather than desktop web.
      fontSize: {
        display: ["32px", { lineHeight: "40px", fontWeight: "600" }],
        heading: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        subheading: ["18px", { lineHeight: "26px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        card: "24px",
      },
      colors: {
        // "/ <alpha-value>" lets Tailwind opacity modifiers (bg-card/60,
        // border-white/15) actually work — plain hsl(var(--x)) can't take
        // a modifier, it needs the alpha slot in the function itself.
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          strong: "hsl(var(--primary-strong) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          subtle: "hsl(var(--subtle-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        // Semantic tints — spark (hiring / attention), sprout (open_source),
        // ink-tint (personal / generic skill chip). Not extra accents to
        // reach for elsewhere; each maps to one specific meaning.
        spark: {
          DEFAULT: "hsl(var(--spark) / <alpha-value>)",
          foreground: "hsl(var(--spark-foreground) / <alpha-value>)",
          tint: "hsl(var(--spark-tint) / <alpha-value>)",
          "tint-foreground": "hsl(var(--spark-tint-foreground) / <alpha-value>)",
        },
        sprout: {
          DEFAULT: "hsl(var(--sprout) / <alpha-value>)",
          foreground: "hsl(var(--sprout-foreground) / <alpha-value>)",
          tint: "hsl(var(--sprout-tint) / <alpha-value>)",
          "tint-foreground": "hsl(var(--sprout-tint-foreground) / <alpha-value>)",
        },
        "ink-tint": {
          DEFAULT: "hsl(var(--ink-tint) / <alpha-value>)",
          foreground: "hsl(var(--ink-tint-foreground) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
