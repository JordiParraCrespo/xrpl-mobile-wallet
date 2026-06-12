const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/design-system/mobile/src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
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
          soft: "hsl(var(--destructive-soft))",
          "soft-foreground": "hsl(var(--destructive-soft-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          soft: "hsl(var(--brand-soft))",
          "soft-foreground": "hsl(var(--brand-soft-foreground))",
        },
        positive: {
          DEFAULT: "hsl(var(--positive))",
          foreground: "hsl(var(--positive-foreground))",
          soft: "hsl(var(--positive-soft))",
          "soft-foreground": "hsl(var(--positive-soft-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          soft: "hsl(var(--warning-soft))",
          "soft-foreground": "hsl(var(--warning-soft-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          soft: "hsl(var(--info-soft))",
          "soft-foreground": "hsl(var(--info-soft-foreground))",
        },
        inverse: {
          DEFAULT: "hsl(var(--inverse))",
          foreground: "hsl(var(--inverse-foreground))",
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
        // Dewy assistant (chat.html) self-contained palette. Full-colour vars
        // (not hsl triplets) so the dark theme can use translucent-white
        // overlays. Defined in global.css for both modes.
        chat: {
          bg: "var(--chat-bg)",
          fg: "var(--chat-fg)",
          dim: "var(--chat-dim)",
          faint: "var(--chat-faint)",
          bubble: "var(--chat-bubble)",
          "bubble-line": "var(--chat-bubble-line)",
          card: "var(--chat-card)",
          border: "var(--chat-border)",
          hairline: "var(--chat-hairline)",
          line: "var(--chat-line)",
          chip: "var(--chat-chip)",
          "chip-line": "var(--chat-chip-line)",
          input: "var(--chat-input)",
          opt: "var(--chat-opt)",
          "opt-dim": "var(--chat-opt-dim)",
          brand: "var(--chat-brand)",
          positive: "var(--chat-positive)",
          "positive-fg": "var(--chat-positive-fg)",
          negative: "var(--chat-negative)",
          "negative-strong": "var(--chat-negative-strong)",
          "result-bg": "var(--chat-result-bg)",
          "result-line": "var(--chat-result-line)",
          "error-bg": "var(--chat-error-bg)",
          "error-line": "var(--chat-error-line)",
        },
      },
      // Drops shape language: inputs 12, cards 20, sheets 24, pills full.
      borderRadius: {
        sm: 10,
        md: 12,
        lg: 16,
        xl: 20,
        "2xl": 24,
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        // Refero Title — editorial display serif, used at weight 400 ONLY
        // (authority through ink texture, never bolded).
        display: ["ReferoTitle", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrainsMono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
