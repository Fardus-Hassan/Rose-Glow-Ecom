import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        pearl: "var(--rg-pearl)",
        soft: "var(--rg-soft)",
        blush: "var(--rg-blush)",
        pink: "var(--rg-pink)",
        "pink-deep": "var(--rg-pink-deep)",
        rose: "var(--rg-rose)",
        charcoal: "var(--rg-charcoal)",
        ink: "var(--rg-ink)",
        muted: "var(--rg-muted)",
        line: "var(--rg-line)",
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "var(--font-display-bn)",
          "serif",
        ],
        sans: [
          "var(--font-sans)",
          "var(--font-sans-bn)",
          "system-ui",
          "sans-serif",
        ],
        "display-bn": ["var(--font-display-bn)", "serif"],
        "sans-bn": ["var(--font-sans-bn)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
