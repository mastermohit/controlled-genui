import { z } from "zod";
import type { GeneratedPage } from "./types";

const productIdSchema = z.enum([
  "lenovo-loq-15",
  "asus-vivobook-pro",
  "hp-victus-16",
  "acer-swift-go",
  "dell-inspiron-14-plus"
]);

const tableColumnSchema = z.enum(["name", "price", "processor", "ram", "gpu", "battery", "weight"]);

const intentSummarySchema = z.object({
  type: z.literal("intent_summary"),
  props: z.object({
    title: z.string(),
    budgetLabel: z.string(),
    primaryUse: z.string(),
    confidence: z.number().min(0).max(100)
  })
});

const filterChipsSchema = z.object({
  type: z.literal("filter_chips"),
  props: z.object({
    chips: z.array(z.string()).min(1).max(8)
  })
});

const recommendationCardsSchema = z.object({
  type: z.literal("recommendation_cards"),
  props: z.object({
    productIds: z.array(productIdSchema).min(1).max(3)
  })
});

const comparisonTableSchema = z.object({
  type: z.literal("comparison_table"),
  props: z.object({
    productIds: z.array(productIdSchema).min(1).max(3),
    columns: z.array(tableColumnSchema).min(3).max(7)
  })
});

const insightPanelSchema = z.object({
  type: z.literal("insight_panel"),
  props: z.object({
    heading: z.string(),
    body: z.string(),
    tone: z.enum(["good", "warning", "neutral"])
  })
});

const noResultsSchema = z.object({
  type: z.literal("no_results"),
  props: z.object({
    heading: z.string(),
    body: z.string(),
    suggestions: z.array(z.string()).min(1).max(5)
  })
});

const nextStepsSchema = z.object({
  type: z.literal("next_steps"),
  props: z.object({
    actions: z.array(z.string()).min(1).max(5)
  })
});

export const controlledComponentSchema = z.discriminatedUnion("type", [
  intentSummarySchema,
  filterChipsSchema,
  recommendationCardsSchema,
  comparisonTableSchema,
  insightPanelSchema,
  noResultsSchema,
  nextStepsSchema
]);

export const generatedPageSchema = z.object({
  pageType: z.literal("product_finder"),
  schemaVersion: z.literal("1.0"),
  generatedFrom: z.string(),
  components: z.array(controlledComponentSchema).min(1).max(8)
});

export function parseGeneratedPage(value: unknown): GeneratedPage {
  return generatedPageSchema.parse(value) as GeneratedPage;
}

const productIds = [
  "lenovo-loq-15",
  "asus-vivobook-pro",
  "hp-victus-16",
  "acer-swift-go",
  "dell-inspiron-14-plus"
];

const tableColumns = ["name", "price", "processor", "ram", "gpu", "battery", "weight"];

export const controlledPageJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["pageType", "schemaVersion", "generatedFrom", "components"],
  properties: {
    pageType: { type: "string", enum: ["product_finder"] },
    schemaVersion: { type: "string", enum: ["1.0"] },
    generatedFrom: { type: "string" },
    components: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        anyOf: [
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "props"],
            properties: {
              type: { type: "string", enum: ["intent_summary"] },
              props: {
                type: "object",
                additionalProperties: false,
                required: ["title", "budgetLabel", "primaryUse", "confidence"],
                properties: {
                  title: { type: "string" },
                  budgetLabel: { type: "string" },
                  primaryUse: { type: "string" },
                  confidence: { type: "number", minimum: 0, maximum: 100 }
                }
              }
            }
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "props"],
            properties: {
              type: { type: "string", enum: ["filter_chips"] },
              props: {
                type: "object",
                additionalProperties: false,
                required: ["chips"],
                properties: {
                  chips: { type: "array", minItems: 1, maxItems: 8, items: { type: "string" } }
                }
              }
            }
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "props"],
            properties: {
              type: { type: "string", enum: ["recommendation_cards"] },
              props: {
                type: "object",
                additionalProperties: false,
                required: ["productIds"],
                properties: {
                  productIds: { type: "array", minItems: 1, maxItems: 3, items: { type: "string", enum: productIds } }
                }
              }
            }
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "props"],
            properties: {
              type: { type: "string", enum: ["comparison_table"] },
              props: {
                type: "object",
                additionalProperties: false,
                required: ["productIds", "columns"],
                properties: {
                  productIds: { type: "array", minItems: 1, maxItems: 3, items: { type: "string", enum: productIds } },
                  columns: { type: "array", minItems: 3, maxItems: 7, items: { type: "string", enum: tableColumns } }
                }
              }
            }
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "props"],
            properties: {
              type: { type: "string", enum: ["insight_panel"] },
              props: {
                type: "object",
                additionalProperties: false,
                required: ["heading", "body", "tone"],
                properties: {
                  heading: { type: "string" },
                  body: { type: "string" },
                  tone: { type: "string", enum: ["good", "warning", "neutral"] }
                }
              }
            }
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "props"],
            properties: {
              type: { type: "string", enum: ["no_results"] },
              props: {
                type: "object",
                additionalProperties: false,
                required: ["heading", "body", "suggestions"],
                properties: {
                  heading: { type: "string" },
                  body: { type: "string" },
                  suggestions: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } }
                }
              }
            }
          },
          {
            type: "object",
            additionalProperties: false,
            required: ["type", "props"],
            properties: {
              type: { type: "string", enum: ["next_steps"] },
              props: {
                type: "object",
                additionalProperties: false,
                required: ["actions"],
                properties: {
                  actions: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } }
                }
              }
            }
          }
        ]
      }
    }
  }
} as const;
