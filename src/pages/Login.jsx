import React, { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { Activity, ArrowUpRight } from "lucide-react";
import { Auth } from "../context/Auth";
export function Login() {
  const { user, login, pending } = useContext(Auth);
  const [error, setError] = useState("");
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="login">
      <section className="login-story">
        <div className="brand">
          <Activity /> forma<span> / gestão</span>
        </div>
        <h1>
          Mais movimento.
          <br />
          Menos burocracia.
        </h1>
        <p>
          Alunos, planos e matrículas no mesmo lugar. Abra espaço para o que
          importa na sua academia.
        </p>
        <div className="login-bottom">
          Desenvolvimento de Aplicações Interativas com React
          <br />
          Projeto acadêmico · Pedro Carrara de Figueiredo
        </div>
      </section>
      <section className="login-form">
        <h2>Bom ter você aqui.</h2>
        <p>Acesse o painel da sua academia.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (pending) return;
            const data = new FormData(e.currentTarget);
            setError("");
            try {
              await login(data.get("email"), data.get("password"));
            } catch (error) {
              setError(error.message);
            }
          }}
        >
          <label>
            E-mail
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button disabled={pending} className="primary">
            {pending ? "Entrando…" : "Entrar no painel"}{" "}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <aside className="demo">
          Acesso de demonstração
          <br />
          <strong>gestor@forma.local</strong> · senha <strong>forma123</strong>
          <p>Sessão validada no servidor. Use somente dados fictícios.</p>
        </aside>
      </section>
    </div>
  );
}
