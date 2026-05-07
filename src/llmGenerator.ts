import { generateControlledPage } from "./generator";
import { enforceCatalogConstraints } from "./catalogGuardrails";
import { parseGeneratedPage } from "./structuredSchema";
import type { GenerationResult } from "./types";

type ApiGenerationResponse = {
  source: "llm" | "fallback";
  page?: unknown;
  rawModelOutput?: unknown;
  error?: string;
};

export async function generateWithLlm(prompt: string): Promise<GenerationResult> {
  try {
    const response = await fetch("/api/generate-schema", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const payload = (await response.json()) as ApiGenerationResponse;

    if (!response.ok || payload.source === "fallback" || !payload.page) {
      return {
        page: generateControlledPage(prompt),
        source: "fallback",
        rawModelOutput: payload.rawModelOutput,
        error: payload.error || "LLM generation failed"
      };
    }

    const page = enforceCatalogConstraints(parseGeneratedPage(payload.page));

    return {
      page,
      source: "llm",
      rawModelOutput: payload.rawModelOutput ?? payload.page
    };
  } catch (error) {
    return {
      page: generateControlledPage(prompt),
      source: "fallback",
      error: error instanceof Error ? error.message : "Unable to reach the LLM endpoint"
    };
  }
}
