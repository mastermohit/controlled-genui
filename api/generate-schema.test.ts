import { beforeEach, describe, expect, it, vi } from "vitest";

type MockResponse = {
  headers: Record<string, string>;
  statusCode?: number;
  payload?: unknown;
  setHeader: (name: string, value: string) => MockResponse;
  status: (code: number) => MockResponse;
  json: (payload: unknown) => MockResponse;
};

function createResponse(): MockResponse {
  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

function createRequest({
  method = "POST",
  body = { prompt: "Find a laptop for coding under INR 80,000" },
  ip = "203.0.113.10"
}: {
  method?: string;
  body?: unknown;
  ip?: string;
} = {}) {
  return {
    method,
    body,
    headers: {
      "x-forwarded-for": ip
    },
    socket: {
      remoteAddress: ip
    }
  };
}

async function loadHandler() {
  vi.resetModules();
  delete (globalThis as typeof globalThis & { controlledGenuiRateLimit?: unknown }).controlledGenuiRateLimit;
  const module = await import("./generate-schema");
  return module.default;
}

describe("/api/generate-schema", () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
    process.env.RATE_LIMIT_WINDOW_MS = "60000";
    process.env.RATE_LIMIT_MAX_REQUESTS = "5";
    process.env.MAX_PROMPT_LENGTH = "20";
  });

  it("rejects non-POST requests", async () => {
    const handler = await loadHandler();
    const response = createResponse();

    await handler(createRequest({ method: "GET" }), response);

    expect(response.statusCode).toBe(405);
    expect(response.payload).toEqual({ error: "Method not allowed" });
  });

  it("validates a missing prompt before checking LLM configuration", async () => {
    const handler = await loadHandler();
    const response = createResponse();

    await handler(createRequest({ body: {} }), response);

    expect(response.statusCode).toBe(400);
    expect(response.payload).toEqual({ error: "Prompt is required" });
  });

  it("rejects overlong prompts before checking LLM configuration", async () => {
    const handler = await loadHandler();
    const response = createResponse();

    await handler(createRequest({ body: { prompt: "x".repeat(21) } }), response);

    expect(response.statusCode).toBe(400);
    expect(response.payload).toEqual({
      source: "fallback",
      error: "Prompt is too long. Maximum length is 20 characters."
    });
  });

  it("falls back safely when the API key is missing", async () => {
    const handler = await loadHandler();
    const response = createResponse();

    await handler(createRequest({ body: { prompt: "coding laptop" } }), response);

    expect(response.statusCode).toBe(200);
    expect(response.headers["X-RateLimit-Limit"]).toBe("5");
    expect(response.payload).toEqual({
      source: "fallback",
      error: "OPENAI_API_KEY is not configured"
    });
  });

  it("rate limits repeated requests from the same client", async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = "2";
    const handler = await loadHandler();

    const first = createResponse();
    const second = createResponse();
    const third = createResponse();

    await handler(createRequest({ body: { prompt: "coding laptop" }, ip: "198.51.100.22" }), first);
    await handler(createRequest({ body: { prompt: "coding laptop" }, ip: "198.51.100.22" }), second);
    await handler(createRequest({ body: { prompt: "coding laptop" }, ip: "198.51.100.22" }), third);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(third.statusCode).toBe(429);
    expect(third.headers["X-RateLimit-Remaining"]).toBe("0");
    expect(third.headers["Retry-After"]).toBeDefined();
    expect(third.payload).toMatchObject({
      source: "fallback"
    });
  });
});
