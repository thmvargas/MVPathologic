"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Resposta } from "@/app/admin/acoes";

/** Botão que chama uma ação do servidor e mostra a mensagem de retorno. */
export function BotaoAcao({
  acao,
  rotulo,
  confirmar,
  variante = "contorno",
  ir,
}: {
  acao: () => Promise<Resposta>;
  rotulo: string;
  confirmar?: string;
  variante?: "cheio" | "contorno" | "perigo";
  ir?: string;
}) {
  const [msg, setMsg] = useState<Resposta | null>(null);
  const [pendente, iniciar] = useTransition();
  const router = useRouter();
  const estilo = {
    cheio: "bg-vinho text-areia",
    contorno: "border border-vinho text-vinho",
    perigo: "border border-carmim text-carmim",
  }[variante];
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={pendente}
        onClick={() => {
          if (confirmar && !window.confirm(confirmar)) return;
          iniciar(async () => {
            const r = await acao();
            setMsg(r);
            if (r.ok) {
              if (ir) router.push(ir);
              else router.refresh();
            }
          });
        }}
        className={`inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-medium disabled:opacity-40 ${estilo}`}
      >
        {pendente ? "Aguarde..." : rotulo}
      </button>
      {msg && (
        <span role={msg.ok ? "status" : "alert"} className={`text-xs ${msg.ok ? "text-esmeralda" : "text-carmim"}`}>
          {msg.mensagem}
        </span>
      )}
    </span>
  );
}
