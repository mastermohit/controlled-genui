import { describe, expect, it } from "vitest";
import { generateControlledPage, getBudget } from "./generator";

describe("getBudget", () => {
  it("parses plain INR budgets", () => {
    expect(getBudget("Find a laptop under INR 80,000")).toBe(80000);
  });

  it("parses compact k budgets", () => {
    expect(getBudget("coding laptop below 65k")).toBe(65000);
  });

  it("defaults when no budget is provided", () => {
    expect(getBudget("find a laptop for coding")).toBe(80000);
  });
});

describe("generateControlledPage", () => {
  it("renders no_results when the trusted catalog has no matching budget", () => {
    const page = generateControlledPage("Find a laptop for coding under INR 20,000");

    expect(page.components.some((component) => component.type === "no_results")).toBe(true);
    expect(page.components.some((component) => component.type === "recommendation_cards")).toBe(false);
    expect(page.components.some((component) => component.type === "comparison_table")).toBe(false);
  });

  it("keeps catalog recommendations when products fit the budget", () => {
    const page = generateControlledPage("Find a laptop for coding under INR 80,000");

    expect(page.components.some((component) => component.type === "recommendation_cards")).toBe(true);
    expect(page.components.some((component) => component.type === "no_results")).toBe(false);
  });
});
