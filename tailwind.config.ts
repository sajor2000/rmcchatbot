import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rush: {
          legacy: "#006332",
          growth: "#30AE6E",
          vitality: "#5FEEA2",
          sage: "#DFF9EB",
          gold: "#FFC60B",
          blue: "#005DB3",
          purple: "#2D1D4E",
          blush: "#FFE3E0",
          muted: "#6CA389",
          warm: "#F2DBB3",
          gray: "#AFAEAF",
          "dark-gray": "#5F5B58"
        },
        epic: {
          navy: "#1B3A5C",
          sidebar: "#F0F0F0",
          "row-alt": "#F7F9FC",
          selected: "#D6E4F0",
          border: "#C8C8C8",
          text: "#1A1A1A",
          "text-secondary": "#5A5A5A",
          link: "#0060AF",
          high: "#CC0000",
          low: "#0060AF",
          critical: "#8B0000",
          "critical-bg": "#FFF0F0",
          final: "#2E7D32",
          pending: "#E65100",
          preliminary: "#1565C0"
        }
      },
      fontFamily: {
        heading: ["Calibre", "Helvetica Neue", "Arial", "sans-serif"],
        body: ["Calibre", "Helvetica Neue", "Arial", "sans-serif"],
        editorial: ["Georgia", "Times New Roman", "serif"]
      },
      boxShadow: {
        panel: "0 18px 45px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
