import { describe, expect, it } from "vitest";
import { offerCards, portfolioWorks, processSteps } from "./portfolioContent";

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
});
