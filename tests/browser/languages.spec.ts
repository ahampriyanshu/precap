import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { strFromU8, unzipSync } from "fflate";

type Language = "python" | "javascript" | "go" | "java" | "cpp";
const labels: Record<Language, string> = {
  python: "Python",
  javascript: "JavaScript",
  go: "Go",
  java: "Java",
  cpp: "C++",
};
const starter: Record<Language, string> = {
  python: "exercise.py",
  javascript: "exercise.mjs",
  go: "exercise.go",
  java: "Exercise.java",
  cpp: "exercise.hpp",
};
const tests: Record<Language, string> = {
  python: "main.py",
  javascript: "main.mjs",
  go: "main.go",
  java: "Main.java",
  cpp: "main.cpp",
};
const languages = Object.keys(labels) as Language[];
const compiledLanguages = ["go", "java", "cpp"] as const;
const manifest = JSON.parse(fs.readFileSync("curriculum.json", "utf8"))
  .chapters as {
  directory: string;
  track: string;
  title: string;
}[];
const shared = manifest.find((chapter) => chapter.track === "dsa")!;
const lld = manifest.find((chapter) => chapter.track === "lld")!;
const hld = manifest.find((chapter) => chapter.track === "hld")!;
const base = `/learn/${shared.directory}/`;
const route = (language: Language, practice = true) =>
  `${base}${language === "python" ? "" : `${language}/`}${practice ? "practice/" : ""}`;
const storageKey = (language: Language) =>
  `python-dsa:work:v2:${shared.directory}${language === "python" ? "" : `/${language}`}`;
const editor = (page: Page, language: Language) =>
  page.getByRole("textbox", {
    name: `${labels[language]} code editor`,
    exact: true,
  });
const draft = (language: Language) =>
  language === "python"
    ? "# isolated Python draft\n"
    : `// isolated ${labels[language]} draft\n`;

async function selectLanguage(page: Page, language: Language) {
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption(language);
  await expect(page).toHaveURL(route(language));
  await expect(editor(page, language)).toBeEditable();
}

// These fixtures are execution probes, never implementations of a curriculum exercise.
const probeSuite = `export async function runTests(exercise, stage) {
  const value = await exercise.probe(stage);
  const checks = [{ name: 'awaited stage and fresh module', status: value === stage ? 'passed' : 'failed' }];
  return { checks, duration: 0, methods: checks.length, skipped: 0, passed: checks.every(c => c.status === 'passed') };
}`;

// Lifecycle-only adapter: it always reports a deliberate failure and contains
// no implementation of any curriculum exercise.
const lifecycleAdapter = String.raw`
let calls = 0;
async function probe({ files, onStatus, onOutput, signal }) {
  if (signal.aborted) throw new DOMException('Canceled', 'AbortError');
  const source = Object.entries(files).find(([name]) => /^(main\.go|Main\.java|main\.cpp)$/.test(name))[1];
  const marker = source.match(/PRECAP_[a-f0-9]+_/)[0];
  const name = 'lifecycle recovery probe ' + (++calls);
  onStatus({ phase: 'compiling', label: 'Compiling lifecycle probe' });
  await new Promise(resolve => setTimeout(resolve, 15));
  onStatus({ phase: 'running', label: 'Running lifecycle probe' });
  onOutput('stdout', name + '\n');
  const frame = (kind, value) => '\n' + marker + kind + ' ' + JSON.stringify(value) + '\n';
  return { phase: 'run', code: 1, termination: 'exited', durationMs: 1,
    stdout: frame('CHECK', { name, status: 'failed', detail: 'Deliberate lifecycle probe failure.' }) + frame('SUMMARY', { methods: 1, failed: 1 }), stderr: '' };
}
export const runGo = probe, runJava = probe, runCpp = probe;
export function stopJava() {}
export function stopCpp() {}
`;

