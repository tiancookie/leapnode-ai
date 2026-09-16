import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#1a1a1a",
          card: "#2a2a2a",
          hover: "#333333",
        },
        foreground: {
          DEFAULT: "#ffffff",
          muted: "#999999",
          disabled: "#666666",
        },
        primary: {
          DEFAULT: "#00d4aa",
          hover: "#00b894",
          foreground: "#ffffff",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
        border: "#333333",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
        full: "999px",
      },
      boxShadow: {
        card: "0 4px 6px rgba(0, 0, 0, 0.5)",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
