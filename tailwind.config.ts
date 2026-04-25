import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // shadcn semantic tokens (kept for any shadcn primitives still in use)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // AUMECHO design system tokens
        void: "#050507",
        surface: "#0A0A0F",
        glass: "rgba(255,255,255,0.04)",
        "hud-border": "rgba(255,255,255,0.08)",
        "border-glow": "rgba(0,242,255,0.4)",
        cyan: {
          DEFAULT: "#00F2FF",
          dim: "rgba(0,242,255,0.15)",
        },
        slate: "#475569",
        ghost: "rgba(255,255,255,0.55)",
        pure: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        hud: "0.15em",
      },
      backgroundImage: {
        "nebula-radial":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,242,255,0.07) 0%, rgba(120,40,200,0.05) 40%, transparent 70%)",
        "glow-cyan":
          "radial-gradient(circle at center, rgba(0,242,255,0.12) 0%, transparent 70%)",
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        "glow-sm": "0 0 12px rgba(0,242,255,0.15)",
        "glow-md": "0 0 30px rgba(0,242,255,0.2)",
        "glow-lg": "0 0 60px rgba(0,242,255,0.15)",
        "inset-border": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        noiseShift: {
          "0%": { backgroundPosition: "0 0" },
          "50%": { backgroundPosition: "50% 50%" },
          "100%": { backgroundPosition: "0 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "blink-soft": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 6s ease-in-out infinite",
        scan: "scan 6s linear infinite",
        "noise-shift": "noiseShift 0.5s steps(2) infinite",
        marquee: "marquee 40s linear infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "blink-soft": "blink-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
