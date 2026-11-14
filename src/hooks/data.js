import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../api";
import { useNotice } from "../context/Notice";
export function useRecords(kind) {
  return useQuery({
    queryKey: [kind],
    queryFn: ({ signal }) => request(`/api/${kind}`, { signal }),
  });
}
export function useSave(kind, onSuccess) {
  const client = useQueryClient(),
    notify = useNotice(),
    locked = useRef(false);
  const mutation = useMutation({
    mutationFn: ({ id, data, remove }) =>
      request(`/api/${kind}${id ? `/${id}` : ""}`, {
        method: remove ? "DELETE" : id ? "PUT" : "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: [kind] });
      notify(
        `${kind === "students" ? "Aluno" : "Plano"} ${variables.remove ? "excluído" : variables.id ? "atualizado" : "cadastrado"} com sucesso.`,
      );
      onSuccess?.();
    },
    onSettled: () => {
      locked.current = false;
    },
  });
  return {
    ...mutation,
    mutate: (...args) => {
      if (locked.current) return;
      locked.current = true;
      mutation.mutate(...args);
    },
  };
}
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  return {
    values,
    setValues,
    field: (name) => ({
      name,
      value: values[name] ?? "",
      onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
    }),
  };
}