test("all five fundamentals and language-specific shared routes are discoverable", async ({
  page,
}) => {
  await page.goto("/");
  for (const language of languages) {
    const chapter = manifest.find((item) => item.track === language);
    expect(chapter, `${language} fundamentals missing`).toBeTruthy();
    await page
      .getByRole("combobox", { name: "Programming language", exact: true })
      .selectOption(language);
    await expect(
      page.locator(`.track-${language}`).getByRole("heading", {
        name: `${labels[language]} fundamentals`,
        exact: true,
      }),
    ).toBeVisible();
  }
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("javascript");
  await expect(page.locator(".track-dsa .course-start")).toHaveAttribute(
    "href",
    `${base}javascript/`,
  );
  await expect(page.locator(".track-lld .course-start")).toHaveAttribute(
    "href",
    `/learn/${lld.directory}/javascript/`,
  );
  await page.reload();
  await expect(
    page.getByRole("combobox", {
      name: "Programming language",
      exact: true,
    }),
  ).toHaveValue("javascript");
  await page.locator(".track-dsa .course-start").click();
  await expect(page).toHaveURL(route("javascript", false));
  await page.getByRole("link", { name: "Open practice", exact: true }).click();
  await expect(editor(page, "javascript")).toBeEditable();
  for (const language of languages) {
    await selectLanguage(page, language);
    await expect(
      page.getByRole("tab", { name: starter[language], exact: true }),
    ).toBeVisible();
    await page.getByRole("tab", { name: /Tests.*read only/ }).click();
    await expect(
      page.getByRole("textbox", {
        name: `${labels[language]} test source`,
        exact: true,
      }),
    ).toHaveAttribute("aria-readonly", "true");
    await page
      .getByRole("tab", { name: starter[language], exact: true })
      .click();
  }
});

test("drafts stay isolated and every shared language offers browser execution", async ({
  page,
}) => {
  await page.goto(route("python"));
  for (const language of languages) {
    if (language !== "python") await selectLanguage(page, language);
    await editor(page, language).fill(draft(language));
    await expect(page.locator(".editor-status")).toContainText("Saved locally");
    await expect(
      page.getByRole("button", { name: "Run checks" }),
    ).toBeEnabled();
    await expect(page.locator(".native-panel")).toHaveCount(0);
  }
  for (const language of [...languages].reverse()) {
    await selectLanguage(page, language);
    await expect(editor(page, language)).toContainText(
      `isolated ${labels[language]} draft`,
    );
  }
  const saved = await page.evaluate(
    (keys) =>
      keys.map((key) => JSON.parse(localStorage.getItem(key) || "null")),
    languages.map(storageKey),
  );
  expect(saved.map((work) => work?.code)).toEqual(languages.map(draft));
  await selectLanguage(page, "go");
  await editor(page, "go").fill("// edited browser draft\n");
  await expect(page.locator(".editor-status")).toContainText("Saved locally");
  await page.reload();
  await expect(editor(page, "go")).toContainText("edited browser draft");
  await expect(page.getByRole("button", { name: "Run checks" })).toBeEnabled();
  await expect(
    page.getByRole("button", {
      name: /Mark complete after local tests|Completed locally/,
    }),
  ).toHaveCount(0);
});

