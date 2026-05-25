import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface
        ink: "#08090C",
        panel: "#13141B",
        panel2: "#1B1D27",
        line: "rgba(255,255,255,0.08)",

        // Brand / accent
        violet: "#7C5CFF",
        "violet-soft": "#A89BFF",
        cyan: "#5AE3FF",
        mint: "#34D399",
        amber: "#FBBF24",
        ash: "#9CA1B0",
      },
      boxShadow: {
        // Subtle violet glow, Apple-restrained — used only on primary CTAs.
        glow: "0 14px 40px -16px rgba(124, 92, 255, 0.55)",
        "glow-sm": "0 8px 24px -12px rgba(124, 92, 255, 0.5)",
        hairline: "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightish: "-0.012em",
        tighter2: "-0.025em",
      },
    },
  },
  plugins: [],
};

export default config;
