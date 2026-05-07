import { expect, test } from "@playwright/test";

test("runs the controlled generation demo flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "AI Product Finder Studio" })).toBeVisible();

  await page.getByLabel("Product finder prompt").fill("Find a laptop for coding and gaming under INR 80,000");
  await page.getByRole("button", { name: "Generate", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Conversational Product Match" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Lenovo LOQ/ })).toBeVisible();
  await expect(page.getByText("Generated Comparison")).toBeVisible();

  await page.getByRole("button", { name: /why this matched/i }).first().click();
  await expect(page.getByRole("complementary", { name: "Product details" })).toBeVisible();
  await expect(page.getByText("Controlled detail drawer")).toBeVisible();
  await page.getByRole("button", { name: "Close product details" }).click();

  await page.getByRole("button", { name: "Schema", exact: true }).click();
  await expect(page.getByText('"pageType": "product_finder"')).toBeVisible();
  await page.getByRole("button", { name: "Simulate rejected schema" }).click();
  await expect(page.getByText("Blocked: raw_html")).toBeVisible();

  await page.getByRole("button", { name: "Registry" }).click();
  await expect(page.getByRole("heading", { name: "intent_summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "recommendation_cards" })).toBeVisible();

  await page.getByRole("button", { name: "Inspector" }).click();
  await expect(page.getByText('ControlledRenderer -> switch("recommendation_cards")')).toBeVisible();
  await expect(page.getByText("Props match the Zod shape for recommendation_cards")).toBeVisible();
  await expect(page.getByText("Trusted catalog ids: Lenovo LOQ 15, HP Victus 16, ASUS Vivobook Pro 15").first()).toBeVisible();

  await page.getByRole("button", { name: "Guardrails" }).click();
  await expect(page.getByText("Raw HTML, script tags, iframe embeds, and remote component URLs have no render path.")).toBeVisible();

  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByRole("heading", { name: /Find a laptop for coding and gaming/ })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByRole("heading", { name: /Find a laptop for coding and gaming/ })).toBeVisible();
});

test("shows a controlled no-results state for impossible catalog requests", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Product finder prompt").fill("Find a laptop for coding under INR 20,000");
  await page.getByRole("button", { name: "Generate", exact: true }).click();

  await expect(page.getByRole("heading", { name: "No trusted catalog match" })).toBeVisible();
  await expect(page.getByText("Controlled GenUI does not invent unavailable products.")).toBeVisible();
  await expect(page.getByText("Lenovo LOQ 15")).toHaveCount(0);
});

test("keeps the studio usable on a mobile viewport", async ({ page }) => {
  await page.goto("/?focus=studio");

  await expect(page.getByRole("heading", { name: "Controlled GenUI Studio" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Generated UI" })).toBeVisible();
  await expect(page.getByText("Conversational Product Match")).toBeVisible();

  await page.getByRole("button", { name: "Schema", exact: true }).click();
  await expect(page.getByRole("button", { name: "Simulate rejected schema" })).toBeVisible();

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(2);
});

test("hydrates a shareable prompt URL", async ({ page }) => {
  await page.goto("/?prompt=Find+a+laptop+for+coding+under+20000&mode=mock&focus=studio");

  await expect(page.getByRole("heading", { name: "Controlled GenUI Studio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No trusted catalog match" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy Demo Link" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Schema" })).toBeVisible();
});

test("opens the guided demo script and rejected examples", async ({ page }) => {
  await page.goto("/?focus=studio");

  await page.getByRole("button", { name: "Demo Script" }).click();
  await expect(page.getByRole("heading", { name: "Schema comparison" })).toBeVisible();

  await page.getByRole("button", { name: "Show rejected examples" }).click();
  await expect(page.getByRole("button", { name: "Raw HTML" })).toBeVisible();
  await page.getByRole("button", { name: "Remote component" }).click();
  await expect(page.getByText("Blocked: remote_component")).toBeVisible();
});
