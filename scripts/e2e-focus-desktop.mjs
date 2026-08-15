const targets = await fetch("http://127.0.0.1:9222/json/list").then((response) => response.json());
const target = targets.find((item) => item.type === "page" && item.url.includes("3000-ie9yf3bnhqz8krtgae53d-2b9e5ebd"));

if (!target?.webSocketDebuggerUrl) {
  throw new Error("Не найдена открытая страница предпросмотра для проверки focus-visible.");
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let sequence = 0;

const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

try {
  await call("Emulation.clearDeviceMetricsOverride");
  await evaluate("location.reload()");
  await wait(700);
  const sequenceResults = [];
  for (let index = 0; index < 6; index += 1) {
    await call("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    await call("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    await wait(40);
    sequenceResults.push(await evaluate(`(() => {
      const element = document.activeElement;
      const style = getComputedStyle(element);
      return {
        index: ${index + 1},
        tag: element?.tagName,
        text: element?.textContent?.trim().slice(0, 80) || element?.getAttribute("aria-label") || "",
        focusVisible: element?.matches(":focus-visible") ?? false,
        outlineColor: style.outlineColor,
        outlineWidth: style.outlineWidth,
        outlineOffset: style.outlineOffset,
      };
    })()`));
  }

  console.log(JSON.stringify({ sequence: sequenceResults }, null, 2));
} finally {
  socket.close();
}
