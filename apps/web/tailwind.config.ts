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
        rose: "#c9a08a",
        charcoal: "var(--rg-charcoal)",
        ink: "#1c1a19",
        muted: "#7d7470",
        line: "var(--rg-line)",
        paper: "#f0ebe4",
        "paper-deep": "#e7e0d6",
        night: "#121110",
        "night-deep": "#0e0d0c",
        cream: "#f4efe8",
      },
      boxShadow: {
        atelier:
          "0 24px 64px rgba(14, 13, 12, 0.12), 0 2px 8px rgba(14, 13, 12, 0.06)",
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
