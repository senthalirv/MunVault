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
        vault: {
          bg: "#0B0E14",
          subtle: "#10141D",
          panel: "#151B26",
          card: "#192130",
          cardHover: "#202A3C",
          border: "#293548",
          borderStrong: "#3E4E68",
          ink: "#080A0E",
          coral: "#FF5C6C",
          coralLight: "#FF7D8A",
          teal: "#38E1C2",
          tealDark: "#1FA68E",
          yellow: "#FFD152",
          amber: "#FFB020",
          lavender: "#8E89F0",
          blue: "#5373F2",
          text: "#F1F5F9",
          muted: "#8E9BB0",
          dim: "#5A677D"
        }
      },
      fontFamily: {
        sans: ["var(--font-space)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"]
      },
      boxShadow: {
        "neo-sm": "3px 3px 0px #080A0E",
        "neo": "4px 4px 0px #080A0E",
        "neo-lg": "6px 6px 0px #080A0E",
        "neo-coral": "4px 4px 0px #FF5C6C",
        "neo-teal": "4px 4px 0px #38E1C2",
        "neo-yellow": "4px 4px 0px #FFD152",
      }
    },
  },
  plugins: [],
};
export default config;
