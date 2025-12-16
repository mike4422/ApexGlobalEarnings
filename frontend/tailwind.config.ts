// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050816",
        bgAlt: "#0b1020",
        accentGold: "#f7b500",
        accentGreen: "#00ff85",
      },
    },
  },
  plugins: [],
};

export default config;
