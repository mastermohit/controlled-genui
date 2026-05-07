import { products } from "./data/products";
import { getBudget } from "./generator";
import type { ControlledComponent, GeneratedPage } from "./types";

const productPriceById = new Map(products.map((product) => [product.id, product.price]));

export function enforceCatalogConstraints(page: GeneratedPage): GeneratedPage {
  const budget = getBudget(page.generatedFrom);
  const allowedProductIds = new Set(
    products.filter((product) => product.price <= budget + 5000).map((product) => product.id)
  );

  const filteredComponents = page.components.flatMap((component): ControlledComponent[] => {
    if (component.type !== "recommendation_cards" && component.type !== "comparison_table") {
      return [component];
    }

    const productIds = component.props.productIds.filter(
      (id) => allowedProductIds.has(id) && productPriceById.has(id)
    );

    if (!productIds.length) return [];

    return [
      {
        ...component,
        props: {
          ...component.props,
          productIds
        }
      } as ControlledComponent
    ];
  });

  const hasProductComponent = filteredComponents.some(
    (component) => component.type === "recommendation_cards" || component.type === "comparison_table"
  );
  const hasNoResults = filteredComponents.some((component) => component.type === "no_results");

  if (!hasProductComponent && !hasNoResults) {
    const nextStepsIndex = filteredComponents.findIndex((component) => component.type === "next_steps");
    const noResultsComponent: ControlledComponent = {
      type: "no_results",
      props: {
        heading: "No trusted catalog match",
        body: `The current trusted catalog does not include a laptop at or below INR ${new Intl.NumberFormat("en-IN").format(budget)}.`,
        suggestions: ["Increase the budget", "Relax gaming requirements", "Add refurbished products", "Expand the catalog"]
      }
    };

    if (nextStepsIndex === -1) {
      filteredComponents.push(noResultsComponent);
    } else {
      filteredComponents.splice(nextStepsIndex, 0, noResultsComponent);
    }
  }

  return {
    ...page,
    components: filteredComponents
  };
}
