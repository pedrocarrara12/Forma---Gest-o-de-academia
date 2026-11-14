import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
export async function createStore(directory) {
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, "db.json");
  let db;
  try {
    db = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    db = {
      plans: [
        { id: "monthly", name: "Essencial", months: 1, price: 129 },
        { id: "quarterly", name: "Performance", months: 3, price: 349 },
        { id: "annual", name: "Completo", months: 12, price: 1190 },
      ],
      students: [],
    };
    await writeFile(file, JSON.stringify(db, null, 2));
  }
  let queue = Promise.resolve();
  return {
    read: () => structuredClone(db),
    update(action) {
      const result = queue.then(async () => {
        const next = structuredClone(db),
          response = action(next);
        if (response.status >= 400) return response;
        await writeFile(`${file}.tmp`, JSON.stringify(next, null, 2));
        await rename(`${file}.tmp`, file);
        db = next;
        return response;
      });
      queue = result.catch(() => {});
      return result;
    },
  };
}
