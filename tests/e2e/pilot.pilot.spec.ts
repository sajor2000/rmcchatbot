import { expect, test } from "@playwright/test";

test("pilot homepage shows Jane Kim only", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Practice clinical interviews with AI patients/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /How to use this simulator/i })).toBeVisible();
  await expect(page.getByText(/Start the encounter/i)).toBeVisible();
  await expect(page.getByText(/Click End case/i)).toBeVisible();
  await expect(page.getByText(/Review feedback/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Assigned pilot case/i })).toBeVisible();
  await expect(page.getByText(/1 case available/i)).toBeVisible();
  const janeTile = page.getByRole("link", { name: /Muscle Aches and Nausea in the ED/i });
  await expect(janeTile).toBeVisible();
  await expect(janeTile.getByText("Jane Kim", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chest Pain After the Train/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Fatigue and Missed Classes/i })).toHaveCount(0);
});

test("pilot homepage Jane Kim tile opens the Jane Kim simulator", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /Muscle Aches and Nausea in the ED/i }).click();

  await expect(page).toHaveURL(/\/case\/jane-kim-withdrawal$/);
  await expect(page.getByRole("heading", { name: /Muscle Aches and Nausea in the ED/i })).toBeVisible();
  await expect(page.locator("header").getByText("Jane Kim", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Student process/i })).toBeVisible();
  await expect(page.getByText(/Interview Jane like a patient/i)).toBeVisible();
  await expect(page.getByText(/Can I see her vital signs\?/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Start encounter/i })).toBeVisible();
  await expect(page.getByTestId("chat-thread")).toHaveCount(0);
});

test("pilot mode hides demo case direct links", async ({ page }) => {
  const response = await page.goto("/case/chest-pain");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /Chest Pain After the Train/i })).toHaveCount(0);
});

test("pilot mobile homepage stacks guide and Jane Kim case", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Practice clinical interviews with AI patients/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /How to use this simulator/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Assigned pilot case/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Muscle Aches and Nausea in the ED/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Chest Pain After the Train/i })).toHaveCount(0);
});

test("Jane Kim vital-sign request reveals Epic vitals without patient narration", async ({ page }) => {
  await page.goto("/case/jane-kim-withdrawal");
  await page.getByRole("button", { name: /Start encounter/i }).click();

  await page.getByLabel("Ask the patient a question").fill("What are her vital signs?");
  await page.getByRole("button", { name: /Send/i }).click();

  await expect(page.getByRole("status")).toContainText(/New result available/i);
  await expect(page.getByTestId("results-panel").getByText("Blood Pressure")).toBeVisible();
  await expect(page.getByTestId("results-panel").getByText("135/90")).toBeVisible();
  await expect(page.getByTestId("chat-thread")).not.toContainText("135/90");
});

test("Jane Kim lab request reveals Epic lab table", async ({ page }) => {
  await page.goto("/case/jane-kim-withdrawal");
  await page.getByRole("button", { name: /Start encounter/i }).click();

  await page.getByLabel("Ask the patient a question").fill("Can I order urine tox labs?");
  await page.getByRole("button", { name: /Send/i }).click();

  await expect(page.getByTestId("results-panel").getByText("Component")).toBeVisible();
  await expect(page.getByTestId("results-panel").getByText("Oxycodone")).toBeVisible();
  await expect(page.getByTestId("chat-thread")).not.toContainText("Oxycodone");
  await expect(page.getByTestId("chat-thread")).not.toContainText("Fentanyl");
});

