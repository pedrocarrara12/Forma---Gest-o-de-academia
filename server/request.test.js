import { test } from "node:test";
import assert from "node:assert/strict";
import { request } from "../src/api.js";
test("serviço trata erro HTTP, timeout e cancelamento", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: "Falha controlada" }), {
        status: 503,
      });
    await assert.rejects(request("/api/test"), /Falha controlada/);
    let signal;
    globalThis.fetch = (_, options) => {
      signal = options.signal;
      return new Promise((resolve, reject) => {
        if (signal.aborted) reject(new DOMException("Cancelado", "AbortError"));
        else
          signal.addEventListener("abort", () =>
            reject(new DOMException("Cancelado", "AbortError")),
          );
      });
    };
    await assert.rejects(request("/api/test", { timeoutMs: 10 }), /demorou/);
    assert.ok(signal.aborted);
    const controller = new AbortController();
    const pending = request("/api/test", { signal: controller.signal });
    controller.abort();
    await assert.rejects(pending, { name: "AbortError" });
  } finally {
    globalThis.fetch = original;
  }
});
