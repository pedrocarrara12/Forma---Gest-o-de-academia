import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Plus, Search } from "lucide-react";

import { statusOf } from "../../server/model";

import { useRecords } from "../hooks/data";

import { Loading, Header, Table } from "../components/shared";
export function Students() {
  const students = useRecords("students"),
    plans = useRecords("plans");
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("Todos");
  const filtered = (students.data || []).filter(
    (s) =>
      `${s.name} ${s.email}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) &&
      (status === "Todos" || statusOf(s) === status),
  );
  return (
    <>
      <Header
        title="Alunos e matrículas"
        description="Cada aluno, cada etapa. Tudo organizado."
        action={
          <Link className="button primary" to="/alunos/novo">
            <Plus size={18} />
            Novo aluno
          </Link>
        }
      />
      <section className="panel">
        <div className="filters">
          <label className="search">
            <Search size={18} />
            <input
              aria-label="Buscar por nome ou e-mail"
              placeholder="Buscar por nome ou e-mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="Filtrar por situação"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["Todos", "Ativo", "Vencido", "Cancelado", "Agendado"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <span>{filtered.length} alunos</span>
        </div>
        <Loading query={students}>
          <Loading query={plans}>
            <Table students={filtered} plans={plans.data || []} />
          </Loading>
        </Loading>
      </section>
    </>
  );
}
