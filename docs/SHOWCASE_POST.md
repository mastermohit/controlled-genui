# Showcase Post Draft

I built a small demo to explore the first pillar of Generative UI: **Controlled GenUI**.

![Controlled GenUI demo](../public/demo/controlled-genui-demo.gif)

GitHub repo: https://github.com/mastermohit/controlled-genui  
Live demo: https://controlled-genui.vercel.app

The idea is simple:

The AI does not generate arbitrary HTML.  
It generates a strict JSON schema.  
The frontend validates that schema.  
Then React renders only approved components from a fixed registry.

For the demo, I built an AI Product Finder.

A user can ask:

```txt
Find me a laptop for coding, gaming, and college under INR 80,000
```

The app generates:

- intent summary
- filter chips
- recommendation cards
- comparison table
- insight panel
- next actions

But everything is controlled.

The model cannot create random UI.  
It cannot inject raw HTML.  
It cannot invent product data.  
It can only compose with approved building blocks.

The demo also includes:

- schema viewer
- component registry explorer
- guardrails panel
- rejected schema simulation
- prompt history
- product detail drawer

This pattern feels like a practical middle ground between static UI and fully open-ended AI interfaces.

Controlled GenUI gives us the magic of adaptive interfaces while keeping the system predictable, safe, and shippable.

Update: Phase 3 connects the same schema contract to a real LLM using Structured Outputs, while keeping the controlled renderer and fallback path intact.

#GenerativeUI #AI #React #TypeScript #Frontend #OpenAI #WebDevelopment
