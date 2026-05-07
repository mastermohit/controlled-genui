import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

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
  await page.getByRole("button", { name: "Rejected" }).click();
  await expect(page.getByText("No renderer path exists for this component type")).toBeVisible();
  await expect(page.getByText('type: "raw_html" is not registered')).toBeVisible();

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

test("copies demo links and exports generated schema", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?prompt=Find+a+laptop+for+coding+under+80000&mode=mock&focus=studio");

  await page.getByRole("button", { name: "Copy Demo Link" }).click();
  await expect(page.getByText("Demo link copied")).toBeVisible();
  const copiedLink = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedLink).toContain("prompt=Find+a+laptop+for+coding+under+80000");
  expect(copiedLink).toContain("mode=mock");
  expect(copiedLink).toContain("focus=studio");

  await page.getByRole("button", { name: "Copy Schema" }).click();
  await expect(page.getByText("Schema copied")).toBeVisible();
  const copiedSchema = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
  expect(copiedSchema).toMatchObject({
    pageType: "product_finder",
    schemaVersion: "1.0",
    generatedFrom: "Find a laptop for coding under 80000"
  });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Schema" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("controlled-genui-schema.json");
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const exportedSchema = JSON.parse(await readFile(downloadPath!, "utf8"));
  expect(exportedSchema).toMatchObject({
    pageType: "product_finder",
    schemaVersion: "1.0",
    generatedFrom: "Find a laptop for coding under 80000"
  });

  const imageDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export UI Image" }).click();
  await expect(page.getByText("UI image exported")).toBeVisible();
  const imageDownload = await imageDownloadPromise;
  expect(imageDownload.suggestedFilename()).toBe("controlled-genui-surface.png");
  const imagePath = await imageDownload.path();
  expect(imagePath).toBeTruthy();
  const imageBuffer = await readFile(imagePath!);
  expect(imageBuffer.byteLength).toBeGreaterThan(1000);
});
