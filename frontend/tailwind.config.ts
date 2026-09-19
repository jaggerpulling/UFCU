import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          subtle: "var(--color-primary-subtle)",
          lighter: "var(--color-primary-lighter)",
          DEFAULT: "var(--color-primary)",
          darker: "var(--color-primary-darker)",
          darkest: "var(--color-primary-darkest)",
        },
        secondary: {
          subtle: "var(--color-secondary-subtle)",
          lighter: "var(--color-secondary-lighter)",
          DEFAULT: "var(--color-secondary)",
          darker: "var(--color-secondary-darker)",
          darkest: "var(--color-secondary-darkest)",
        },
        accent: {
          subtle: "var(--color-accent-subtle)",
          lighter: "var(--color-accent-lighter)",
          DEFAULT: "var(--color-accent)",
          darker: "var(--color-accent-darker)",
          darkest: "var(--color-accent-darkest)",
        },
        canvas: {
          DEFAULT: "var(--color-canvas)",
          soft: "var(--color-canvas-soft)",
        },
        ink: "var(--color-ink)",
        body: "var(--color-body)",
        mute: "var(--color-mute)",
        positive: {
          DEFAULT: "var(--color-positive)",
          subtle: "var(--color-positive-subtle)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          subtle: "var(--color-warning-subtle)",
        },
        negative: {
          DEFAULT: "var(--color-negative)",
          subtle: "var(--color-negative-subtle)",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        data: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        hero: ["3.5rem", { lineHeight: "3.75rem", fontWeight: "700", letterSpacing: "-0.01em" }],
        "display-lg": ["2.5rem", { lineHeight: "2.875rem", fontWeight: "600", letterSpacing: "-0.01em" }],
        "display-md": ["1.75rem", { lineHeight: "2.125rem", fontWeight: "600", letterSpacing: "-0.01em" }],
        "display-sm": ["1.375rem", { lineHeight: "1.75rem", fontWeight: "600", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6875rem" }],
        "body-md": ["1rem", { lineHeight: "1.5rem" }],
        "body-sm": ["0.875rem", { lineHeight: "1.25rem" }],
        caption: ["0.75rem", { lineHeight: "1rem" }],
        "data-lg": ["2rem", { lineHeight: "2.375rem", fontWeight: "500" }],
        "data-md": ["1rem", { lineHeight: "1.375rem", fontWeight: "500" }],
        "data-sm": ["0.8125rem", { lineHeight: "1.125rem" }],
      },
      spacing: {
        xxs: "0.125rem",
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
      },
      minHeight: {
        touch: "3rem",
        scan: "4rem",
      },
      maxWidth: {
        flow: "30rem",
        phone: "24.375rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
