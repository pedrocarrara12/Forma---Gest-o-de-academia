export async function request(url, { timeoutMs = 8000, ...options } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  let timer;
  try {
    const response = await Promise.race([
      fetch(url, {
        credentials: "same-origin",
        ...options,
        signal: controller.signal,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
      }).then(async (response) => ({ response, body: await response.json() })),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("A requisição demorou demais. Tente novamente."));
          controller.abort();
        }, timeoutMs);
      }),
    ]);
    const { body, response: result } = response;
    if (!result.ok) {
      if (
        result.status === 401 &&
        url.startsWith("/api/") &&
        !url.endsWith("/login") &&
        typeof window !== "undefined"
      )
        window.dispatchEvent(new Event("forma:unauthorized"));
      throw Object.assign(
        new Error(body.message || "Falha na requisição. Tente novamente."),
        { status: result.status },
      );
    }
    return body;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}
