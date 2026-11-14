import http from "node:http";
import { createAuth } from "./auth.js";
import { createStore } from "./store.js";
import { changeRecord } from "./routes.js";
async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > 50000)
      throw Object.assign(new Error("Dados excedem o limite."), {
        status: 413,
      });
  }
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error();
    return value;
  } catch {
    throw Object.assign(new Error("JSON inválido."), { status: 400 });
  }
}
export async function createApp({
  directory,
  origins = ["http://127.0.0.1:5173", "http://localhost:5173"],
  now,
} = {}) {
  const store = await createStore(directory),
    auth = await createAuth(directory, { now });
  return http.createServer(async (req, res) => {
    const send = (status, body, headers = {}) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...headers,
      });
      res.end(JSON.stringify(body));
    };
    try {
      const pathname = new URL(req.url, "http://localhost").pathname;
      if (
        ["POST", "PUT", "DELETE"].includes(req.method) &&
        !origins.includes(req.headers.origin)
      )
        return send(403, { message: "Origem da requisição não autorizada." });
      if (pathname === "/api/auth/login" && req.method === "POST") {
        const { email, password } = await readBody(req);
        const result = auth.login(email, password, req.socket.remoteAddress);
        if (result.cookie) auth.logout(req);
        return send(
          result.status,
          result.user ? { user: result.user } : { message: result.message },
          result.cookie ? { "Set-Cookie": result.cookie } : {},
        );
      }
      if (pathname === "/api/auth/logout" && req.method === "POST")
        return send(
          200,
          { message: "Sessão encerrada." },
          { "Set-Cookie": auth.logout(req) },
        );
      const user = auth.session(req);
      if (!user)
        return send(401, { message: "Sua sessão terminou. Entre novamente." });
      if (pathname === "/api/auth/session" && req.method === "GET")
        return send(200, { user });
      const match = pathname.match(/^\/api\/(students|plans)(?:\/([^/]+))?$/);
      if (!match) return send(404, { message: "Rota não encontrada." });
      const [, kind, id] = match;
      if (req.method === "GET") {
        const db = store.read(),
          item = id ? db[kind].find((record) => record.id === id) : db[kind];
        return send(
          item ? 200 : 404,
          item || { message: "Registro não encontrado." },
        );
      }
      if (
        !["POST", "PUT", "DELETE"].includes(req.method) ||
        (req.method === "POST" ? !!id : !id)
      )
        return send(405, { message: "Método não permitido nesta rota." });
      const value = req.method === "DELETE" ? null : await readBody(req);
      const result = await store.update((db) =>
        changeRecord(db, kind, id, req.method, value),
      );
      send(result.status, { message: result.message });
    } catch (error) {
      if (!res.headersSent)
        send(error.status || 500, {
          message: error.status
            ? error.message
            : "Não foi possível concluir. Tente novamente.",
        });
    }
  });
}
