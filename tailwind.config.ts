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
        brand: {
          50: "#F6F1FB",
          100: "#ECE3F7",
          200: "#DCCEEE",
          600: "#5B4B8A",
          700: "#4C3E73"
        },
        paper: "#FAF7F2",
        "paper-soft": "#F5F1EA",
        surface: "#FFFDFC",
        "surface-soft": "#F8F4EE",
        line: "#E7E0D8",
        ink: "#1F2430",
        "ink-soft": "#4B5563",
        "ink-muted": "#6B7280",
        success: "#5F8F6B",
        warning: "#D28B47",
        danger: "#C05A5A",
        info: "#4A5C7A",
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
        soft: "0 8px 24px rgba(31, 36, 48, 0.06)",
        card: "0 14px 32px rgba(91, 75, 138, 0.10)",
        panel: "0 12px 30px rgba(31, 36, 48, 0.07)"
      }
    }
  },
  plugins: []
};

export default config;
