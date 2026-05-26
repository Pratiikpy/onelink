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
        ink: "#0A0A0C",
        panel: "#131316",
        "panel-soft": "#1A1A1E",
        line: "rgba(255,255,255,0.09)",
        snow: "#FAFAFA",
        muted: "#8e919a",
        lime: "#C9F267",
        amber: "#f2bf5f",
        danger: "#ff7777",
      },
      boxShadow: {
        glow: "0 16px 44px -26px rgba(201, 242, 103, 0.55)",
        hairline: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      letterSpacing: {
        tighter2: "-0.03em",
      },
    },
  },
  plugins: [],
};

export default config;
