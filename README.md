# Controlled GenUI Product Finder

A demo project that showcases the **Controlled** pillar of Generative UI.

Instead of allowing an AI model to generate arbitrary HTML, this app treats the model as a planner. The generated output is a strict JSON schema, and the frontend can only render components from a fixed registry.

![Controlled GenUI demo](public/demo/controlled-genui-demo.gif)

Live demo: [controlled-genui.vercel.app](https://controlled-genui.vercel.app)

## Demo Story

The user asks for a laptop recommendation in natural language:

```txt
Find me a laptop for coding, gaming, and college under INR 80,000
```

The system turns that prompt into a controlled schema:

```txt
Prompt
-> generator
-> JSON schema
-> validator
-> approved component registry
-> React renderer
```

The UI feels generated, but the system remains predictable, testable, and safe.

## Phase 2 Features

- Controlled product recommendation UI
- Strict component registry
- Schema validation panel
- Guardrails view with allowed and blocked behavior
- Registry explorer for approved UI blocks
- Rejected schema simulation for `raw_html`
- Prompt history and replay
- Product detail drawer driven by trusted product ids
- GitHub and LinkedIn-ready documentation

## Controlled GenUI Principles

This project follows four rules:

1. The generator returns JSON, not HTML.
2. The renderer only supports approved component types.
3. Business logic such as ranking and pricing stays deterministic.
4. Unknown or unsafe component types are rejected before render.

## Component Registry

Approved components:

- `intent_summary`
- `filter_chips`
- `recommendation_cards`
- `comparison_table`
- `insight_panel`
- `next_steps`

If a schema tries to use something like `raw_html`, the validator rejects it and the renderer has no path for it.

## Tech Stack

- React
- TypeScript
- Vite
- Lucide React icons

## Run Locally

```powershell
npm install
npm run dev -- --port 5173
```

Open:

```txt
http://127.0.0.1:5173
```

## Build

```powershell
npm run build
```

## Project Structure

```txt
src/
  App.tsx                         Studio shell and demo flows
  generator.ts                    Prompt-to-schema mock generator
  schema.ts                       Registry and validation logic
  types.ts                        Controlled schema types
  components/
    ControlledRenderer.tsx        Approved component renderer
  data/
    products.ts                   Trusted product catalog
```

## Demo Script

1. Start on the Generated UI tab.
2. Enter a product prompt and click Generate.
3. Show that the generated product cards, comparison table, and insight panel change.
4. Open the Schema tab and explain that the UI came from JSON.
5. Toggle "Simulate rejected schema" and show `raw_html` being blocked.
6. Open the Registry tab and show the approved component list.
7. Open Guardrails and explain what the generator can and cannot do.
8. Open a product detail drawer and explain that details come from trusted product ids.

## Future Phase Ideas

- Replace the mock generator with a real LLM call.
- Add a Zod schema for runtime prop validation.
- Save history to local storage.
- Add follow-up question blocks for vague prompts.
- Add unit tests for schema validation and ranking.
