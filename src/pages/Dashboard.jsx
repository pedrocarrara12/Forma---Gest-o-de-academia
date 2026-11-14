import React from "react";
import { Link } from "react-router-dom";

import { Activity, ArrowUpRight, Plus } from "lucide-react";

import { statusOf } from "../../server/model";

import { useRecords } from "../hooks/data";

import { Loading, Header, Table } from "../components/shared";
export function Dashboard() {
  const students = useRecords("students"),
    plans = useRecords("plans");
  const data = students.data || [];
  const active = data.filter((s) => statusOf(s) === "Ativo");
  return (
    <>
      <Header
        title="Uma boa gestão começa aqui."
        description="Acompanhe sua academia e cuide de cada matrícula."
        action={
          <Link className="button primary" to="/alunos/novo">
            <Plus size={18} />
            Novo aluno
          </Link>
        }
      />
      <Loading query={students}>
        <Loading query={plans}>
          <section className="overview">
            <div>
              <span>Alunos cadastrados</span>
              <strong>{data.length.toString().padStart(2, "0")}</strong>
            </div>
            <div>
              <span>Matrículas ativas</span>
              <strong>{active.length.toString().padStart(2, "0")}</strong>
            </div>
            <div>
              <span>Matrículas vencidas</span>
              <strong>
                {data
                  .filter((s) => statusOf(s) === "Vencido")
                  .length.toString()
                  .padStart(2, "0")}
              </strong>
            </div>
          </section>
          <section className="welcome">
            <div>
              <h2>Organização que acompanha seu ritmo.</h2>
              <p>
                Consulte os alunos, atualize os planos e mantenha as matrículas
                em movimento.
              </p>
              <Link to="/alunos">
                Gerenciar alunos <ArrowUpRight size={18} />
              </Link>
            </div>
            <Activity size={110} strokeWidth={1} />
          </section>
          <section className="panel">
            <div className="section-heading">
              <h2>Alunos recentes</h2>
              <Link to="/alunos">Ver todos</Link>
            </div>
            <Table
              students={data.slice(-5).reverse()}
              plans={plans.data || []}
            />
          </section>
        </Loading>
      </Loading>
    </>
  );
}
