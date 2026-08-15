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

const tab = async (shift = false) => {
  const modifiers = shift ? 8 : 0;
  await call("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, modifiers });
  await call("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, modifiers });
  await wait(35);
  return evaluate(`(() => {
    const element = document.activeElement;
    const style = getComputedStyle(element);
    return {
      tag: element?.tagName,
      text: element?.textContent?.trim().replace(/\\s+/g, " ").slice(0, 100) || "",
      placeholder: element?.getAttribute("placeholder") || "",
      focusVisible: element?.matches(":focus-visible") ?? false,
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
      outlineOffset: style.outlineOffset,
      inGame: Boolean(element?.closest("#route-game")),
      inBrief: Boolean(element?.closest("#brief")),
      isFaq: Boolean(element?.matches("button[aria-expanded]")),
      isHeaderCta: Boolean(element?.matches("header a[href='#brief']")),
    };
  })()`);
};

try {
  await call("Emulation.clearDeviceMetricsOverride");
  await evaluate("location.reload()");
  await wait(700);

  const found = {};
  let finalStep = 0;
  for (let step = 1; step <= 90; step += 1) {
    const state = await tab();
    if (state.isHeaderCta) found.cta = { step, ...state };
    if (state.inGame && state.tag === "BUTTON") found.game = { step, ...state };
    if (state.isFaq) found.faq = { step, ...state };
    if (state.inBrief && state.tag === "INPUT" && state.placeholder === "Как к вам обращаться") {
      found.briefFirstField = { step, ...state };
    }
    if (found.cta && found.game && found.briefFirstField && found.faq) {
      finalStep = step;
      break;
    }
  }

  const backwards = await tab(true);
  console.log(JSON.stringify({ stepsToFinalTarget: finalStep, found, shiftTabFromFinalTarget: backwards }, null, 2));
} finally {
  socket.close();
}
