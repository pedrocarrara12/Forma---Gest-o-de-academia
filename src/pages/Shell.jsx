import React, { useContext } from "react";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom";

import { Activity, Users, LayoutDashboard, LogOut, Layers } from "lucide-react";

import { Auth } from "../context/Auth";
import { ErrorBox } from "../components/shared";
export function Shell() {
  const { user, logout, pending, error } = useContext(Auth);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <Activity /> forma<span>.</span>
        </Link>
        <p className="sidebar-label">Sua academia, em dia.</p>
        <nav>
          <NavLink to="/" end>
            <LayoutDashboard size={19} />
            Visão geral
          </NavLink>
          <NavLink to="/alunos">
            <Users size={19} />
            Alunos e matrículas
          </NavLink>
          <NavLink to="/planos">
            <Layers size={19} />
            Planos
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <span className="avatar">G</span>
          <div>
            <strong>Gestor</strong>
            <small>Ambiente acadêmico</small>
          </div>
          <button
            className="icon-button"
            aria-label="Sair"
            disabled={pending}
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main>
        <div className="topbar">
          <span>Forma / Gestão da academia</span>
          <span>
            {new Date().toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <ErrorBox error={error} />
        <Outlet />
        <footer>Forma · Projeto acadêmico · Dados locais</footer>
      </main>
    </div>
  );
}
