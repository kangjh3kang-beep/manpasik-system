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
        manpasik: {
          primary: "#0ea5e9",
          secondary: "#8b5cf6",
          accent: "#10b981",
          dark: "#0f172a",
          darker: "#020617",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "manpasik-gradient": "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #10b981 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #0ea5e9, 0 0 10px #0ea5e9, 0 0 15px #0ea5e9" },
          "100%": { boxShadow: "0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
