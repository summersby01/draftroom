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
          50: "#F3EDFF",
          100: "#E8D7FF",
          200: "#D6BEFF",
          600: "#5B4B8A",
          700: "#46386D"
        },
        paper: "#FFFFFF",
        "paper-soft": "#F7F7F7",
        surface: "#FFFFFF",
        "surface-soft": "#FAFAFA",
        line: "#ECECEC",
        ink: "#111111",
        "ink-soft": "#4B5563",
        "ink-muted": "#737373",
        note: {
          yellow: "#FFF3B0",
          green: "#D9F8C4",
          blue: "#C7E9FF",
          purple: "#E8D7FF"
        },
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
        soft: "none",
        card: "none",
        panel: "none"
      }
    }
  },
  plugins: []
};

export default config;