test("old native completion flags retain drafts without counting browser course progress", async ({
  page,
}) => {
  const oldWork = compiledLanguages.flatMap((language) => {
    const fundamentals = manifest.filter(
      (chapter) => chapter.track === language,
    );
    const fundamental = fundamentals[0];
    const nextShared = manifest.filter((chapter) => chapter.track === "dsa")[1];
    return [
      {
        key: `python-dsa:work:v2:${fundamental.directory}`,
        code: `// preserved ${labels[language]} fundamentals draft\n`,
        final: false,
        localCompleted: true,
      },
      {
        key: storageKey(language),
        code: draft(language),
        final: false,
        localCompleted: true,
      },
      // Known browser completions are positive controls: waiting for one
      // prevents initial zero progress from hiding an asynchronous regression.
      {
        key: `python-dsa:work:v2:${fundamentals[1].directory}`,
        code: "// existing browser-verified draft\n",
        final: true,
        localCompleted: false,
      },
      {
        key: `python-dsa:work:v2:${nextShared.directory}/${language}`,
        code: "// existing browser-verified draft\n",
        final: true,
        localCompleted: false,
      },
    ];
  });
  await page.addInitScript((entries) => {
    for (const { key, code, final, localCompleted } of entries) {
      localStorage.setItem(
        key,
        JSON.stringify({
          code,
          prototype: final,
          final,
          localCompleted,
        }),
      );
    }
  }, oldWork);
  await page.goto("/");
  for (const language of compiledLanguages) {
    await page
      .getByRole("combobox", { name: "Programming language", exact: true })
      .selectOption(language);
    await expect(
      page.locator(`.track-${language}`).getByRole("progressbar"),
    ).toHaveAttribute("aria-valuenow", "1");
    await expect(
      page.locator(".track-dsa").getByRole("progressbar"),
    ).toHaveAttribute("aria-valuenow", "1");
  }
  for (const language of compiledLanguages) {
    const fundamental = manifest.find((chapter) => chapter.track === language)!;
    await page.goto(`/learn/${fundamental.directory}/practice/`);
    await expect(editor(page, language)).toContainText(
      `preserved ${labels[language]} fundamentals draft`,
    );
    await expect(
      page.getByRole("button", { name: "Run checks" }),
    ).toBeEnabled();
    await expect(
      page.locator(".sidebar-list .nav-number.is-complete"),
    ).toHaveCount(1);
    await expect(
      page.locator('.nav-chapter[aria-current="page"] .nav-number.is-complete'),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: /Mark complete after local tests|Completed locally/,
      }),
    ).toHaveCount(0);
  }
});

test("JavaScript stubs fail honestly and syntax errors never mark completion", async ({
  page,
}) => {
  await page.goto(route("javascript"));
  await expect(editor(page, "javascript")).toBeEditable();
  await page.getByRole("button", { name: "2. Final", exact: true }).click();
  await page.getByRole("button", { name: "Run checks" }).click();
  await expect(page.locator(".run-summary.failed")).toBeVisible();
  expect(
    await page.locator(".check-failed, .check-error").count(),
  ).toBeGreaterThan(0);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) || "null")?.final,
      storageKey("javascript"),
    ),
  ).toBe(false);
  await editor(page, "javascript").fill("export function broken( {\n");
  await page.getByRole("button", { name: "Run checks" }).click();
  await expect(page.locator(".execution-error")).toContainText("exercise.mjs");
  await expect(page.locator(".run-summary.passed")).toHaveCount(0);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) || "null")?.final,
      storageKey("javascript"),
    ),
  ).toBe(false);
});

test("browser JavaScript worker awaits asynchronous probes, uses fresh modules, and rejects empty suites", async ({
  page,
}) => {
  await page.goto(route("javascript"));
  const reports = await page.evaluate(
    async ({ suite }) => {
      async function run(code: string, tests: string, stage: string) {
        const worker = new Worker("/javascript.worker.js", { type: "module" });
        return await new Promise<Record<string, unknown>>((resolve, reject) => {
          const timer = setTimeout(() => {
            worker.terminate();
            reject(new Error("worker probe timed out"));
          }, 5000);
          worker.onerror = (event) => {
            clearTimeout(timer);
            worker.terminate();
            reject(new Error(event.message));
          };
          worker.onmessage = ({ data }) => {
            if (data.type === "result" || data.type === "error") {
              clearTimeout(timer);
              worker.terminate();
              if (data.type === "error") reject(new Error(data.message));
              else resolve(data.report);
            }
          };
          worker.postMessage({ type: "run", requestId: 1, code, tests, stage });
        });
      }
      const code =
        "let count = 0; export async function probe(stage) { await new Promise(resolve => setTimeout(resolve, 10)); return ++count === 1 ? stage : 'stale'; }";
      const first = await run(code, suite, "prototype");
      const second = await run(code, suite, "final");
      const failed = await run(
        "export async function probe() { return 'wrong'; }",
        suite,
        "final",
      );
      const empty = await run(
        "",
        "export function runTests(){return {checks:[],methods:0,skipped:0,passed:true};}",
        "final",
      );
      return { first, second, failed, empty };
    },
    { suite: probeSuite },
  );
  expect(reports.first.passed).toBe(true);
  expect(reports.second.passed).toBe(true);
  expect(reports.failed.passed).toBe(false);
  expect(reports.empty.passed).toBe(false);
});

