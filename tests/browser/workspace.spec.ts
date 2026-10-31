import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { strFromU8, unzipSync } from "fflate";

const chapters = JSON.parse(fs.readFileSync("curriculum.json", "utf8"))
  .chapters as {
  directory: string;
  track: string;
  title: string;
  concept: string;
  native: boolean;
}[];
const first = chapters.find((c) => c.track === "python")!;
const native = chapters.find((c) => c.native)!;
const gc = chapters.find((c) => /garbage collection/i.test(c.title))!;
const lld = chapters.find((c) => c.track === "lld")!;
const hld = chapters.find((c) => c.track === "hld")!;
const lesson = (chapter: typeof first) => `/learn/${chapter.directory}/`;
const practice = (chapter: typeof first) => `${lesson(chapter)}practice/`;

test("reading comes first, then practice splits the question and editor vertically", async ({
  page,
}) => {
  await page.goto(lesson(first));
  await expect(
    page.getByRole("heading", { name: first.title, exact: true }),
  ).toBeVisible();
  await expect(page.locator(".lesson-reader")).toBeVisible();
  await expect(page.locator(".cm-editor")).toHaveCount(0);
  await page.getByRole("link", { name: "Open practice" }).click();
  await expect(page).toHaveURL(practice(first));
  await expect(
    page.getByRole("region", { name: "Exercise question" }),
  ).toBeVisible();
  const editor = page.getByRole("textbox", { name: "Python code editor" });
  await expect(editor).toBeEditable();
  const questionBox = await page.locator(".problem-panel").boundingBox();
  const editorBox = await page.locator(".coding-panel").boundingBox();
  expect(Math.abs(questionBox!.y - editorBox!.y)).toBeLessThan(2);
  expect(questionBox!.x + questionBox!.width).toBeLessThanOrEqual(
    editorBox!.x + 1,
  );
  expect(editorBox!.width).toBeGreaterThan(800);
  await page.getByRole("button", { name: "Hide question" }).click();
  await expect(
    page.getByRole("region", { name: "Exercise question" }),
  ).toHaveCount(0);
  expect(
    (await page.locator(".coding-panel").boundingBox())!.width,
  ).toBeGreaterThan(1300);
  await page.getByRole("link", { name: "Back to lesson" }).click();
  await expect(page).toHaveURL(lesson(first));
});

test("topic search, clear GC content, saved code, Python failures and reset", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "precap home" })).toBeVisible();
  await page.keyboard.press("/");
  const search = page.getByRole("textbox", { name: "Search topics" });
  await expect(search).toBeFocused();
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("python");
  await search.fill("garbage collection");
  await expect(page.locator(".track-python .catalog-chapter")).toHaveCount(1);
  await page.locator(".track-python .catalog-chapter").click();
  await expect(page).toHaveURL(lesson(gc));
  await expect(page.locator(".lesson-reader")).toContainText("gc.collect");
  await expect(page.locator(".lesson-reader")).toContainText("references");
  await expect(page.locator(".cm-editor")).toHaveCount(0);
  await page.goto(practice(first));
  const editor = page.getByRole("textbox", { name: "Python code editor" });
  await expect(editor).toBeEditable();
  await page.getByRole("button", { name: "Run checks" }).click();
  await expect(page.locator(".run-summary.failed")).toBeVisible({
    timeout: 90000,
  });
  await expect(page.locator(".check-row pre").first()).toContainText(
    "NotImplementedError",
  );
  await editor.fill("# my local draft\n");
  await page.reload();
  await expect(editor).toContainText("my local draft");
  await page.getByRole("button", { name: "Reset starter code" }).click();
  await page.getByRole("button", { name: "Reset code", exact: true }).click();
  await expect(editor).toContainText("NotImplementedError");
  await expect(page.locator(".run-summary")).toHaveCount(0);
});

