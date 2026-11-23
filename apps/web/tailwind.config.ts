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
        paper: "#f7f1f3",
        "paper-deep": "#efe4e8",
        night: "#141211",
        "night-deep": "#0e0d0c",
        cream: "#f7f1f3",
        cta: "#c75d7e",
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
