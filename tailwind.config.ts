import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        red: {
          650: "#d91414",
        },
      },
      fontFamily: {
        sans: ["var(--font-hind-siliguri)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
