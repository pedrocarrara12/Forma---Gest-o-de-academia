import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/Auth";
import { NoticeProvider } from "./context/Notice";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Students } from "./pages/Students";
import { StudentEditor } from "./pages/StudentEditor";
import { StudentDetail } from "./pages/StudentDetail";
import { Plans } from "./pages/Plans";
import { Shell } from "./pages/Shell";
import { NotFound } from "./components/shared";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "./style.css";
import "./responsive.css";
const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => error.status !== 401 && count < 1,
      staleTime: 30000,
    },
  },
});
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <NoticeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<Shell />}>
                <Route index element={<Dashboard />} />
                <Route path="alunos" element={<Students />} />
                <Route path="alunos/novo" element={<StudentEditor />} />
                <Route path="alunos/:id" element={<StudentDetail />} />
                <Route path="alunos/:id/editar" element={<StudentEditor />} />
                <Route path="planos" element={<Plans />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NoticeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
