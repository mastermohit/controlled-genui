/// <reference types="node" />

import { controlledPageJsonSchema, parseGeneratedPage } from "../src/structuredSchema";

type RequestBody = {
  prompt?: string;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
  controlledGenuiRateLimit?: Map<string, RateLimitRecord>;
};

const rateLimitStore = globalRateLimitStore.controlledGenuiRateLimit ?? new Map<string, RateLimitRecord>();
globalRateLimitStore.controlledGenuiRateLimit = rateLimitStore;

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 5);
const maxPromptLength = Number(process.env.MAX_PROMPT_LENGTH || 500);

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

  const rateLimit = checkRateLimit(getClientId(request));
  response.setHeader("X-RateLimit-Limit", rateLimitMaxRequests.toString());
  response.setHeader("X-RateLimit-Remaining", Math.max(0, rateLimit.remaining).toString());
  response.setHeader("X-RateLimit-Reset", Math.ceil(rateLimit.resetAt / 1000).toString());

  if (!rateLimit.allowed) {
    response.setHeader("Retry-After", Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString());
    return response.status(429).json({
      source: "fallback",
      error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`
    });
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

  if (prompt.length > maxPromptLength) {
    return response.status(400).json({
      source: "fallback",
      error: `Prompt is too long. Maximum length is ${maxPromptLength} characters.`
    });
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
              "Recommended component order: intent_summary, filter_chips, recommendation_cards, comparison_table, insight_panel, next_steps.",
              "If no trusted catalog product fits the user's budget or constraints, use no_results instead of recommendation_cards and comparison_table."
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
                "no_results",
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

function getClientId(request: any) {
  const forwardedFor = request.headers["x-forwarded-for"];
  const firstForwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0];
  const ip =
    firstForwardedIp?.trim() ||
    request.headers["x-real-ip"] ||
    request.socket?.remoteAddress ||
    "anonymous";

  return Array.isArray(ip) ? ip[0] : ip;
}

function checkRateLimit(clientId: string) {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const record = rateLimitStore.get(clientId);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + rateLimitWindowMs
    });

    return {
      allowed: true,
      remaining: rateLimitMaxRequests - 1,
      resetAt: now + rateLimitWindowMs
    };
  }

  if (record.count >= rateLimitMaxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt
    };
  }

  record.count += 1;
  rateLimitStore.set(clientId, record);

  return {
    allowed: true,
    remaining: rateLimitMaxRequests - record.count,
    resetAt: record.resetAt
  };
}

function cleanupExpiredRecords(now: number) {
  for (const [clientId, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(clientId);
    }
  }
}
