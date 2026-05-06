/// <reference types="node" />

import { controlledPageJsonSchema, parseGeneratedPage } from "../src/structuredSchema";

type RequestBody = {
  prompt?: string;
};

const productCatalog = [
  {
    id: "lenovo-loq-15",
    name: "Lenovo LOQ 15",
    price: "INR 74,990",
    bestFor: ["Gaming", "Coding", "College"]
  },
  {
    id: "asus-vivobook-pro",
    name: "ASUS Vivobook Pro 15",
    price: "INR 69,990",
    bestFor: ["Coding", "Creators", "College"]
  },
  {
    id: "hp-victus-16",
    name: "HP Victus 16",
    price: "INR 78,990",
    bestFor: ["Gaming", "Streaming", "Coding"]
  },
  {
    id: "acer-swift-go",
    name: "Acer Swift Go 14",
    price: "INR 62,990",
    bestFor: ["College", "Coding", "Travel"]
  },
  {
    id: "dell-inspiron-14-plus",
    name: "Dell Inspiron 14 Plus",
    price: "INR 72,990",
    bestFor: ["Coding", "Business", "College"]
  }
];

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(200).json({
      source: "fallback",
      error: "OPENAI_API_KEY is not configured"
    });
  }

  const body = (typeof request.body === "string" ? JSON.parse(request.body) : request.body) as RequestBody;
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return response.status(400).json({ error: "Prompt is required" });
  }

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: [
              "You are a controlled Generative UI schema planner.",
              "Return JSON only, matching the provided schema.",
              "Do not invent product ids. Use only product ids from the trusted catalog.",
              "Do not produce HTML, CSS, JavaScript, markdown, URLs, or unregistered component types.",
              "Recommended component order: intent_summary, filter_chips, recommendation_cards, comparison_table, insight_panel, next_steps."
            ].join(" ")
          },
          {
            role: "user",
            content: JSON.stringify({
              prompt,
              trustedProductCatalog: productCatalog,
              allowedComponents: [
                "intent_summary",
                "filter_chips",
                "recommendation_cards",
                "comparison_table",
                "insight_panel",
                "next_steps"
              ]
            })
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "controlled_product_finder_page",
            strict: true,
            schema: controlledPageJsonSchema
          }
        }
      })
    });

    const payload = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return response.status(200).json({
        source: "fallback",
        error: payload.error?.message || "OpenAI request failed",
        rawModelOutput: payload
      });
    }

    const outputText = payload.output_text ?? payload.output?.[0]?.content?.[0]?.text;
    if (!outputText) {
      return response.status(200).json({
        source: "fallback",
        error: "Model response did not include output_text",
        rawModelOutput: payload
      });
    }

    const parsed = parseGeneratedPage(JSON.parse(outputText));

    return response.status(200).json({
      source: "llm",
      page: parsed,
      rawModelOutput: parsed
    });
  } catch (error) {
    return response.status(200).json({
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown generation error"
    });
  }
}