test("LLD is discoverable and teaches the design before opening browser practice", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("python");
  const course = page.locator(".track-lld");
  await expect(
    page.getByRole("heading", { name: "Low-level design", exact: true }),
  ).toBeVisible();
  await expect(course).toContainText("15 completed");
  await page
    .getByRole("textbox", { name: "Search topics" })
    .fill("parking lot");
  await expect(page.locator(".catalog-chapter")).toHaveCount(1);
  await course.locator(".catalog-chapter").click();
  await expect(page).toHaveURL(lesson(lld));
  for (const name of [
    "The problem",
    "Naive approach",
    "Where the naive approach breaks",
    "A better design",
    "Real-world usage",
  ]) {
    await expect(
      page
        .locator(".lesson-reader")
        .getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator(".cm-editor")).toHaveCount(0);
  await page.getByRole("link", { name: "Open practice" }).click();
  await expect(page).toHaveURL(practice(lld));
  const editor = page.getByRole("textbox", { name: "Python code editor" });
  await expect(editor).toBeEditable();
  await page.getByRole("button", { name: "Run checks" }).click();
  await expect(page.locator(".run-summary.failed")).toBeVisible({
    timeout: 90000,
  });
  await expect(page.locator(".check-row pre").first()).toContainText(
    "NotImplementedError",
  );
  await expect(
    page.getByRole("separator", { name: "Resize practice panels" }),
  ).toBeVisible();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download exercise", exact: true })
    .click();
  const archive = await downloaded;
  expect(archive.suggestedFilename()).toBe(
    `lld-${lld.directory.split("/")[1]}.zip`,
  );
  const files = unzipSync(fs.readFileSync((await archive.path())!));
  expect(Object.keys(files).sort()).toEqual([
    "README.md",
    "exercise.py",
    "main.py",
  ]);
  expect(strFromU8(files["README.md"])).toContain("## Real-world usage");
  expect(strFromU8(files["exercise.py"])).toContain("NotImplementedError");
  expect(strFromU8(files["main.py"])).toContain("class FinalTests");
  await editor.fill("# my LLD design\n");
  await page.reload();
  await expect(editor).toContainText("my LLD design");
});

test("HLD is discoverable and opens an architecture canvas after the lesson", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".learning-path > li")).toHaveCount(4);
  const course = page.locator(".track-hld");
  await expect(
    page.getByRole("heading", { name: "High-level design", exact: true }),
  ).toBeVisible();
  await expect(course).toContainText("15 reviewed");
  await page
    .getByRole("textbox", { name: "Search topics" })
    .fill("URL Shortener");
  await expect(page.locator(".catalog-chapter")).toHaveCount(1);
  await course.locator(".catalog-chapter").click();
  await expect(page).toHaveURL(lesson(hld));
  await expect(page.locator(".cm-editor")).toHaveCount(0);
  await expect(
    page.locator(".lesson-reader pre code.language-text"),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Open design canvas", exact: true })
    .click();
  await expect(page).toHaveURL(practice(hld));
  await expect(page.locator(".excalidraw")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Design brief", exact: true }),
  ).toContainText("Design brief");
  await expect(
    page.getByRole("button", { name: "Run checks", exact: true }),
  ).toHaveCount(0);
});

test("CPU-bound code can be stopped without blocking the editor", async ({
  page,
}) => {
  await page.goto(practice(first));
  const editor = page.getByRole("textbox", { name: "Python code editor" });
  await editor.fill("while True: pass");
  await page.getByRole("button", { name: "Run checks" }).click();
  await expect(page.locator(".running-placeholder")).toContainText(
    "Running checks",
    { timeout: 90000 },
  );
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.locator(".execution-error")).toContainText(
    "Execution stopped",
  );
  await expect(editor).toBeEditable();
});

