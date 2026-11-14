import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
const directory =
  process.env.DATA_DIR || fileURLToPath(new URL("../data/", import.meta.url));
const origins = (
  process.env.APP_ORIGINS || "http://127.0.0.1:5173,http://localhost:5173"
).split(",");
const app = await createApp({ directory, origins });
app.listen(process.env.PORT || 3001, "127.0.0.1", () =>
  console.log("API Forma iniciada."),
);
