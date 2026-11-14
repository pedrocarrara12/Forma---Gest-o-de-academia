import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createApp } from "./app.js";
import { createAuth } from "./auth.js";
import { createStore } from "./store.js";
test("API: sessão, origem, CRUD, duplicidade, vínculo, persistência e logout", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "forma-api-"));
  let time = 1000;
  const app = await createApp({ directory, now: () => time });
  await new Promise((r) => app.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${app.address().port}`;
  let cookie = "";
  const call = (
    route,
    method = "GET",
    data,
    origin = "http://127.0.0.1:5173",
  ) =>
    fetch(base + "/api/" + route, {
      method,
      headers: {
        Origin: origin,
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  try {
    assert.equal((await call("students")).status, 401);
    assert.equal(
      (
        await call("auth/login", "POST", {
          email: "gestor@forma.local",
          password: "bad",
        })
      ).status,
      401,
    );
    assert.equal(
      (await call("auth/login", "POST", {}, "http://evil.local")).status,
      403,
    );
    const login = await call("auth/login", "POST", {
      email: "gestor@forma.local",
      password: "forma123",
    });
    assert.equal(login.status, 200);
    cookie = login.headers.get("set-cookie").split(";")[0];
    assert.match(login.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
    assert.equal((await call("auth/session")).status, 200);
    const plan = { name: "Plano teste", months: 1, price: 99 };
    assert.equal((await call("plans", "POST", plan)).status, 200);
    const plans = await (await call("plans")).json();
    const id = plans.find((p) => p.name === plan.name).id;
    assert.equal(
      (await call(`plans/${id}`, "PUT", { ...plan, price: 100 })).status,
      200,
    );
    const student = {
      name: "Aluno fictício",
      email: "teste@example.com",
      phone: "65999999999",
      planId: id,
      start: "2026-11-01",
      end: "2026-12-01",
    };
    assert.equal((await call("students", "POST", student)).status, 200);
    assert.equal((await call("students", "POST", student)).status, 422);
    assert.equal(
      (
        await call("students", "POST", {
          ...student,
          email: "other@example.com",
          end: "2025-01-01",
        })
      ).status,
      422,
    );
    const students = await (await call("students")).json();
    const sid = students[0].id;
    assert.equal((await call(`students/${sid}`)).status, 200);
    assert.equal((await call(`plans/${id}`, "DELETE")).status, 409);
    assert.equal(
      (await call(`students/${sid}`, "PUT", { ...student, name: "Editado" }))
        .status,
      200,
    );
    const persisted = await createStore(directory);
    assert.equal(persisted.read().students[0].name, "Editado");
    assert.equal((await call(`students/${sid}`, "DELETE")).status, 200);
    assert.equal((await call(`plans/${id}`, "DELETE")).status, 200);
    time += 8 * 60 * 60 * 1000;
    assert.equal((await call("plans")).status, 401);
    const again = await call("auth/login", "POST", {
      email: "gestor@forma.local",
      password: "forma123",
    });
    cookie = again.headers.get("set-cookie").split(";")[0];
    assert.equal((await call("auth/logout", "POST", {})).status, 200);
    assert.equal((await call("students")).status, 401);
    const account = JSON.parse(
      await readFile(path.join(directory, "auth.json")),
    );
    assert.ok(account.hash && account.salt);
    assert.ok(!JSON.stringify(account).includes("forma123"));
  } finally {
    app.closeAllConnections();
    await new Promise((r) => app.close(r));
  }
});
test("autenticação limita cinco erros e reinício não restaura sessões", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "forma-auth-"));
  let time = 1000;
  const auth = await createAuth(dir, { now: () => time });
  for (let i = 0; i < 5; i++)
    assert.equal(auth.login("gestor@forma.local", "wrong", "ip").status, 401);
  assert.equal(auth.login("gestor@forma.local", "forma123", "ip").status, 429);
  time += 15 * 60 * 1000;
  const result = auth.login("gestor@forma.local", "forma123", "ip");
  assert.equal(result.status, 200);
  const restarted = await createAuth(dir);
  assert.equal(restarted.session({ headers: { cookie: result.cookie } }), null);
});
