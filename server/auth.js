import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function createAuth(directory, { now = Date.now } = {}) {
  const file = path.join(directory, "auth.json");
  let account;
  try {
    account = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const salt = randomBytes(16).toString("hex");
    account = {
      email: "gestor@forma.local",
      salt,
      hash: scryptSync("forma123", salt, 64).toString("hex"),
    };
    await writeFile(file, JSON.stringify(account, null, 2));
  }
  const sessions = new Map(),
    attempts = new Map();
  const duration = 8 * 60 * 60 * 1000;
  const user = { name: "Gestor", email: account.email };
  const tokenFrom = (req) =>
    (req.headers.cookie || "")
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("forma_session="))
      ?.slice(14);
  const cookie = (token) =>
    `forma_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${token ? duration / 1000 : 0}`;
  return {
    session(req) {
      const token = tokenFrom(req),
        expiry = sessions.get(token);
      if (!expiry || expiry <= now()) {
        sessions.delete(token);
        return null;
      }
      return user;
    },
    login(email, password, address) {
      for (const [key, value] of attempts)
        if (value.until <= now()) attempts.delete(key);
      for (const [key, expiry] of sessions)
        if (expiry <= now()) sessions.delete(key);
      const attempt = attempts.get(address) || {
        count: 0,
        until: now() + 15 * 60 * 1000,
      };
      if (attempt.count >= 5)
        return {
          status: 429,
          message:
            "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
        };
      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        password.length > 256 ||
        email.trim().toLowerCase() !== account.email ||
        !timingSafeEqual(
          scryptSync(password, account.salt, 64),
          Buffer.from(account.hash, "hex"),
        )
      ) {
        attempt.count++;
        attempts.set(address, attempt);
        return { status: 401, message: "E-mail ou senha incorretos." };
      }
      attempts.delete(address);
      const token = randomBytes(32).toString("hex");
      sessions.set(token, now() + duration);
      return { status: 200, user, cookie: cookie(token) };
    },
    logout(req) {
      sessions.delete(tokenFrom(req));
      return cookie("");
    },
  };
}