test("JavaScript CPU work can be stopped and a subsequent run starts fresh", async ({
  page,
}) => {
  await page.goto(route("javascript"));
  const code = editor(page, "javascript");
  await expect(code).toBeEditable();
  await code.fill("while (true) {}\n");
  await page.getByRole("button", { name: "Run checks" }).click();
  await expect(page.locator(".running-placeholder")).toContainText(
    "Running checks",
  );
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.locator(".execution-error")).toContainText(
    "Execution stopped",
  );
  await expect(code).toBeEditable();
  await expect(code).toContainText("while (true)");
  await code.fill(
    "globalThis.__freshProbe=(globalThis.__freshProbe??0)+1; console.log('fresh probe',globalThis.__freshProbe); export function prototype(){throw Error('deliberate test failure');} export function solve(){throw Error('deliberate test failure');}\n",
  );
  for (let run = 0; run < 2; run++) {
    await page.getByRole("button", { name: "Run checks" }).click();
    await expect(page.locator(".run-summary.failed")).toBeVisible();
    await page.getByRole("tab", { name: /Console/ }).click();
    await expect(page.locator(".console-output")).toContainText(
      "fresh probe 1",
    );
    await expect(page.locator(".console-output")).not.toContainText(
      "fresh probe 2",
    );
    await page.getByRole("tab", { name: /Results/ }).click();
  }
});

