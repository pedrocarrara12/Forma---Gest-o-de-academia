import React from "react";
import { Link } from "react-router-dom";

import { Users, ArrowUpRight } from "lucide-react";

import { statusOf } from "../../server/model";
import { date } from "../utils/format";

export function ErrorBox({ error }) {
  return error ? (
    <p className="error" role="alert">
      {error.message || error}
    </p>
  ) : null;
}
export function Loading({ query, children }) {
  if (query.isPending) return <p role="status">Carregando registros…</p>;
  if (query.isError)
    return (
      <>
        <ErrorBox error={query.error} />
        <button onClick={() => query.refetch()}>Tentar novamente</button>
      </>
    );
  return children;
}
export function Badge({ student }) {
  const status = statusOf(student);
  return <span className={`badge ${status.toLowerCase()}`}>{status}</span>;
}
export function Header({ title, description, action }) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
export function Table({ students, plans }) {
  return students.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Plano</th>
            <th>Vencimento</th>
            <th>Situação</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>
                <Link className="student-name" to={`/alunos/${s.id}`}>
                  <span className="avatar">{s.name.slice(0, 1)}</span>
                  <span>
                    <strong>{s.name}</strong>
                    <small>{s.email}</small>
                  </span>
                </Link>
              </td>
              <td>{plans.find((p) => p.id === s.planId)?.name || "—"}</td>
              <td>{date(s.end)}</td>
              <td>
                <Badge student={s} />
              </td>
              <td>
                <Link aria-label={`Ver ${s.name}`} to={`/alunos/${s.id}`}>
                  <ArrowUpRight size={20} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="empty">
      <Users size={32} />
      <h3>Nenhum aluno por aqui</h3>
      <p>Cadastre um aluno para começar ou ajuste os filtros.</p>
      <Link to="/alunos/novo" className="button">
        Cadastrar aluno
      </Link>
    </div>
  );
}
export function NotFound() {
  return (
    <section className="empty">
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar ao início</Link>
    </section>
  );
}
