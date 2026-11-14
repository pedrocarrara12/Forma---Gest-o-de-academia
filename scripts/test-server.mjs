import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "vite";
import { createApp } from "../server/app.js";
const directory = await mkdtemp(path.join(tmpdir(), "forma-e2e-"));
const api = await createApp({ directory, origins: ["http://127.0.0.1:5175"] });
await new Promise((resolve) => api.listen(3003, "127.0.0.1", resolve));
const vite = await createServer({
  configFile: false,
  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:3003" },
  },
});
await vite.listen();
console.log("Ambiente de teste isolado pronto.");
