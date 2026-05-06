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

The current `generator.ts` is deterministic so the demo runs without an API key.

To connect an LLM later:

1. Send the prompt and registry rules to an API endpoint.
2. Ask the model to return JSON only.
3. Parse the JSON.
4. Validate the schema.
5. Render only if valid.
6. Fall back to a safe schema if invalid.

The renderer does not need to change.

