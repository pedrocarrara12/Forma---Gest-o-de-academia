import { randomUUID } from "node:crypto";
import { validate } from "./model.js";
export function changeRecord(db, kind, id, method, value) {
  if (method !== "POST" && !db[kind].some((item) => item.id === id))
    return { status: 404, message: "Registro não encontrado." };
  if (method === "DELETE") {
    if (
      kind === "plans" &&
      db.students.some((student) => student.planId === id)
    )
      return {
        status: 409,
        message:
          "Este plano possui alunos vinculados. Altere suas matrículas antes de excluir.",
      };
    db[kind] = db[kind].filter((item) => item.id !== id);
  } else {
    const error = validate(kind, value, db, id);
    if (error) return { status: 422, message: error };
    const fields =
      kind === "plans"
        ? ["name", "months", "price"]
        : [
            "name",
            "email",
            "phone",
            "birth",
            "cep",
            "address",
            "planId",
            "start",
            "end",
            "cancelled",
          ];
    const record = Object.fromEntries(
      fields.filter((key) => key in value).map((key) => [key, value[key]]),
    );
    record.name = record.name.trim();
    if (kind === "students") record.email = record.email.trim().toLowerCase();
    record.id = method === "POST" ? randomUUID() : id;
    db[kind] =
      method === "POST"
        ? [...db[kind], record]
        : db[kind].map((item) => (item.id === id ? record : item));
  }
  return { status: 200, message: "Operação realizada." };
}
