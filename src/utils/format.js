export const money = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const date = (v) =>
  v ? new Date(`${v}T12:00:00`).toLocaleDateString("pt-BR") : "—";
export const today = () => new Date().toLocaleDateString("en-CA");
