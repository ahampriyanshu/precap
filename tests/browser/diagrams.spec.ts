import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

const chapters = JSON.parse(fs.readFileSync("curriculum.json", "utf8"))
  .chapters as { directory: string; title: string; track: string }[];
const hld = chapters.filter((chapter) => chapter.track === "hld");
const practice = (index = 0) => `/learn/${hld[index].directory}/practice/`;
const stored = (page: Page, id = hld[0].directory) =>
  page.evaluate(
    (key) =>
      new Promise<{ scene: string; notes: string; reviewed: boolean } | null>(
        (resolve, reject) => {
          const request = indexedDB.open("precap-diagrams", 1);
          request.onsuccess = () => {
            const db = request.result;
            const query = db
              .transaction("drawings")
              .objectStore("drawings")
              .get(key);
            query.onsuccess = () => {
              resolve(query.result ?? null);
              db.close();
            };
            query.onerror = () => reject(query.error);
          };
          request.onerror = () => reject(request.error);
        },
      ),
    id,
  );
async function rectangle(page: Page) {
  await expect(page.locator(".excalidraw")).toBeVisible();
  await page
    .getByRole("radio", { name: "Rectangle", exact: true })
    .check({ force: true });
  const canvas = await page
    .locator(".excalidraw canvas.interactive")
    .boundingBox();
  await page.mouse.move(canvas!.x + canvas!.width * 0.45, canvas!.y + 150);
  await page.mouse.down();
  await page.mouse.move(
    canvas!.x + canvas!.width * 0.45 + 120,
    canvas!.y + 230,
    { steps: 5 },
  );
  await page.mouse.up();
}

