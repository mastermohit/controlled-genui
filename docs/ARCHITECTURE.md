# Architecture

## Core Flow

```txt
User prompt
  -> generator.ts
  -> GeneratedPage JSON
  -> schema.ts validation
  -> ControlledRenderer.tsx
  -> approved React components
```

## Why This Is Controlled

The generator is allowed to choose component order and props, but it cannot decide how rendering works.

Rendering is owned by the application:

- component types are finite
- prop shapes are typed
- product ids resolve against trusted local data
- unknown component types fail validation
- no `dangerouslySetInnerHTML` path exists

## Phase 2 Studio Views

### Generated UI

Shows the final adaptive UI rendered from the approved schema.

### Schema

Shows the JSON contract and includes a rejected-schema simulation.

### Registry

Shows every component the generator is allowed to use.

### Guardrails

Explains what the system allows and blocks.

### History

Stores generated prompts during the session so the demo can replay prior runs.

## Real LLM Integration Plan

Phase 3 adds a real LLM path while keeping `generator.ts` as a deterministic fallback.

The app now supports:

1. Send the prompt and registry rules to `/api/generate-schema`.
2. Ask OpenAI to return a Structured Output matching the controlled JSON Schema.
3. Parse the model output.
4. Validate the schema with Zod.
5. Render only if valid.
6. Fall back to a deterministic safe schema if invalid or if `OPENAI_API_KEY` is missing.

The renderer does not need to change.

## Environment Variables

```txt
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Local Development Modes

There are two local modes:

### Vite only

```powershell
npm run dev
```

This runs the React app only. The serverless API route at `/api/generate-schema` is not available, so LLM mode falls back to the mock generator.

### Vercel runtime

```powershell
vercel dev
```

This runs the React app and the serverless API route together. Use this mode when testing `.env.local` and real LLM generation.

The API key must stay server-side. The browser calls `/api/generate-schema`; the serverless function calls OpenAI.
