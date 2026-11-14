import React, { createContext, useContext, useState } from "react";
const Notice = createContext(null);
export const useNotice = () => useContext(Notice);
export function NoticeProvider({ children }) {
  const [message, setMessage] = useState("");
  return (
    <Notice.Provider value={setMessage}>
      {message && (
        <div className="notice">
          <span role="status">{message}</span>
          <button aria-label="Fechar aviso" onClick={() => setMessage("")}>
            Fechar
          </button>
        </div>
      )}
      {children}
    </Notice.Provider>
  );
}
