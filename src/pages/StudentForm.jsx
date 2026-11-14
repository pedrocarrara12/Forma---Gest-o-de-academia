import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { request } from "../api";

import { money, date, today } from "../utils/format";
import { useSave, useForm } from "../hooks/data";

import { ErrorBox, Header } from "../components/shared";
export function StudentForm({ initial, plans }) {
  const navigate = useNavigate();
  const { values, setValues, field } = useForm(
    initial || {
      name: "",
      email: "",
      phone: "",
      birth: "",
      cep: "",
      address: "",
      planId: plans[0]?.id || "",
      start: today(),
      end: today(),
      cancelled: false,
    },
  );
  const save = useSave("students", () => navigate("/alunos"));
  const [cep, setCep] = useState("");
  const lookup = useQuery({
    queryKey: ["cep", cep],
    queryFn: ({ signal }) =>
      request(`https://viacep.com.br/ws/${cep}/json/`, { signal }),
    enabled: cep.length === 8,
    retry: 1,
    staleTime: 86400000,
  });
  useEffect(() => {
    if (
      lookup.data &&
      !lookup.data.erro &&
      values.cep.replace(/\D/g, "") === cep
    )
      setValues((v) => ({
        ...v,
        address: [
          lookup.data.logradouro,
          lookup.data.bairro,
          lookup.data.localidade,
          lookup.data.uf,
        ]
          .filter(Boolean)
          .join(", "),
      }));
  }, [lookup.data, cep, values.cep]);
  const setDuration = (planId, start) => {
    setValues((v) => ({ ...v, planId, start }));
    const plan = plans.find((p) => p.id === planId);
    if (!plan || !start) return;
    const d = new Date(`${start}T12:00:00`);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + Number(plan.months));
    d.setDate(
      Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()),
    );
    setValues((v) => ({
      ...v,
      planId,
      start,
      end: d.toLocaleDateString("en-CA"),
    }));
  };
  useEffect(() => {
    if (!initial) setDuration(values.planId, values.start);
  }, []);
  return (
    <>
      <Link className="back" to="/alunos">
        Voltar para alunos
      </Link>
      <Header
        title={initial ? "Editar aluno" : "Um novo começo."}
        description="Preencha os dados e configure a matrícula do aluno."
      />
      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ id: initial?.id, data: values });
        }}
      >
        <h2>Dados pessoais</h2>
        <div className="form-grid">
          <label>
            Nome completo
            <input {...field("name")} required maxLength={120} />
          </label>
          <label>
            E-mail
            <input {...field("email")} type="email" required />
          </label>
          <label>
            Telefone com DDD
            <input {...field("phone")} type="tel" required />
          </label>
          <label>
            Data de nascimento (opcional)
            <input {...field("birth")} type="date" max={today()} />
          </label>
          <label>
            CEP (opcional)
            <div className="inline">
              <input
                {...field("cep")}
                aria-label="CEP (opcional)"
                maxLength={9}
                inputMode="numeric"
              />
              <button
                type="button"
                disabled={
                  values.cep.replace(/\D/g, "").length !== 8 ||
                  lookup.isFetching
                }
                onClick={() => {
                  const next = values.cep.replace(/\D/g, "");
                  if (next === cep) lookup.refetch();
                  else setCep(next);
                }}
              >
                {lookup.isFetching ? "Buscando…" : "Consultar"}
              </button>
            </div>
          </label>
          <label>
            Endereço (opcional)
            <input {...field("address")} />
          </label>
        </div>
        <ErrorBox error={lookup.error} />
        {lookup.data?.erro && (
          <p role="alert">
            CEP não encontrado. Preencha o endereço manualmente.
          </p>
        )}
        <h2>Matrícula</h2>
        <div className="form-grid">
          <label>
            Plano
            <select
              required
              value={values.planId}
              onChange={(e) => setDuration(e.target.value, values.start)}
            >
              {plans.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name} · {money(p.price)} / {p.months} mês(es)
                </option>
              ))}
            </select>
          </label>
          <label>
            Início
            <input
              type="date"
              required
              value={values.start}
              onChange={(e) => setDuration(values.planId, e.target.value)}
            />
          </label>
          <label>
            Vencimento
            <input type="date" required min={values.start} {...field("end")} />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={values.cancelled}
              onChange={(e) =>
                setValues((v) => ({ ...v, cancelled: e.target.checked }))
              }
            />
            Matrícula cancelada
          </label>
        </div>
        {!plans.length && <p>Cadastre um plano antes de adicionar alunos.</p>}
        <ErrorBox error={save.error} />
        <div className="form-actions">
          <Link to="/alunos" className="button">
            Cancelar
          </Link>
          <button
            className="primary"
            disabled={save.isPending || !plans.length}
          >
            {save.isPending ? "Salvando…" : "Salvar aluno"}
          </button>
        </div>
      </form>
    </>
  );
}
