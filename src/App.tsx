import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Code2,
  Cpu,
  History,
  LayoutDashboard,
  Library,
  LockKeyhole,
  Play,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  WandSparkles,
  X
} from "lucide-react";
import { ControlledRenderer } from "./components/ControlledRenderer";
import { generateControlledPage } from "./generator";
import { componentRegistry, validateGeneratedPage, validateUnknownPage } from "./schema";
import type { HistoryItem, Product, ValidationResult } from "./types";

type StudioTab = "ui" | "schema" | "registry" | "guardrails" | "history";

const examples = [
  "Find me a laptop for coding, gaming, and college under INR 80,000",
  "I need a light laptop for coding and travel below INR 75,000",
  "Suggest a laptop for college, classes, and casual coding under 65k"
];

const unsafeSchema = {
  pageType: "product_finder",
  schemaVersion: "1.0",
  generatedFrom: "Try to inject arbitrary HTML",
  components: [
    {
      type: "raw_html",
      props: {
        html: "<script>alert('not allowed')</script>"
      }
    }
  ]
};

export function App() {
  const [prompt, setPrompt] = useState(examples[0]);
  const [submittedPrompt, setSubmittedPrompt] = useState(examples[0]);
  const [activeTab, setActiveTab] = useState<StudioTab>("ui");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRejectedSchema, setShowRejectedSchema] = useState(false);

  const page = useMemo(() => generateControlledPage(submittedPrompt), [submittedPrompt]);
  const validation = useMemo(() => validateGeneratedPage(page), [page]);
  const rejectedValidation = useMemo(() => validateUnknownPage(unsafeSchema), []);
  const schemaForPanel = showRejectedSchema ? unsafeSchema : page;
  const validationForPanel = showRejectedSchema ? rejectedValidation : validation;

  function generate() {
    const nextPage = generateControlledPage(prompt);
    const nextValidation = validateGeneratedPage(nextPage);
    setSubmittedPrompt(prompt);
    setActiveTab("ui");
    setHistory((items) => [
      {
        id: `${Date.now()}`,
        prompt,
        page: nextPage,
        validation: nextValidation,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      },
      ...items
    ]);
  }

  function restoreHistory(item: HistoryItem) {
    setPrompt(item.prompt);
    setSubmittedPrompt(item.prompt);
    setActiveTab("ui");
  }

  return (
    <main>
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">
            <LockKeyhole size={14} /> Controlled Generative UI
          </p>
          <h1>AI Product Finder Studio</h1>
          <p>
            Phase 2 turns the product finder into a demo studio: generated UI, schema,
            registry, guardrails, history, and controlled product details.
          </p>
        </div>
        <div className="controlPanel">
          <div className="panelHeader">
            <WandSparkles size={18} />
            <span>Prompt to controlled UI</span>
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            aria-label="Product finder prompt"
          />
          <div className="promptActions">
            <button type="button" className="primaryButton" onClick={generate}>
              <Play size={16} />
              Generate
            </button>
            <button type="button" className="iconButton" aria-label="Reset prompt" onClick={() => setPrompt(examples[0])}>
              <RotateCcw size={17} />
            </button>
          </div>
          <div className="examples">
            {examples.map((example) => (
              <button key={example} type="button" onClick={() => setPrompt(example)}>
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="explainBand">
        <div>
          <LayoutDashboard size={18} />
          <strong>Renderer</strong>
          <span>Only registered blocks can appear.</span>
        </div>
        <div>
          <Code2 size={18} />
          <strong>Schema</strong>
          <span>Generation returns JSON, not HTML.</span>
        </div>
        <div>
          <Cpu size={18} />
          <strong>Logic</strong>
          <span>Ranking and pricing stay deterministic.</span>
        </div>
      </section>

      <section className="studioShell">
        <div className="studioHeader">
          <div>
            <p className="eyebrow">Phase 2 demo surface</p>
            <h2>Controlled GenUI Studio</h2>
          </div>
          <StatusPill validation={validation} />
        </div>

        <nav className="tabs" aria-label="Studio views">
          <TabButton tab="ui" activeTab={activeTab} setActiveTab={setActiveTab} icon={<LayoutDashboard size={16} />} label="Generated UI" />
          <TabButton tab="schema" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Code2 size={16} />} label="Schema" />
          <TabButton tab="registry" activeTab={activeTab} setActiveTab={setActiveTab} icon={<Library size={16} />} label="Registry" />
          <TabButton tab="guardrails" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ShieldCheck size={16} />} label="Guardrails" />
          <TabButton tab="history" activeTab={activeTab} setActiveTab={setActiveTab} icon={<History size={16} />} label="History" />
        </nav>

        {activeTab === "ui" && (
          <section className="workspace">
            <aside className="sidePanel">
              <PanelTitle icon={<SlidersHorizontal size={18} />} title="Control Contract" />
              <ul className="contractList">
                <li><CheckCircle2 size={16} /> Fixed component registry</li>
                <li><CheckCircle2 size={16} /> Trusted product data only</li>
                <li><CheckCircle2 size={16} /> Deterministic price and ranking logic</li>
                <li><CheckCircle2 size={16} /> No raw HTML rendering path</li>
              </ul>
            </aside>
            <ControlledRenderer page={page} onSelectProduct={setSelectedProduct} />
          </section>
        )}

        {activeTab === "schema" && (
          <section className="schemaGrid">
            <aside className="sidePanel">
              <PanelTitle icon={<Code2 size={18} />} title="Generated Schema" />
              <StatusPill validation={validationForPanel} />
              <button
                type="button"
                className={showRejectedSchema ? "secondaryButton active" : "secondaryButton"}
                onClick={() => setShowRejectedSchema((value) => !value)}
              >
                {showRejectedSchema ? "Show approved schema" : "Simulate rejected schema"}
              </button>
              {validationForPanel.blockedComponents.length > 0 && (
                <div className="warningBox">
                  <AlertTriangle size={18} />
                  Blocked: {validationForPanel.blockedComponents.join(", ")}
                </div>
              )}
            </aside>
            <pre>{JSON.stringify(schemaForPanel, null, 2)}</pre>
          </section>
        )}

        {activeTab === "registry" && <RegistryView />}
        {activeTab === "guardrails" && <GuardrailsView />}
        {activeTab === "history" && <HistoryView history={history} restoreHistory={restoreHistory} />}
      </section>

      {selectedProduct && <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </main>
  );
}

function TabButton({
  tab,
  activeTab,
  setActiveTab,
  icon,
  label
}: {
  tab: StudioTab;
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
      {icon}
      {label}
    </button>
  );
}

function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="sectionTitle">
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

function StatusPill({ validation }: { validation: ValidationResult }) {
  return (
    <div className={validation.ok ? "status ok" : "status error"}>
      {validation.ok ? "Schema approved" : validation.errors.join(", ")}
    </div>
  );
}

function RegistryView() {
  return (
    <section className="registryGrid">
      {componentRegistry.map((component) => (
        <article className="registryCard" key={component.type}>
          <div className="registryIcon">
            <Library size={18} />
          </div>
          <h3>{component.type}</h3>
          <p>{component.purpose}</p>
          <div className="propList">
            {component.allowedProps.map((prop) => (
              <span key={prop}>{prop}</span>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function GuardrailsView() {
  const rules = [
    "The generator may return JSON only.",
    "The renderer switches on known component types.",
    "Product cards receive productIds, not arbitrary product objects.",
    "Prices and ranking are computed locally.",
    "Unknown component types are rejected before render.",
    "Raw HTML, script tags, iframe embeds, and remote component URLs have no render path."
  ];

  return (
    <section className="guardrailGrid">
      <div className="guardrailPanel">
        <PanelTitle icon={<ShieldCheck size={18} />} title="Allowed" />
        <ul className="contractList">
          {rules.slice(0, 5).map((rule) => (
            <li key={rule}>
              <CheckCircle2 size={16} /> {rule}
            </li>
          ))}
        </ul>
      </div>
      <div className="guardrailPanel danger">
        <PanelTitle icon={<AlertTriangle size={18} />} title="Blocked" />
        <ul className="contractList">
          {rules.slice(5).map((rule) => (
            <li key={rule}>
              <AlertTriangle size={16} /> {rule}
            </li>
          ))}
          <li><AlertTriangle size={16} /> Unregistered component: raw_html</li>
          <li><AlertTriangle size={16} /> Untrusted props that bypass product data</li>
        </ul>
      </div>
    </section>
  );
}

function HistoryView({
  history,
  restoreHistory
}: {
  history: HistoryItem[];
  restoreHistory: (item: HistoryItem) => void;
}) {
  if (history.length === 0) {
    return (
      <section className="emptyState">
        <ClipboardList size={28} />
        <h3>No generated runs yet</h3>
        <p>Generate a few prompts to build a replayable demo history.</p>
      </section>
    );
  }

  return (
    <section className="historyList">
      {history.map((item) => (
        <article className="historyItem" key={item.id}>
          <div>
            <span>{item.createdAt}</span>
            <h3>{item.prompt}</h3>
            <p>{item.page.components.length} controlled components generated</p>
          </div>
          <button type="button" onClick={() => restoreHistory(item)}>
            Replay
          </button>
        </article>
      ))}
    </section>
  );
}

function ProductDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="drawerBackdrop" role="presentation" onClick={onClose}>
      <aside className="productDrawer" aria-label="Product details" onClick={(event) => event.stopPropagation()}>
        <button className="closeButton" type="button" aria-label="Close product details" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="eyebrow">Controlled detail drawer</p>
        <h2>{product.name}</h2>
        <p className="brand">{product.brand}</p>
        <div className="drawerSpecs">
          <span>{product.processor}</span>
          <span>{product.ram}</span>
          <span>{product.storage}</span>
          <span>{product.gpu}</span>
          <span>{product.battery}</span>
          <span>{product.weight}</span>
        </div>
        <h3>Why it matched</h3>
        <ul>
          {product.highlights.map((highlight) => (
            <li key={highlight}><CheckCircle2 size={16} /> {highlight}</li>
          ))}
        </ul>
        <h3>Tradeoffs</h3>
        <ul>
          {product.tradeoffs.map((tradeoff) => (
            <li key={tradeoff}><AlertTriangle size={16} /> {tradeoff}</li>
          ))}
        </ul>
        <h3>Trusted catalog</h3>
        <p>
          This drawer is opened from a product id emitted by the schema. The generator cannot
          invent this layout or inject custom detail markup.
        </p>
      </aside>
    </div>
  );
}
