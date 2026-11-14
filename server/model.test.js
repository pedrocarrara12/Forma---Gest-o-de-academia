import { test } from "node:test";
import assert from "node:assert/strict";
import { validate, statusOf } from "./model.js";
const db = { plans: [{ id: "p" }], students: [] };
const student = {
  name: "Teste",
  email: "teste@example.com",
  phone: "65999999999",
  planId: "p",
  start: "2026-11-01",
  end: "2026-12-01",
};
test("aceita aluno válido e rejeita plano inexistente", () => {
  assert.equal(validate("students", student, db), null);
  assert.match(validate("students", { ...student, planId: "x" }, db), /plano/);
});
test("rejeita e-mail duplicado, datas impossíveis e vencimento anterior", () => {
  assert.match(
    validate("students", student, {
      ...db,
      students: [{ ...student, id: "a" }],
    }),
    /cadastrado/,
  );
  assert.match(
    validate("students", { ...student, start: "2026-02-30" }, db),
    /datas/,
  );
  assert.match(
    validate("students", { ...student, end: "2026-01-01" }, db),
    /datas/,
  );
});
test("permite editar o próprio e-mail", () =>
  assert.equal(
    validate(
      "students",
      student,
      { ...db, students: [{ ...student, id: "a" }] },
      "a",
    ),
    null,
  ));
test("status considera cancelamento, vencimento e início futuro", () => {
  assert.equal(statusOf(student, "2026-11-02"), "Ativo");
  assert.equal(statusOf(student, "2027-01-01"), "Vencido");
  assert.equal(statusOf(student, "2026-10-01"), "Agendado");
  assert.equal(statusOf({ ...student, cancelled: true }), "Cancelado");
});
test("rejeita preço negativo e duração fracionária", () => {
  assert.match(
    validate("plans", { name: "A", months: 1, price: -1 }, db),
    /preço/,
  );
  assert.match(
    validate("plans", { name: "A", months: 1.5, price: 100 }, db),
    /duração/,
  );
});
