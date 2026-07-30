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
        sans: [
          "Bangla",
          "Noto Sans Bengali",
          "Hind Siliguri",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        albert: ['"Albert Sans"', 'sans-serif'],
        arvo: ['Arvo', 'serif'],
        cormorant: ['Cormorant', 'serif'],
        lora: ['Lora', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        newsreader: ['Newsreader', 'serif'],
        overpass: ['Overpass', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
        worksans: ['"Work Sans"', 'sans-serif'],
        google: ['"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
        roboto: ["Roboto", "sans-serif"],
        slab: ["Roboto Slab", "serif"],
        mono: [
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
