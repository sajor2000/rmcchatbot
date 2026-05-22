export const rushStyleTokens = {
  colors: {
    legacyGreen: "#006332",
    growthGreen: "#30AE6E",
    vitalityGreen: "#5FEEA2",
    sageGreen: "#DFF9EB",
    gold: "#FFC60B",
    blue: "#005DB3",
    purple: "#2D1D4E",
    blush: "#FFE3E0",
    mutedGreen: "#6CA389",
    warmNeutral: "#F2DBB3",
    gray: "#AFAEAF",
    darkGray: "#5F5B58",
    black: "#000000",
    white: "#FFFFFF"
  },
  fonts: {
    heading: "'Calibre', 'Helvetica Neue', Arial, sans-serif",
    body: "'Calibre', 'Helvetica Neue', Arial, sans-serif",
    editorial: "Georgia, 'Times New Roman', serif"
  },
  radii: {
    control: "4px",
    card: "8px",
    chat: "16px"
  }
} as const;

export const epicStyleTokens = {
  colors: {
    navy: "#1B3A5C",
    sidebar: "#F0F0F0",
    rowAlt: "#F7F9FC",
    selected: "#D6E4F0",
    border: "#C8C8C8",
    text: "#1A1A1A",
    textSecondary: "#5A5A5A",
    high: "#CC0000",
    low: "#0060AF",
    critical: "#8B0000",
    criticalBg: "#FFF0F0",
    final: "#2E7D32"
  },
  fonts: {
    clinical: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    report: "'Consolas', 'Courier New', monospace"
  }
} as const;

export const styleSource = "docs/STYLE_GUIDE.md";
