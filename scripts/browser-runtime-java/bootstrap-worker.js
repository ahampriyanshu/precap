/* Build-time bootstrap only. No learner source or answers are embedded here. */
let library;
async function describe(error) {
  try {
    return error instanceof Error ? error.message : await error.toString();
  } catch {
    return "Browser bootstrap failed.";
  }
}
const ready = (async () => {
  importScripts("https://cjrtnc.leaningtech.com/4.3/loader.js");
  const response = await fetch("./bootstrap.jar");
  if (!response.ok)
    throw new Error("The pinned compiler bootstrap could not be loaded.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  await cheerpjInit({
    version: 17,
    status: "none",
    overrideDocumentBase: new URL(".", self.location.href).href,
    execCallback() {
      throw new Error(
        "External processes are unavailable in the browser build.",
      );
    },
  });
  cheerpOSAddStringFile("/str/bootstrap.jar", bytes);
  library = await cheerpjRunLibrary("/str/bootstrap.jar");
  const runner =
    await library.top.onefly.zero2leetcode.runner.BrowserJavaRunner;
  const result = await runner.warmup();
  if (result !== "ok") throw new Error(String(result));
  postMessage({ type: "ready" });
})();
ready.catch(async (error) =>
  postMessage({ type: "error", message: await describe(error) }),
);
onmessage = async ({ data }) => {
  try {
    await ready;
    const Class = await library.java.lang.Class;
    const URL = await library.java.net.URL;
    const URLClassLoader = await library.java.net.URLClassLoader;
    const loader = await new URLClassLoader([
      await new URL("file:/str/bootstrap.jar"),
    ]);
    const compilerClass = await Class.forName(
      "top.onefly.zero2leetcode.runner.BrowserJavaRunner",
      true,
      loader,
    );
    const stringClass = await Class.forName("java.lang.String");
    const compile = await compilerClass.getDeclaredMethod("compile", [
      stringClass,
      stringClass,
    ]);
    await compile.setAccessible(true);
    const compiled = await compile.invoke(null, [
      data.source,
      "PrecapJavaRunner.java",
    ]);
    const resultClass = await compiled.getClass();
    const get = async (name) => {
      const field = await resultClass.getDeclaredField(name);
      await field.setAccessible(true);
      return field.get(compiled);
    };
    const iterator = await (await (await get("classes")).entrySet()).iterator();
    const Base64 = await library.java.util.Base64;
    const encoder = await Base64.getEncoder();
    const classes = [];
    while (await iterator.hasNext()) {
      const entry = await iterator.next();
      classes.push({
        name: await entry.getKey(),
        base64: await encoder.encodeToString(await entry.getValue()),
      });
    }
    postMessage({
      type: "result",
      result: {
        classes,
        errors: await get("errors"),
        warnings: await get("warnings"),
      },
    });
  } catch (error) {
    postMessage({ type: "error", message: await describe(error) });
  }
};
