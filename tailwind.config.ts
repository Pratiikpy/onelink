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
        ink: "#050507",
        panel: "#101016",
        panel2: "#171523",
        line: "rgba(255,255,255,0.11)",
        violet: "#8f84ff",
        mint: "#55d79a",
        ash: "#a4a1ad",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(143, 132, 255, 0.2)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
