import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: "#FCD34D",
          "yellow-secondary": "#FDE68A",
        },
        accent: {
          green: "#86EFAC",
          purple: "#A78BFA",
        },
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
        },
        background: "#F9FAFB",
        card: "#FFFFFF",
        border: "#E5E7EB",
      },
      borderRadius: {
        card: "16px",
        button: "20px",
        badge: "12px",
        "bottom-nav": "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.1)",
        "bottom-nav": "0 -2px 10px rgba(0,0,0,0.1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        heading: "24px",
        "section-title": "20px",
        "card-title": "16px",
        body: "14px",
        small: "12px",
        label: "13px",
      },
      spacing: {
        "safe-area": "env(safe-area-inset-bottom)",
      },
    },
  },
  plugins: [],
};

export default config;
