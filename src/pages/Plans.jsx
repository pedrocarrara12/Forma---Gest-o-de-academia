import React, { useState } from "react";

import { Plus, Layers } from "lucide-react";

import { money } from "../utils/format";
import { useRecords, useSave } from "../hooks/data";

import { ErrorBox, Loading, Header } from "../components/shared";
export function Plans() {
  const query = useRecords("plans");
  const [editing, setEditing] = useState(null);
  const save = useSave("plans", () => setEditing(null));
  return (
    <>
      <Header
        title="Planos para cada ritmo."
        description="Defina as opções de matrícula da sua academia."
        action={
          <button
            className="primary"
            onClick={() => setEditing({ name: "", price: 0, months: 1 })}
          >
            <Plus size={18} />
            Novo plano
          </button>
        }
      />
      <ErrorBox error={save.error} />
      {editing && (
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const fields = Object.fromEntries(new FormData(e.currentTarget));
            save.mutate({
              id: editing.id,
              data: {
                ...fields,
                months: Number(fields.months),
                price: Number(fields.price),
              },
            });
          }}
          key={editing.id || "new"}
        >
          <h2>{editing.id ? "Editar plano" : "Novo plano"}</h2>
          <div className="form-grid">
            <label>
              Nome
              <input
                name="name"
                defaultValue={editing.name}
                required
                maxLength={120}
              />
            </label>
            <label>
              Valor total (R$)
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={editing.price}
                required
              />
            </label>
            <label>
              Duração em meses
              <input
                name="months"
                type="number"
                min="1"
                max="36"
                defaultValue={editing.months}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEditing(null)}>
              Cancelar
            </button>
            <button className="primary" disabled={save.isPending}>
              Salvar plano
            </button>
          </div>
        </form>
      )}
      <Loading query={query}>
        <div className="plans">
          {query.data?.map((p) => (
            <article className="plan" key={p.id}>
              <Layers size={28} />
              <h2>{p.name}</h2>
              <p>{p.months} mês(es) de duração</p>
              <strong>{money(p.price)}</strong>
              <small>Valor total do plano · sem cobrança online</small>
              <div className="plan-actions">
                <button onClick={() => setEditing(p)}>Editar</button>
                <button
                  className="danger"
                  disabled={save.isPending}
                  onClick={() => {
                    if (window.confirm(`Excluir o plano ${p.name}?`))
                      save.mutate({ id: p.id, remove: true });
                  }}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
        {query.data?.length === 0 && (
          <p>Nenhum plano cadastrado. Crie o primeiro plano.</p>
        )}
      </Loading>
    </>
  );
}
