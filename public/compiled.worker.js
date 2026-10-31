// Java owns a classic child Worker using importScripts.
let active;
self.onmessage = async ({ data }) => {
  if (data.type === "cancel") {
    active?.abort();
    return;
  }
  if (data.type !== "run" || active) return;
  const controller = new AbortController();
  active = controller;
  try {
    const { runCompiled } = await import("/compiled-runtime.mjs");
    if (!controller.signal.aborted)
      await runCompiled(
        data,
        (value) => self.postMessage({ requestId: data.requestId, ...value }),
        controller.signal,
      );
  } catch (error) {
    if (!controller.signal.aborted)
      self.postMessage({
        requestId: data.requestId,
        type: "error",
        message: error?.message || String(error),
      });
  } finally {
    if (active === controller) active = undefined;
  }
};
