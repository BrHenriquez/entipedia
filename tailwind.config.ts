import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f3c88",
          foreground: "#ffffff",
          muted: "#9ba4b4"
        },
        gold: {
          DEFAULT: "#ffd700",
          foreground: "#000000",
          muted: "#f5e6b3"
        }
      }
    }
  },
  plugins: []
};

export default config;

