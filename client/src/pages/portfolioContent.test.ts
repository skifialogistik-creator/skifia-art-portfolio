import { describe, expect, it } from "vitest";
import { creatorPreviewLabels, offerCards, portfolioWorks, processSteps } from "./portfolioContent";

describe("portfolio content", () => {
  it("keeps the homepage portfolio ready for three real project links", () => {
    expect(portfolioWorks).toHaveLength(3);
    expect(portfolioWorks.map((work) => work.number)).toEqual(["01", "02", "03"]);
    expect(portfolioWorks.every((work) => work.name && work.category && work.description)).toBe(true);
  });

  it("describes a complete service and delivery journey", () => {
    expect(offerCards).toHaveLength(4);
    expect(processSteps.map(([number]) => number)).toEqual(["01", "02", "03", "04"]);
  });

  it("provides a balanced set of animated 3D gallery labels", () => {
    expect(creatorPreviewLabels).toHaveLength(10);
    expect(new Set(creatorPreviewLabels).size).toBe(creatorPreviewLabels.length);
  });
});
