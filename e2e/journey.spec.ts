import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createDemo, sampleText } from "../src/lib/demo";
test("homepage, complete sample learning journey, Focus Mode and preferences", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "The internet gives you answers.",
  );
  await page.screenshot({
    path: `test-results/home-${testInfo.project.name}-light.png`,
    fullPage: true,
  });
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("body").evaluate((el) => el.clientWidth),
  );
  await page.getByRole("link", { name: /Explore demo/ }).click();
  await page.waitForURL(/\/analysis\//);
  await expect(page.getByText("You’re exploring a sample.")).toBeVisible();
  await page
    .getByRole("button", { name: /Claim Compass/, exact: false })
    .click();
  await expect(page.getByText("A compass, not a verdict.")).toBeVisible();
  await page.locator(".claim-card summary").first().click();
  await expect(
    page.getByRole("heading", { name: "What’s missing" }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Helpful", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /Reflection Loop/ }).click();
  await page
    .getByLabel("Your reflection answer")
    .fill("Feeling busy can hide a lack of meaningful progress on a task.");
  await page.getByRole("button", { name: "Enter Focus Mode" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-focus", "true");
  await expect(page.getByLabel("Your reflection answer")).toHaveValue(
    /Feeling busy/,
  );
  await page
    .getByRole("button", { name: "Reading settings", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Font size", exact: true })
    .selectOption("large");
  await page
    .getByRole("combobox", { name: "Font family", exact: true })
    .selectOption("serif");
  await page
    .getByRole("combobox", { name: "Reading width", exact: true })
    .selectOption("narrow");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: `test-results/focus-${testInfo.project.name}-dark.png`,
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).toHaveAttribute("data-focus", "false");
  await expect(page.getByLabel("Your reflection answer")).toHaveValue(
    /Feeling busy/,
  );
  await page.getByRole("button", { name: "Get feedback", exact: true }).click();
  await expect(
    page.getByText("SAMPLE FEEDBACK — NOT AN EVALUATION"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page
    .getByRole("button", { name: "Skip & finish", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A moment, well considered." }),
  ).toBeVisible();
  await page
    .getByLabel("Your own takeaway")
    .fill("Make focus small enough to practice.");
  await expect(page.locator(".receipt-data")).toContainText("1 / 3");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export Markdown", exact: true })
    .click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "insightlens-notes.md",
  );
  await page.reload();
  await page.getByRole("button", { name: /Attention Receipt/ }).click();
  await expect(page.getByLabel("Your own takeaway")).toHaveValue(
    "Make focus small enough to practice.",
  );
  await page
    .getByRole("button", { name: "One better next step", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "One good next step." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Sign in to save", exact: true })
    .click();
  await page.waitForURL(/\/login\?next=/);
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("live submit renders deterministic API result and honest server errors", async ({
  page,
}) => {
  const fixture = createDemo();
  fixture.demo = false;
  await page.route("**/api/analyze", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fixture),
    }),
  );
  await page.goto("/analyze");
  await page.getByLabel("Content to analyze", { exact: true }).fill(sampleText);
  await page.getByRole("button", { name: "Find the insight" }).click();
  await page.waitForURL(/\/analysis\//);
  await expect(
    page.getByText("AI-ASSISTED ANALYSIS", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("You’re exploring a sample.")).toHaveCount(0);
  await page.goto("/analyze");
  await page.route("**/api/analyze", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Live analysis isn't configured yet." }),
    }),
  );
  await page.getByLabel("Content to analyze", { exact: true }).fill(sampleText);
  await page.getByRole("button", { name: "Find the insight" }).click();
  await expect(page.locator(".form-error[role=alert]")).toContainText(
    "isn't configured",
  );
});
test("account library save, revisit, update and delete with deterministic service fixtures", async ({
  page,
}) => {
  const fixture = {
    analysis: createDemo(),
    progress: {
      answers: ["Saved reasoning", "", ""],
      feedback: [null, null, null],
      examined: [0],
      takeaway: "Saved idea",
      finished: true,
      claimFeedback: {},
    },
  };
  let saved = true;
  await page.route("**/api/auth", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: "test-user", email: "learner@example.test" },
      }),
    }),
  );
  await page.route("**/api/analyses", async (route) => {
    if (route.request().method() === "POST") {
      saved = true;
      await route.fulfill({ json: { saved: true } });
    } else await route.fulfill({ json: saved ? [fixture] : [] });
  });
  await page.route(`**/api/analyses/${fixture.analysis.id}`, async (route) => {
    if (route.request().method() === "DELETE") {
      saved = false;
      await route.fulfill({ json: { deleted: true } });
    } else await route.fulfill({ json: fixture });
  });
  await page.goto("/library");
  await page
    .getByRole("link", { name: fixture.analysis.result.title, exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    fixture.analysis.result.title,
  );
  await page.getByRole("button", { name: /Attention Receipt/ }).click();
  await expect(page.getByLabel("Your own takeaway")).toHaveValue("Saved idea");
  await page
    .getByRole("button", { name: /Next Step/, exact: false })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Save to your library", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Saved to your private knowledge library",
  );
  await page.goto("/library");
  await page
    .getByRole("button", {
      name: `Delete: ${fixture.analysis.result.title}`,
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Delete analysis", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Room for your first discovery." }),
  ).toBeVisible();
});
test("all pages, both themes, keyboard access and responsive overflow", async ({
  page,
}, testInfo) => {
  for (const path of [
    "/",
    "/analyze",
    "/dashboard",
    "/library",
    "/settings",
    "/about",
    "/privacy",
    "/terms",
    "/login",
    "/signup",
    "/missing-page",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Dark theme", exact: true })
    .last()
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: `test-results/settings-${testInfo.project.name}-dark.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Light theme", exact: true })
    .last()
    .click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content", exact: true }),
  ).toBeFocused();
  for (const theme of ["light", "dark"] as const) {
    await page.evaluate((value) => {
      localStorage.setItem("theme", value);
    }, theme);
    for (const path of ["/", "/analyze", "/settings"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations, `${theme} ${path}`).toEqual([]);
    }
  }
});

test("reading surfaces and intermediate viewport sizes remain usable", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Viewport sweep runs once.");
  for (const width of [375, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/analyze", "/settings"]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${path} at ${width}px`,
      ).toBe(true);
    }
  }
  await page.goto("/analyze?demo=1");
  await page.waitForURL(/\/analysis\//);
  await page.getByRole("button", { name: /Claim Compass/ }).click();
  await page.locator(".claim-card summary").first().click();
  await page.screenshot({
    path: "test-results/claims-desktop-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Enter Focus Mode" }).click();
  await page
    .getByRole("button", { name: "Reading settings", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Reading surface", exact: true })
    .selectOption("low-glare");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator(".reader-page")).toHaveClass(/surface-low-glare/);
  await page.getByRole("button", { name: "Toggle content outline" }).click();
  await page
    .getByRole("navigation", { name: "Content outline" })
    .getByRole("button", { name: "Overview" })
    .click();
  await expect(
    page.getByRole("heading", { name: "The bigger picture" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: "test-results/focus-overview-desktop-dark.png",
    fullPage: true,
  });
});
