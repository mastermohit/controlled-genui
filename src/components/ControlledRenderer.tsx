import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Check,
  Gauge,
  SearchX,
  ShieldCheck,
  Sparkles,
  Star
} from "lucide-react";
import { productById } from "../data/products";
import type { ControlledComponent, GeneratedPage, Product } from "../types";

const currency = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0
});

function formatInr(amount: number) {
  return `INR ${currency.format(amount)}`;
}

type Props = {
  page: GeneratedPage;
  onSelectProduct: (product: Product) => void;
};

export function ControlledRenderer({ page, onSelectProduct }: Props) {
  return (
    <div className="generatedSurface">
      {page.components.map((component, index) => (
        <ComponentSwitch
          key={`${component.type}-${index}`}
          component={component}
          onSelectProduct={onSelectProduct}
        />
      ))}
    </div>
  );
}

function ComponentSwitch({
  component,
  onSelectProduct
}: {
  component: ControlledComponent;
  onSelectProduct: (product: Product) => void;
}) {
  switch (component.type) {
    case "intent_summary":
      return (
        <section className="summaryBand">
          <div>
            <p className="eyebrow">
              <Sparkles size={14} /> Controlled schema output
            </p>
            <h2>{component.props.title}</h2>
            <p>
              Budget {component.props.budgetLabel} for {component.props.primaryUse}.
            </p>
          </div>
          <div className="confidence">
            <Gauge size={18} />
            <strong>{component.props.confidence}%</strong>
            <span>match confidence</span>
          </div>
        </section>
      );
    case "filter_chips":
      return (
        <section className="chipRow" aria-label="Generated filters">
          {component.props.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </section>
      );
    case "recommendation_cards":
      return (
        <section className="recommendationGrid">
          {getProducts(component.props.productIds).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              rank={index + 1}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </section>
      );
    case "comparison_table":
      return (
        <section className="comparisonWrap">
          <div className="sectionTitle">
            <Boxes size={18} />
            <h3>Generated Comparison</h3>
          </div>
          <div className="tableScroll">
            <table>
              <thead>
                <tr>
                  {component.props.columns.map((column) => (
                    <th key={column}>{columnLabels[column]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getProducts(component.props.productIds).map((product) => (
                  <tr key={product.id}>
                    {component.props.columns.map((column) => (
                      <td key={column}>{formatColumn(product, column)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    case "insight_panel":
      return (
        <section className={`insight ${component.props.tone}`}>
          <ShieldCheck size={20} />
          <div>
            <h3>{component.props.heading}</h3>
            <p>{component.props.body}</p>
          </div>
        </section>
      );
    case "no_results":
      return (
        <section className="noResults">
          <SearchX size={28} />
          <div>
            <h3>{component.props.heading}</h3>
            <p>{component.props.body}</p>
            <div className="suggestionRow">
              {component.props.suggestions.map((suggestion) => (
                <span key={suggestion}>{suggestion}</span>
              ))}
            </div>
          </div>
        </section>
      );
    case "next_steps":
      return (
        <section className="nextSteps">
          {component.props.actions.map((action) => (
            <button key={action} type="button">
              {action}
              <ArrowRight size={16} />
            </button>
          ))}
        </section>
      );
  }
}

function ProductCard({
  product,
  rank,
  onSelectProduct
}: {
  product: Product;
  rank: number;
  onSelectProduct: (product: Product) => void;
}) {
  return (
    <article className="productCard">
      <div className="cardTop">
        <span className="rank">#{rank}</span>
        <span className="rating">
          <Star size={14} fill="currentColor" /> {product.rating}
        </span>
      </div>
      <h3>{product.name}</h3>
      <p className="brand">{product.brand}</p>
      <div className="price">{formatInr(product.price)}</div>
      <div className="specLine">
        <span>{product.processor}</span>
        <span>{product.ram}</span>
        <span>{product.gpu}</span>
      </div>
      <ul>
        {product.highlights.map((highlight) => (
          <li key={highlight}>
            <Check size={15} /> {highlight}
          </li>
        ))}
      </ul>
      <div className="bestFor">
        {product.bestFor.map((item) => (
          <span key={item}>
            <BadgeCheck size={13} /> {item}
          </span>
        ))}
      </div>
      <button className="detailButton" type="button" onClick={() => onSelectProduct(product)}>
        Why this matched
        <ArrowRight size={15} />
      </button>
    </article>
  );
}

function getProducts(ids: string[]) {
  return ids.map((id) => productById.get(id)).filter((product): product is Product => Boolean(product));
}

const columnLabels = {
  name: "Laptop",
  price: "Price",
  processor: "Processor",
  ram: "RAM",
  gpu: "GPU",
  battery: "Battery",
  weight: "Weight"
};

function formatColumn(product: Product, column: keyof typeof columnLabels) {
  if (column === "name") return product.name;
  if (column === "price") return formatInr(product.price);
  return product[column];
}
