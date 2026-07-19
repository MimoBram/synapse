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
        card: "20px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          strong: "hsl(var(--primary-strong))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          subtle: "hsl(var(--subtle-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic tints — spark (hiring / attention), sprout (open_source),
        // ink-tint (personal / generic skill chip). Not extra accents to
        // reach for elsewhere; each maps to one specific meaning.
        spark: {
          DEFAULT: "hsl(var(--spark))",
          foreground: "hsl(var(--spark-foreground))",
          tint: "hsl(var(--spark-tint))",
          "tint-foreground": "hsl(var(--spark-tint-foreground))",
        },
        sprout: {
          DEFAULT: "hsl(var(--sprout))",
          foreground: "hsl(var(--sprout-foreground))",
          tint: "hsl(var(--sprout-tint))",
          "tint-foreground": "hsl(var(--sprout-tint-foreground))",
        },
        "ink-tint": {
          DEFAULT: "hsl(var(--ink-tint))",
          foreground: "hsl(var(--ink-tint-foreground))",
        },
      },
    },
  },
  plugins: [],
};