test("native concurrency has downloads and explicit local completion", async ({
  page,
}) => {
  await page.goto(practice(native));
  await expect(page.getByRole("button", { name: "Run checks" })).toHaveCount(0);
  await expect(page.locator(".native-panel")).toContainText(
    "native threads or processes",
  );
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download exercise", exact: true })
    .last()
    .click();
  expect((await downloaded).suggestedFilename()).toMatch(/\.zip$/);
  await page
    .getByRole("button", { name: "Mark complete after local tests" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Completed locally" }),
  ).toBeVisible();
});

test("mobile keeps the same lesson-first flow and usable navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(lesson(first));
  await expect(
    page.getByRole("heading", { name: first.title, exact: true }),
  ).toBeVisible();
  await expect(page.locator(".cm-editor")).toHaveCount(0);
  await page.getByRole("link", { name: "Open practice" }).click();
  await expect(
    page.getByRole("textbox", { name: "Python code editor" }),
  ).toBeEditable();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Hide editor", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Python workspace" }),
  ).toBeHidden();
  expect(
    (await page.locator(".problem-panel").boundingBox())!.height,
  ).toBeGreaterThan(550);
  await page.getByRole("button", { name: "Show editor", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Python code editor" }),
  ).toBeEditable();
  await page.getByRole("button", { name: "Open lesson navigation" }).click();
  await page
    .getByRole("textbox", { name: "Search course lessons" })
    .fill("garbage");
  await page.getByRole("link", { name: new RegExp(gc.title) }).click();
  await expect(page).toHaveURL(lesson(gc));
  await page.goto(lesson(hld));
  await expect(page).toHaveURL(lesson(hld));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("home, lessons and desktop/mobile practice pass accessibility checks", async ({
  page,
}) => {
  for (const url of [
    "/",
    lesson(first),
    practice(first),
    practice(native),
    lesson(lld),
    practice(lld),
    lesson(hld),
    practice(hld),
  ]) {
    await page.goto(url);
    if (url === practice(hld))
      await expect(page.locator(".excalidraw")).toBeVisible();
    else if (url.includes("practice"))
      await expect(
        page.getByRole("textbox", { name: "Python code editor" }),
      ).toBeEditable();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          message: n.failureSummary,
        })),
      })),
      url,
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(practice(first));
  await expect(
    page.getByRole("textbox", { name: "Python code editor" }),
  ).toBeEditable();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        message: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});

test("divider resizes, remembers width, and collapses either pane without losing code", async ({
  page,
}) => {
  await page.goto(practice(gc));
  const editor = page.getByRole("textbox", { name: "Python code editor" });
  await expect(editor).toBeEditable();
  await editor.fill("# preserved while resizing\n");
  const separator = page.getByRole("separator", {
    name: "Resize practice panels",
  });
  await expect(separator).toBeVisible();
  const question = page.locator(".problem-panel");
  const original = (await question.boundingBox())!.width;
  const handle = (await separator.boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + 80);
  await page.mouse.down();
  await page.mouse.move(handle.x + 180, handle.y + 80, { steps: 8 });
  await page.mouse.up();
  const resized = (await question.boundingBox())!.width;
  expect(resized).toBeGreaterThan(original + 100);
  await page.reload();
  await expect(editor).toContainText("preserved while resizing");
  await expect
    .poll(async () => (await question.boundingBox())!.width)
    .toBeCloseTo(resized, 0);
  await separator.focus();
  await page.keyboard.press("ArrowLeft");
  expect((await question.boundingBox())!.width).toBeLessThan(resized - 10);
  await page
    .getByRole("button", { name: "Collapse editor pane" })
    .click({ position: { x: 24, y: 14 } });
  await expect(
    page.getByRole("region", { name: "Python workspace" }),
  ).toBeHidden();
  expect((await question.boundingBox())!.width).toBeGreaterThan(1390);
  await page.getByRole("button", { name: "Restore editor pane" }).click();
  await expect(editor).toContainText("preserved while resizing");
  await separator.focus();
  await page.keyboard.press("Home");
  await expect(question).toHaveCount(0);
  expect(
    (await page.locator(".coding-panel").boundingBox())!.width,
  ).toBeGreaterThan(1390);
  await page.getByRole("button", { name: "Restore question pane" }).click();
  await separator.dblclick({ position: { x: 4, y: 80 } });
  expect(
    Math.abs((await question.boundingBox())!.width - original),
  ).toBeLessThan(2);
  const nextHandle = (await separator.boundingBox())!;
  await page.mouse.move(nextHandle.x + 4, nextHandle.y + 80);
  await page.mouse.down();
  await page.mouse.move(3, nextHandle.y + 80, { steps: 10 });
  await page.mouse.up();
  await expect(question).toHaveCount(0);
  await page.getByRole("button", { name: "Restore question pane" }).click();
  await expect(editor).toContainText("preserved while resizing");
});
