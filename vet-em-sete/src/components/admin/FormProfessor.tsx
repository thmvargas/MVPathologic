"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adicionarProfessor, type Resposta } from "@/app/admin/acoes";

export default function FormProfessor() {
  const [email, setEmail] = useState("");
  const [r, setR] = useState<Resposta | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const res = await adicionarProfessor(email);
          setR(res);
          if (res.ok) {
            setEmail("");
            router.refresh();
          }
        });
      }}
    >
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colega@unifeob.pro.br" className="min-h-11 flex-1 rounded-md border border-texto/40 bg-fundo px-3 text-sm" />
      <button disabled={pendente} className="min-h-11 rounded-md bg-marca px-4 text-sm font-medium text-fundo disabled:opacity-40">Convidar</button>
      {r && <p role={r.ok ? "status" : "alert"} className={`text-sm ${r.ok ? "text-sucesso-escuro" : "text-destaque-escuro"}`}>{r.mensagem}</p>}
    </form>
  );
}