for (const language of compiledLanguages) {
  test(`${labels[language]} browser compiler reports unfinished stubs and compilation errors honestly`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.goto(route(language));
    const code = editor(page, language);
    await expect(code).toBeEditable();
    await expect(page.locator(".native-panel")).toHaveCount(0);
    await page.getByRole("button", { name: "2. Final", exact: true }).click();
    await page.getByRole("button", { name: "Run checks" }).click();
    await expect(page.locator(".run-summary.failed")).toBeVisible({
      timeout: 150000,
    });
    expect(
      await page.locator(".check-failed, .check-error").count(),
    ).toBeGreaterThan(0);
    await expect(page.locator(".run-summary.passed")).toHaveCount(0);
    expect(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) || "null")?.final,
        storageKey(language),
      ),
    ).toBe(false);

    await code.fill(
      {
        go: "package main\nfunc broken( {\n",
        java: "public class Exercise { this is invalid Java; }\n",
        cpp: "#pragma once\nthis is not valid C++;\n",
      }[language],
    );
    await page.getByRole("button", { name: "Run checks" }).click();
    await expect(page.locator(".execution-error")).toContainText(
      "Compilation failed",
      { timeout: 150000 },
    );
    await expect(page.locator(".execution-error")).toContainText(
      starter[language],
    );
    await expect(page.locator(".run-summary.passed")).toHaveCount(0);
    await expect(code).toBeEditable();
    expect(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) || "null")?.final,
        storageKey(language),
      ),
    ).toBe(false);
  });

  test(`${labels[language]} can stop during compiler loading and recover with a fresh run`, async ({
    page,
    context,
  }) => {
    test.setTimeout(30000);
    const pattern = `**/runtimes/${language}/adapter.mjs`;
    let releaseLoad!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseLoad = resolve;
    });
    let firstLoaded!: () => void;
    const firstSettled = new Promise<void>((resolve) => {
      firstLoaded = resolve;
    });
    let gated = false;
    await context.route(pattern, async (request) => {
      const first = !gated;
      if (first) {
        gated = true;
        await gate;
      }
      try {
        await request.fulfill({
          contentType: "text/javascript",
          headers: { "Cache-Control": "no-store" },
          body: lifecycleAdapter,
        });
      } catch (error) {
        // Stopping an outer worker can abort its pending module request.
        if (!first) throw error;
      } finally {
        if (first) firstLoaded();
      }
    });
    try {
      await page.goto(route(language));
      const code = editor(page, language);
      await expect(code).toBeEditable();
      const original =
        fs.readFileSync(
          path.join("variants", language, shared.directory, starter[language]),
          "utf8",
        ) + "\n// lifecycle source remains saved\n";
      await code.fill(original);
      await expect(page.locator(".editor-status")).toContainText(
        "Saved locally",
      );
      await page.getByRole("button", { name: "2. Final", exact: true }).click();
      const requested = context.waitForEvent("request", (request) =>
        request.url().endsWith(`/runtimes/${language}/adapter.mjs`),
      );
      await page.getByRole("button", { name: "Run checks" }).click();
      await requested;
      await expect(page.locator(".running-placeholder")).toContainText(
        /Loading/,
      );
      await page.getByRole("button", { name: "Stop", exact: true }).click();
      await expect(page.locator(".execution-error")).toContainText(
        "Execution stopped",
      );
      await expect(code).toBeEditable();
      expect(
        await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key) || "null")?.code,
          storageKey(language),
        ),
      ).toBe(original);
      releaseLoad();
      await firstSettled;
      await expect(page.locator(".run-summary")).toHaveCount(0);
      await page.getByRole("button", { name: "Run checks" }).click();
      await expect(page.locator(".run-summary.failed")).toBeVisible();
      await expect(page.locator(".check-failed summary")).toHaveText(
        "lifecycle recovery probe 1",
      );
      await expect(page.locator(".execution-error")).toHaveCount(0);
      await expect(code).toBeEditable();
      expect(
        await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key) || "null")?.code,
          storageKey(language),
        ),
      ).toBe(original);
      expect(
        await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key) || "null")?.final,
          storageKey(language),
        ),
      ).toBe(false);
    } finally {
      releaseLoad();
      await context.unroute(pattern);
    }
  });

  test(`${labels[language]} offers browser execution and downloads the edited native bundle`, async ({
    page,
  }) => {
    await page.goto(route(language));
    await expect(editor(page, language)).toBeEditable();
    await expect(page.locator(".native-panel")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Run checks" }),
    ).toBeEnabled();
    await expect(page.locator(".editor-status")).toContainText(
      `${labels[language]} · runs on your device`,
    );
    await editor(page, language).fill(draft(language));
    await page.getByRole("button", { name: "2. Final", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "2. Final", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    const promise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download exercise", exact: true })
      .last()
      .click();
    const download = await promise;
    expect(download.suggestedFilename()).toBe(
      `dsa-${shared.directory.split("/")[1]}-${language}.zip`,
    );
    const files = unzipSync(fs.readFileSync((await download.path())!));
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(["README.md", starter[language], tests[language]]),
    );
    expect(Object.keys(files).some((name) => /\.(py|mjs)$/.test(name))).toBe(
      false,
    );
    expect(strFromU8(files[starter[language]])).toBe(draft(language));
    const sourceDirectory = path.join("variants", language, shared.directory);
    for (const name of fs.readdirSync(sourceDirectory)) {
      if (/\.(go|java|cpp|hpp|h|json|mod|txt)$/.test(name)) {
        expect(files[name], `missing supporting file ${name}`).toBeDefined();
        if (name !== starter[language])
          expect(strFromU8(files[name])).toBe(
            fs.readFileSync(path.join(sourceDirectory, name), "utf8"),
          );
      }
    }
  });
}

