# Testing

Phase 4 adds a verification layer for the Controlled GenUI contract.

The goal is not to test every pixel. The tests protect the safety boundaries that make this project controlled:

- prompts are converted into predictable schema
- low-budget prompts do not receive fake catalog matches
- LLM output is filtered against trusted product data
- unknown component types such as `raw_html` are rejected before render
- the main browser demo flow stays usable on desktop and mobile
- generated history, share links, and schema exports remain part of the demo surface
- the walkthrough surface can demonstrate approved, compared, and rejected schemas
- the Schema Inspector renders component-level registry, prop, and trusted-data checks

## Local Commands

Run the unit tests:

```powershell
npm test
```

Run the browser smoke tests:

```powershell
npm run test:e2e
```

Run the full local verification flow:

```powershell
npm run verify
```

`npm run verify` runs the Vitest suite, builds the production bundle, and then runs Playwright smoke tests against the built app.

## CI

GitHub Actions runs the same checks on every push and pull request to `master`:

1. Install dependencies with `npm ci`.
2. Install the Chromium browser used by Playwright.
3. Run `npm run verify`.

This makes the demo safer to change because schema, catalog, and renderer guardrails are checked before code is merged.

## Current Coverage

The current test files are:

- `src/generator.test.ts`
- `src/catalogGuardrails.test.ts`
- `src/schema.test.ts`
- `e2e/smoke.spec.ts`

## Next Test Targets

Good next additions:

- API route tests for rate limiting and prompt length rejection
- LLM fallback tests for failed API responses
- visual checks for mobile layout regressions
- clipboard and download assertions for share/export controls