test("HLD diagrams autosave by lesson, export, and track explicit self-review", async ({
  page,
}) => {
  const runtime: string[] = [];
  page.on("request", (request) => {
    if (/pyodide|python\.worker|python-harness/.test(request.url()))
      runtime.push(request.url());
  });
  await page.goto(`/learn/${hld[0].directory}/`);
  await expect(
    page.getByRole("link", { name: "Open practice", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Open design canvas", exact: true })
    .click();
  await expect(page).toHaveURL(practice());
  await expect(
    page.getByRole("region", { name: "Design brief", exact: true }),
  ).toContainText("Stress the design");
  await expect(
    page.locator(".cm-editor, .run-toolbar, .results-panel"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Run checks", exact: true }),
  ).toHaveCount(0);
  const review = page.getByRole("button", {
    name: "Mark reviewed",
    exact: true,
  });
  await expect(review).toBeDisabled();
  await rectangle(page);
  await page
    .getByRole("textbox", { name: "Design notes", exact: true })
    .fill(
      "A single authority claims aliases; positive caches serve redirects.",
    );
  await expect(page.locator(".diagram-save-state")).toHaveText(
    "Saved on this device",
  );
  await expect
    .poll(async () => {
      const work = await stored(page);
      return work ? JSON.parse(work.scene).elements.length : 0;
    })
    .toBe(1);
  await review.click();
  await expect(
    page.getByRole("button", { name: "Reviewed", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => (await stored(page))?.reviewed).toBe(true);
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export diagram", exact: true })
    .click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toMatch(/\.excalidraw$/);
  const exported = JSON.parse(fs.readFileSync((await file.path())!, "utf8"));
  expect(exported.type).toBe("excalidraw");
  expect(exported.elements).toHaveLength(1);
  await page.reload();
  await expect(page.locator(".excalidraw")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Design notes", exact: true }),
  ).toHaveValue(/single authority/);
  await expect(
    page.getByRole("button", { name: "Reviewed", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("textbox", { name: "Design notes", exact: true })
    .fill("Updated: clarify consistency after a lost response.");
  await expect(
    page.getByRole("button", { name: "Mark reviewed", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to lesson", exact: true }).click();
  await page
    .getByRole("link", { name: "Open design canvas", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Design notes", exact: true }),
  ).toHaveValue(/Updated:/);
  await page.goto(practice(1));
  await expect(page.locator(".excalidraw")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Design notes", exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Mark reviewed", exact: true }),
  ).toBeDisabled();
  expect(runtime).toEqual([]);
});

test("HLD keeps canvas contents when resizing and on mobile", async ({
  page,
}) => {
  await page.goto(practice());
  await rectangle(page);
  const brief = page.getByRole("region", { name: "Design brief", exact: true });
  const divider = page.getByRole("separator", {
    name: "Resize practice panels",
  });
  const original = (await brief.boundingBox())!.width;
  await divider.focus();
  await page.keyboard.press("ArrowRight");
  expect((await brief.boundingBox())!.width).toBeGreaterThan(original);
  await page
    .getByRole("button", { name: "Collapse brief pane", exact: true })
    .click();
  await expect(brief).toHaveCount(0);
  expect(
    (await page
      .getByRole("region", { name: "Architecture canvas" })
      .boundingBox())!.width,
  ).toBeGreaterThan(1300);
  await page
    .getByRole("button", { name: "Restore brief pane", exact: true })
    .click();
  await expect(brief).toBeVisible();
  await expect
    .poll(async () => {
      const work = await stored(page);
      return work ? JSON.parse(work.scene).elements.length : 0;
    })
    .toBe(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Hide brief", exact: true }).click();
  await expect(page.locator(".excalidraw")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Hide canvas", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Architecture canvas" }),
  ).toBeHidden();
  await expect(brief).toBeVisible();
  await page.getByRole("button", { name: "Show canvas", exact: true }).click();
  await expect(page.locator(".excalidraw")).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((issue) => ({
      id: issue.id,
      nodes: issue.nodes.map((node) => node.failureSummary),
    })),
  ).toEqual([]);
});

test("an unreadable saved diagram is kept until the user chooses an unsaved canvas", async ({
  page,
}) => {
  await page.goto(practice());
  await expect(page.locator(".excalidraw")).toBeVisible();
  await page.evaluate(
    (id) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("precap-diagrams", 1);
        open.onsuccess = () => {
          const db = open.result;
          const transaction = db.transaction("drawings", "readwrite");
          transaction
            .objectStore("drawings")
            .put({ version: 99, scene: "corrupt backup" }, id);
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
        };
      }),
    hld[0].directory,
  );
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "Architecture canvas", exact: true })
      .getByRole("alert"),
  ).toContainText("Couldn’t load this saved diagram");
  await expect(page.locator(".excalidraw")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Continue without autosave", exact: true })
    .click();
  await rectangle(page);
  await expect(page.locator(".diagram-save-state")).toContainText(
    "Autosave off",
  );
  expect((await stored(page))!.scene).toBe("corrupt backup");
});

test("native Excalidraw import preserves embedded images through save, reload and export", async ({
  page,
}) => {
  await page.goto(practice());
  await expect(page.locator(".excalidraw")).toBeVisible();
  const dataURL = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#285e4b";
    context.fillRect(0, 0, 2, 2);
    return canvas.toDataURL("image/png");
  });
  const imported = {
    type: "excalidraw",
    version: 2,
    source: "fixture",
    elements: [
      {
        id: "diagram-image",
        type: "image",
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        angle: 0,
        strokeColor: "transparent",
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 1,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        fileId: "embedded-png",
        status: "saved",
        scale: [1, 1],
        crop: null,
      },
    ],
    appState: { viewBackgroundColor: "#ffffff" },
    files: {
      "embedded-png": {
        id: "embedded-png",
        mimeType: "image/png",
        dataURL,
        created: 1,
        lastRetrieved: 1,
      },
    },
  };
  const transfer = await page.evaluateHandle((scene) => {
    const data = new DataTransfer();
    data.items.add(
      new File([JSON.stringify(scene)], "diagram.excalidraw", {
        type: "application/json",
      }),
    );
    return data;
  }, imported);
  await page
    .locator(".excalidraw")
    .dispatchEvent("drop", { dataTransfer: transfer });
  await transfer.dispose();
  await expect
    .poll(async () => {
      const work = await stored(page);
      return work ? Object.keys(JSON.parse(work.scene).files) : [];
    })
    .toEqual(["embedded-png"]);
  await page.reload();
  await expect(page.locator(".excalidraw")).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export diagram", exact: true })
    .click();
  const archive = await download;
  const exported = JSON.parse(fs.readFileSync((await archive.path())!, "utf8"));
  expect(exported.elements).toHaveLength(1);
  expect(exported.elements[0].fileId).toBe("embedded-png");
  expect(exported.files["embedded-png"].dataURL).toBe(dataURL);
});

test("a failed autosave is visible and can be retried without losing the current drawing", async ({
  page,
}) => {
  await page.goto(practice());
  await expect(page.locator(".excalidraw")).toBeVisible();
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Storage full", "QuotaExceededError");
    };
    Object.assign(window, {
      restoreDiagramStorage: () => {
        IDBObjectStore.prototype.put = put;
      },
    });
  });
  await rectangle(page);
  await expect(
    page
      .getByRole("region", { name: "Architecture canvas", exact: true })
      .getByRole("alert"),
  ).toContainText("Couldn’t save this draft");
  await expect(
    page.getByRole("button", { name: "Export diagram", exact: true }),
  ).toBeEnabled();
  await page.evaluate(() =>
    (
      window as unknown as { restoreDiagramStorage: () => void }
    ).restoreDiagramStorage(),
  );
  await page.getByRole("button", { name: "Retry saving", exact: true }).click();
  await expect(page.locator(".diagram-save-state")).toHaveText(
    "Saved on this device",
  );
  await expect
    .poll(async () => {
      const work = await stored(page);
      return work ? JSON.parse(work.scene).elements.length : 0;
    })
    .toBe(1);
});
