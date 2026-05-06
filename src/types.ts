export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  processor: string;
  ram: string;
  storage: string;
  gpu: string;
  battery: string;
  weight: string;
  bestFor: string[];
  highlights: string[];
  tradeoffs: string[];
};

export type ComponentType =
  | "intent_summary"
  | "filter_chips"
  | "recommendation_cards"
  | "comparison_table"
  | "insight_panel"
  | "next_steps";

export type ControlledComponent =
  | {
      type: "intent_summary";
      props: {
        title: string;
        budgetLabel: string;
        primaryUse: string;
        confidence: number;
      };
    }
  | {
      type: "filter_chips";
      props: {
        chips: string[];
      };
    }
  | {
      type: "recommendation_cards";
      props: {
        productIds: string[];
      };
    }
  | {
      type: "comparison_table";
      props: {
        productIds: string[];
        columns: Array<"name" | "price" | "processor" | "ram" | "gpu" | "battery" | "weight">;
      };
    }
  | {
      type: "insight_panel";
      props: {
        heading: string;
        body: string;
        tone: "good" | "warning" | "neutral";
      };
    }
  | {
      type: "next_steps";
      props: {
        actions: string[];
      };
    };

export type GeneratedPage = {
  pageType: "product_finder";
  schemaVersion: "1.0";
  generatedFrom: string;
  components: ControlledComponent[];
};

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  allowedComponents: ComponentType[];
  blockedComponents: string[];
};

export type HistoryItem = {
  id: string;
  prompt: string;
  page: GeneratedPage;
  validation: ValidationResult;
  createdAt: string;
};