test("Jane Kim H&P chart request opens PMH and PSH without blocking patient history questions", async ({ page }) => {
  await page.goto("/case/jane-kim-withdrawal");
  await page.getByRole("button", { name: /Start encounter/i }).click();

  await page.getByLabel("Ask the patient a question").fill("Show me the H&P.");
  await page.getByRole("button", { name: /Send/i }).click();

  await expect(page.getByTestId("results-panel").getByRole("heading", { name: "History & Physical" })).toBeVisible();
  await expect(page.getByTestId("results-panel").getByRole("heading", { name: "PAST MEDICAL HISTORY" })).toBeVisible();
  await expect(page.getByTestId("results-panel").getByRole("heading", { name: "PAST SURGICAL HISTORY" })).toBeVisible();

  await page.getByLabel("Ask the patient a question").fill("Have you had surgery before?");
  await page.getByRole("button", { name: /Send/i }).click();

  await expect(page.getByTestId("chat-thread")).toContainText(/right femur|open reduction/i);
});

test("unavailable objective request does not invent an artifact", async ({ page }) => {
  await page.goto("/case/jane-kim-withdrawal");
  await page.getByRole("button", { name: /Start encounter/i }).click();

  await page.getByLabel("Ask the patient a question").fill("What does the x-ray say?");
  await page.getByRole("button", { name: /Send/i }).click();

  await expect(page.getByRole("status")).toContainText(/No matching result/i);
  await expect(page.getByText(/No chart data opened yet/i)).toBeVisible();
  await expect(page.getByTestId("chat-thread")).toContainText(/I don't know those results/i);
});

test("initial Jane Kim results panel hides gated artifact names and values", async ({ page }) => {
  await page.goto("/case/jane-kim-withdrawal");

  await expect(page.getByTestId("results-panel").getByText(/No chart data opened yet/i)).toBeVisible();
  await expect(page.getByTestId("results-panel")).not.toContainText("Confirmatory urine toxicology");
  await expect(page.getByTestId("results-panel")).not.toContainText("Vital signs and physical exam");
  await expect(page.getByTestId("results-panel")).not.toContainText("History and physical");
  await expect(page.getByTestId("results-panel")).not.toContainText("Mental status exam");
  await expect(page.locator("body")).not.toContainText("135/90");
  await expect(page.locator("body")).not.toContainText("Oxycodone");
});

test("Jane Kim ROS and MSE requests reveal Epic clinical notes", async ({ page }) => {
  await page.goto("/case/jane-kim-withdrawal");
  await page.getByRole("button", { name: /Start encounter/i }).click();

  await page.getByLabel("Ask the patient a question").fill("Can I review the ROS?");
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByTestId("results-panel").getByText("REVIEW OF SYSTEMS", { exact: true })).toBeVisible();

  await page.getByLabel("Ask the patient a question").fill("What does the MSE show?");
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByTestId("results-panel").getByRole("heading", { name: "APPEARANCE / BEHAVIOR" })).toBeVisible();
  await expect(page.getByTestId("chat-thread")).not.toContainText("Denies passive or active suicidal ideation");
});

test("end case freezes chat and shows student feedback rubric", async ({ page }) => {
  await page.goto("/case/jane-kim-withdrawal");
  await page.getByRole("button", { name: /Start encounter/i }).click();

  await page.getByLabel("Ask the patient a question").fill("What brought you in today?");
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByTestId("chat-thread")).toContainText(/really sick and overwhelmed/i);
  await expect(page.getByTestId("chat-thread")).not.toContainText(/diarrhea|nausea|muscles and bones/i);

  await page.getByLabel("Ask the patient a question").fill("What symptoms are you having right now?");
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByTestId("chat-thread")).toContainText(/muscle aches|abdominal cramping|nausea/i);

  await page.getByLabel("Ask the patient a question").fill("Can I see your vital signs and urine toxicology labs?");
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByTestId("results-panel").getByText("Oxycodone")).toBeVisible();

  await page.getByRole("button", { name: /End case/i }).click();

  await expect(page.getByTestId("student-feedback")).toContainText("Formative case review");
  await expect(page.getByTestId("student-feedback")).toContainText("AAMC EPA 1");
  await expect(page.getByTestId("student-feedback")).toContainText("Diagnostic data use");
  await expect(page.getByLabel("Ask the patient a question")).toBeDisabled();
});
