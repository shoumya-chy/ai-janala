import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Bangladesh-flag green, used as the primary brand color throughout.
        "brand-green": {
          light: "#E6F2EE",
          DEFAULT: "#006A4E",
          dark: "#00543E",
        },
      },
      fontFamily: {
        // Default body font: Latin text renders in Inter, Bengali characters
        // fall back to Noto Sans Bengali automatically (per-glyph fallback).
        sans: [
          "var(--font-inter)",
          "var(--font-noto-bengali)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        // Explicit utility for spans of Bengali text that want the Bengali
        // face prioritized first (still falls back to Inter/system fonts).
        bengali: [
          "var(--font-noto-bengali)",
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
