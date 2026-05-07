import { describe, expect, it } from "vitest";
import { validateUnknownPage } from "./schema";

describe("validateUnknownPage", () => {
  it("rejects unregistered component types", () => {
    const validation = validateUnknownPage({
      pageType: "product_finder",
      schemaVersion: "1.0",
      generatedFrom: "unsafe",
      components: [
        {
          type: "raw_html",
          props: {
            html: "<script>alert('bad')</script>"
          }
        }
      ]
    });

    expect(validation.ok).toBe(false);
    expect(validation.blockedComponents).toContain("raw_html");
  });
});
