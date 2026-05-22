import { expect, test } from "@playwright/test";

test("demo mode shows all configured case tiles", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Choose a case/i })).toBeVisible();
  await expect(page.getByText(/3 cases available/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Muscle Aches and Nausea in the ED/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chest Pain After the Train/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Fatigue and Missed Classes/i })).toBeVisible();
});

test("demo mode keeps chest pain artifact workflow available", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /Chest Pain After the Train/i }).click();
  await expect(page.getByRole("heading", { name: /Chest Pain After the Train/i })).toBeVisible();

  await page.getByRole("button", { name: /Start encounter/i }).click();
  await page.getByLabel("Ask the patient a question").fill("What does the chest x-ray say?");
  await page.getByRole("button", { name: /Send/i }).click();

  await expect(page.getByTestId("results-panel").getByRole("heading", { name: "Diagnostics" })).toBeVisible();
  await expect(page.getByTestId("results-panel").getByText("XR CHEST 2 VIEWS")).toBeVisible();
  await expect(page.getByTestId("chat-thread")).not.toContainText("No acute cardiopulmonary abnormality");
});

test("demo mode keeps fatigue mood sensitive-history workflow available", async ({ page }) => {
  await page.goto("/case/fatigue-mood");

  await expect(page.getByRole("heading", { name: /Fatigue and Missed Classes/i })).toBeVisible();
  await page.getByRole("button", { name: /Start encounter/i }).click();
  await page.getByLabel("Ask the patient a question").fill("Have you had thoughts of hurting yourself?");
  await page.getByRole("button", { name: /Send/i }).click();

  await expect(page.getByTestId("chat-thread")).toContainText(/thoughts|better off/i);
  await expect(page.getByTestId("chat-thread")).toContainText(
    /no plan|don't have a plan|don't have any plan|do not have (a )?plan|do not have a plan or intent|haven't made a plan|have not made a plan|denies a plan/i
  );
});
