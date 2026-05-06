import type { ComponentType, GeneratedPage, ValidationResult } from "./types";

export const componentRegistry: Array<{
  type: ComponentType;
  purpose: string;
  allowedProps: string[];
}> = [
  {
    type: "intent_summary",
    purpose: "Summarizes the user's shopping intent and confidence score.",
    allowedProps: ["title", "budgetLabel", "primaryUse", "confidence"]
  },
  {
    type: "filter_chips",
    purpose: "Shows extracted constraints as controlled chips.",
    allowedProps: ["chips"]
  },
  {
    type: "recommendation_cards",
    purpose: "Renders trusted products from productIds only.",
    allowedProps: ["productIds"]
  },
  {
    type: "comparison_table",
    purpose: "Compares approved product fields in a fixed table.",
    allowedProps: ["productIds", "columns"]
  },
  {
    type: "insight_panel",
    purpose: "Adds a controlled recommendation rationale.",
    allowedProps: ["heading", "body", "tone"]
  },
  {
    type: "next_steps",
    purpose: "Offers approved follow-up actions.",
    allowedProps: ["actions"]
  }
];

export const allowedComponents = componentRegistry.map((component) => component.type);

export function validateGeneratedPage(page: GeneratedPage): ValidationResult {
  return validateUnknownPage(page);
}

export function validateUnknownPage(page: unknown): ValidationResult {
  const errors: string[] = [];
  const blockedComponents: string[] = [];

  if (!isRecord(page)) {
    return {
      ok: false,
      errors: ["Schema must be an object"],
      allowedComponents,
      blockedComponents
    };
  }

  if (page.pageType !== "product_finder") errors.push("Unsupported page type");
  if (page.schemaVersion !== "1.0") errors.push("Unsupported schema version");
  if (!Array.isArray(page.components)) errors.push("Components must be an array");

  if (Array.isArray(page.components)) {
    page.components.forEach((component, index) => {
      if (!isRecord(component) || typeof component.type !== "string") {
        errors.push(`Component ${index + 1} is malformed`);
        return;
      }

      if (!allowedComponents.includes(component.type as ComponentType)) {
        blockedComponents.push(component.type);
        errors.push(`Component ${index + 1} uses an unapproved type`);
      }
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    allowedComponents,
    blockedComponents
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
