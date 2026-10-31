import { runJavaScript } from "/javascript-runtime.mjs";

self.onmessage = async ({ data }) => {
  if (data.type !== "run") return;
  const { requestId, code, tests, stage } = data;
  const send = self.postMessage.bind(self);
  let remaining = 26000,
    messages = 0;
  const format = (value) => {
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, (_, item) =>
        typeof item === "bigint" ? `${item}n` : item,
      );
    } catch {
      return String(value);
    }
  };
  const output = (...args) => {
    if (remaining <= 0 || messages >= 200) return;
    const text = args.map(format).join(" ").slice(0, remaining);
    remaining -= text.length + 1;
    messages++;
    send({ type: "output", requestId, text });
  };
  console.log =
    console.info =
    console.warn =
    console.error =
    console.debug =
      output;
  send({ type: "status", requestId, status: "running" });
  try {
    const report = await runJavaScript({ code, tests, stage });
    send({ type: "result", requestId, report });
  } catch (error) {
    send({ type: "error", requestId, message: error?.stack || String(error) });
  }
};
