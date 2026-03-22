import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        action: {
          DEFAULT: "#FF6A00",
          foreground: "#FFFFFF"
        },
        "blue-muted": {
          DEFAULT: "#4A6FA5",
          foreground: "#FFFFFF"
        },
        "deep-blue": "#0F4C81",
        gray: {
          100: "#F3F3F3",
          200: "#D9D9D9",
          400: "#BFBFBF",
          600: "#8C8C8C"
        },
        paper: "#F3F3F3",
        "paper-soft": "#EDEDED",
        surface: "#FFFFFF",
        "surface-soft": "#F7F7F7",
        line: "#E5E7EB",
        ink: "#111111",
        "ink-soft": "#6B7280",
        "ink-muted": "#6B7280",
        state: {
          neutral: "#BFBFBF",
          progress: "#4A6FA5",
          done: "#0F4C81"
        },
        brand: {
          50: "#FFF1E5",
          100: "#FFE0CC",
          200: "#FFC299",
          500: "#FF6A00",
          600: "#E66000",
          700: "#CC5500"
        },
        note: {
          yellow: "#D9D9D9",
          green: "#FFFFFF",
          blue: "#FFFFFF",
          purple: "#FFFFFF",
          coral: "#FFFFFF"
        },
        success: "#0F4C81",
        warning: "#FF6A00",
        danger: "#FF6A00",
        info: "#4A6FA5",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"]
      },
      boxShadow: {
        soft: "0 8px 24px rgba(17, 17, 17, 0.06)",
        card: "0 10px 30px rgba(17, 17, 17, 0.08)",
        panel: "0 2px 10px rgba(17, 17, 17, 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
