import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        mvv: {
          dark: "#242D3F",
          navy: "#083262",
          gold: "#A47C3B",
          "gold-hover": "#8B6929",
          "gold-focus": "#7A5C24",
          beige: "#D7C7A3",
          "beige-light": "#EDE6D6",
        },
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
