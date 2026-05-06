import { products } from "./data/products";
import type { GeneratedPage } from "./types";

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0
});

function formatInr(amount: number) {
  return `INR ${numberFormatter.format(amount)}`;
}

function getBudget(prompt: string) {
  const directMatch = prompt.match(/(?:under|below|less than|budget|inr|rs\.?)\s*([0-9,.]+)\s*(lakh|k)?/i);
  if (!directMatch) return 80000;

  const amount = Number(directMatch[1].replace(/,/g, ""));
  const unit = directMatch[2]?.toLowerCase();
  if (unit === "lakh") return amount * 100000;
  if (unit === "k") return amount * 1000;
  return amount;
}

function hasAny(prompt: string, words: string[]) {
  const normalized = prompt.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

export function generateControlledPage(prompt: string): GeneratedPage {
  const budget = getBudget(prompt);
  const wantsGaming = hasAny(prompt, ["gaming", "game", "gpu", "rtx"]);
  const wantsCoding = hasAny(prompt, ["coding", "code", "programming", "developer", "dev"]);
  const wantsCollege = hasAny(prompt, ["college", "student", "classes", "study"]);
  const wantsPortable = hasAny(prompt, ["portable", "travel", "light", "battery"]);

  const ranked = products
    .filter((product) => product.price <= budget + 5000)
    .map((product) => {
      let score = product.rating * 10;
      if (wantsGaming && product.bestFor.includes("Gaming")) score += 12;
      if (wantsCoding && product.bestFor.includes("Coding")) score += 10;
      if (wantsCollege && product.bestFor.includes("College")) score += 8;
      if (wantsPortable && Number(product.weight.replace(" kg", "")) <= 1.8) score += 10;
      score += Math.max(0, (budget - product.price) / 10000);
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ product }) => product.id);

  const chips = [
    wantsCoding ? "Coding" : "Everyday performance",
    wantsGaming ? "Gaming-ready" : "Casual use",
    wantsCollege ? "College-friendly" : "Work setup",
    wantsPortable ? "Portable" : "Performance first",
    `Budget ${formatInr(budget)}`
  ];

  const primaryUse = [
    wantsCoding && "coding",
    wantsGaming && "gaming",
    wantsCollege && "college",
    wantsPortable && "portable use"
  ]
    .filter(Boolean)
    .join(", ");

  return {
    pageType: "product_finder",
    schemaVersion: "1.0",
    generatedFrom: prompt,
    components: [
      {
        type: "intent_summary",
        props: {
          title: "Conversational Product Match",
          budgetLabel: formatInr(budget),
          primaryUse: primaryUse || "balanced daily use",
          confidence: ranked.length ? 86 : 52
        }
      },
      {
        type: "filter_chips",
        props: { chips }
      },
      {
        type: "recommendation_cards",
        props: { productIds: ranked }
      },
      {
        type: "comparison_table",
        props: {
          productIds: ranked,
          columns: ["name", "price", "processor", "ram", "gpu", "battery", "weight"]
        }
      },
      {
        type: "insight_panel",
        props: {
          heading: wantsGaming ? "GPU is the deciding factor" : "Balance matters more than raw specs",
          body: wantsGaming
            ? "For gaming plus coding, the controlled generator prioritizes RTX-class graphics, 16 GB RAM, and acceptable thermals before display extras."
            : "For coding and college use, the controlled generator favors CPU, RAM, battery life, weight, and support over gaming hardware.",
          tone: wantsGaming ? "warning" : "good"
        }
      },
      {
        type: "next_steps",
        props: {
          actions: ["Compare warranty", "Check current price", "Shortlist top two", "Ask a follow-up"]
        }
      }
    ]
  };
}
