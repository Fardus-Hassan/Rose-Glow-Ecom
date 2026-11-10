import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f0ebe4",
        "paper-deep": "#e7e0d6",
        ink: "#1c1a19",
        muted: "#7d7470",
        rose: "#c9a08a",
        night: "#121110",
        "night-deep": "#0e0d0c",
        cream: "#f4efe8",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        atelier:
          "0 24px 64px rgba(14, 13, 12, 0.12), 0 2px 8px rgba(14, 13, 12, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