test("legacy Python and HLD routes keep their original editor and diagram flows", async ({
  page,
}) => {
  await page.goto(route("python"));
  await expect(editor(page, "python")).toBeEditable();
  await expect(
    page.getByRole("tab", { name: "exercise.py", exact: true }),
  ).toBeVisible();
  await page.goto(`/learn/${hld.directory}/`);
  await expect(
    page.getByRole("combobox", { name: "Programming language" }),
  ).toHaveCount(1);
  await page
    .getByRole("link", { name: "Open design canvas", exact: true })
    .click();
  await expect(page.locator(".excalidraw")).toBeVisible();
  await expect(page.getByRole("button", { name: "Run checks" })).toHaveCount(0);
});

test("browser compiler desktop evidence and mobile language controls remain usable", async ({
  page,
}, testInfo) => {
  await page.goto(route("java"));
  await expect(editor(page, "java")).toBeEditable();
  await expect(page.locator(".results-panel")).toBeVisible();
  await expect(page.getByRole("button", { name: "Run checks" })).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath("language-practice.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("combobox", { name: "Programming language", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const select = await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .boundingBox();
  expect(select!.x).toBeGreaterThanOrEqual(0);
  expect(select!.x + select!.width).toBeLessThanOrEqual(390);
  await page
    .getByRole("button", { name: "Open lesson navigation", exact: true })
    .click();
  const sidebar = page.getByRole("dialog", {
    name: "Lesson navigation",
    exact: true,
  });
  await expect(sidebar).toBeVisible();
  await expect(
    sidebar.getByRole("textbox", { name: "Search course lessons" }),
  ).toBeVisible();
  await expect(sidebar.locator(".nav-chapter").first()).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("language-practice-mobile.png"),
  });
});

test("LLD keeps its selected language across lesson, practice, and next lesson", async ({
  page,
}) => {
  const first = manifest.filter((chapter) => chapter.track === "lld")[0];
  const second = manifest.filter((chapter) => chapter.track === "lld")[1];
  await page.goto(`/learn/${first.directory}/javascript/`);
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("cpp");
  await expect(page).toHaveURL(`/learn/${first.directory}/cpp/`);
  await expect(page.locator(".next-lesson")).toHaveAttribute(
    "href",
    `/learn/${second.directory}/cpp/`,
  );
  await page.getByRole("link", { name: "Open practice", exact: true }).click();
  await expect(page).toHaveURL(`/learn/${first.directory}/cpp/practice/`);
  await expect(editor(page, "cpp")).toBeEditable();
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("javascript");
  await expect(page).toHaveURL(
    `/learn/${first.directory}/javascript/practice/`,
  );
  await expect(editor(page, "javascript")).toBeEditable();
  await page.getByRole("button", { name: "Run checks" }).click();
  await expect(page.locator(".run-summary.failed")).toBeVisible();
  await expect(page.locator(".check-row pre").first()).toContainText(
    "Not implemented",
  );
  await page.goto("/");
  await expect(
    page.getByRole("combobox", {
      name: "Programming language",
      exact: true,
    }),
  ).toHaveValue("javascript");
});

test("C++ Unicode exercise downloads its required helper header unchanged", async ({
  page,
}) => {
  const chapter = manifest.find((chapter) =>
    chapter.directory.startsWith("dsa/02-"),
  )!;
  await page.goto(`/learn/${chapter.directory}/cpp/practice/`);
  await expect(editor(page, "cpp")).toBeEditable();
  const promise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download exercise", exact: true })
    .last()
    .click();
  const download = await promise;
  const files = unzipSync(fs.readFileSync((await download.path())!));
  expect(strFromU8(files["unicode.hpp"])).toBe(
    fs.readFileSync(`variants/cpp/${chapter.directory}/unicode.hpp`, "utf8"),
  );
  expect(strFromU8(files["exercise.hpp"])).toContain('#include "unicode.hpp"');
});
