export const statusOf = (
  student,
  today = new Date().toLocaleDateString("en-CA"),
) =>
  student.cancelled
    ? "Cancelado"
    : student.end < today
      ? "Vencido"
      : student.start > today
        ? "Agendado"
        : "Ativo";
export const validate = (kind, value, db, id) => {
  if (!value || typeof value.name !== "string")
    return "Informe um nome válido.";
  if (
    kind === "students" &&
    (typeof value.email !== "string" || typeof value.phone !== "string")
  )
    return "Informe e-mail e telefone válidos.";
  if (
    kind === "students" &&
    ["birth", "cep", "address", "start", "end"].some(
      (key) => value[key] !== undefined && typeof value[key] !== "string",
    )
  )
    return "Campos de texto inválidos.";
  if (
    kind === "students" &&
    value.cancelled !== undefined &&
    typeof value.cancelled !== "boolean"
  )
    return "Situação da matrícula inválida.";
  if (
    kind === "plans" &&
    (typeof value.price !== "number" || typeof value.months !== "number")
  )
    return "Informe preço e duração numéricos.";
  if (!value.name?.trim() || value.name.length > 120)
    return "Informe um nome de até 120 caracteres.";
  if (kind === "plans") {
    if (
      !Number.isInteger(Number(value.months)) ||
      value.months < 1 ||
      value.months > 36
    )
      return "A duração deve ser de 1 a 36 meses.";
    if (!Number.isFinite(Number(value.price)) || value.price < 0)
      return "Informe um preço válido.";
  } else {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email || ""))
      return "Informe um e-mail válido.";
    if (
      db.students.some(
        (s) =>
          s.id !== id && s.email.toLowerCase() === value.email.toLowerCase(),
      )
    )
      return "Este e-mail já está cadastrado.";
    if (!/^\d{10,11}$/.test((value.phone || "").replace(/\D/g, "")))
      return "Informe telefone com DDD.";
    if (!db.plans.some((p) => p.id === value.planId))
      return "Selecione um plano existente.";
    const validDate = (v) =>
      /^\d{4}-\d{2}-\d{2}$/.test(v || "") &&
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v;
    if (
      !validDate(value.start) ||
      !validDate(value.end) ||
      value.end < value.start
    )
      return "Informe datas válidas; vencimento deve ser igual ou posterior ao início.";
    if (
      value.birth &&
      (!validDate(value.birth) ||
        value.birth > new Date().toISOString().slice(0, 10))
    )
      return "Informe uma data de nascimento válida.";
  }
  return null;
};
