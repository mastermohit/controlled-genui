import { describe, expect, it } from "vitest";
import { enforceCatalogConstraints } from "./catalogGuardrails";
import type { GeneratedPage } from "./types";

describe("enforceCatalogConstraints", () => {
  it("removes over-budget LLM product ids and inserts no_results", () => {
    const unsafePage: GeneratedPage = {
      pageType: "product_finder",
      schemaVersion: "1.0",
      generatedFrom: "Find a laptop for coding under INR 20,000",
      components: [
        {
          type: "intent_summary",
          props: {
            title: "Test",
            budgetLabel: "INR 20,000",
            primaryUse: "coding",
            confidence: 90
          }
        },
        {
          type: "recommendation_cards",
          props: {
            productIds: ["lenovo-loq-15"]
          }
        },
        {
          type: "comparison_table",
          props: {
            productIds: ["lenovo-loq-15"],
            columns: ["name", "price", "processor"]
          }
        },
        {
          type: "next_steps",
          props: {
            actions: ["Increase the budget"]
          }
        }
      ]
    };

    const safePage = enforceCatalogConstraints(unsafePage);

    expect(safePage.components.some((component) => component.type === "recommendation_cards")).toBe(false);
    expect(safePage.components.some((component) => component.type === "comparison_table")).toBe(false);
    expect(safePage.components.some((component) => component.type === "no_results")).toBe(true);
  });
});
