import React from "react";
import { useParams } from "react-router-dom";

import { useRecords } from "../hooks/data";

import { Loading, NotFound } from "../components/shared";
import { StudentForm } from "./StudentForm";
export function StudentEditor() {
  const { id } = useParams();
  const students = useRecords("students"),
    plans = useRecords("plans");
  return (
    <Loading query={students}>
      <Loading query={plans}>
        {id && !students.data?.some((s) => s.id === id) ? (
          <NotFound />
        ) : (
          <StudentForm
            key={id || "new"}
            initial={students.data?.find((s) => s.id === id)}
            plans={plans.data || []}
          />
        )}
      </Loading>
    </Loading>
  );
}
