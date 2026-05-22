import { describe, expect, it } from "vitest";
import { epicStyleTokens, rushStyleTokens, styleSource } from "@/lib/styleTokens";

describe("Rush style tokens", () => {
  it("matches the authoritative style guide colors and source", () => {
    expect(styleSource).toBe("docs/STYLE_GUIDE.md");
    expect(rushStyleTokens.colors.legacyGreen).toBe("#006332");
    expect(rushStyleTokens.colors.growthGreen).toBe("#30AE6E");
    expect(rushStyleTokens.colors.vitalityGreen).toBe("#5FEEA2");
  });

  it("uses Calibre with accessible fallbacks", () => {
    expect(rushStyleTokens.fonts.heading).toContain("Calibre");
    expect(rushStyleTokens.fonts.heading).toContain("Helvetica Neue");
  });

  it("includes Epic artifact panel tokens from the style guide", () => {
    expect(epicStyleTokens.colors.navy).toBe("#1B3A5C");
    expect(epicStyleTokens.colors.border).toBe("#C8C8C8");
    expect(epicStyleTokens.fonts.clinical).toContain("Segoe UI");
  });
});
