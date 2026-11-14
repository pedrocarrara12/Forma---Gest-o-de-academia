import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { date } from "../utils/format";
import { useRecords, useSave } from "../hooks/data";

import {
  ErrorBox,
  Loading,
  Badge,
  Header,
  NotFound,
} from "../components/shared";
export function StudentDetail() {
  const { id } = useParams();
  const students = useRecords("students"),
    plans = useRecords("plans");
  const navigate = useNavigate();
  const mutation = useSave("students", () => navigate("/alunos"));
  const s = students.data?.find((s) => s.id === id);
  return (
    <Loading query={students}>
      {s ? (
        <>
          <Link className="back" to="/alunos">
            Voltar para alunos
          </Link>
          <Header
            title={s.name}
            description="Perfil do aluno e matrícula atual."
            action={
              <Link className="button primary" to={`/alunos/${id}/editar`}>
                Editar aluno
              </Link>
            }
          />
          <section className="panel detail">
            <Badge student={s} />
            <dl>
              {[
                ["E-mail", s.email],
                ["Telefone", s.phone],
                ["Nascimento", date(s.birth)],
                ["Endereço", s.address || "Não informado"],
                [
                  "Plano",
                  plans.data?.find((p) => p.id === s.planId)?.name || "—",
                ],
                ["Início", date(s.start)],
                ["Vencimento", date(s.end)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <ErrorBox error={mutation.error} />
            <button
              className="danger"
              disabled={mutation.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    `Excluir ${s.name} e sua matrícula definitivamente?`,
                  )
                )
                  mutation.mutate({ id, remove: true });
              }}
            >
              Excluir aluno
            </button>
          </section>
        </>
      ) : (
        <NotFound />
      )}
    </Loading>
  );
}
