"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Visao } from "@/lib/jogo/motor";

const ROTULO = {
  adequado: "Adequado",
  aceitavel: "Aceitável",
  desnecessario: "Desnecessário",
  contraindicado: "Contraindicado",
} as const;

const ESTILO = {
  adequado: "bg-sucesso text-texto",
  aceitavel: "bg-sucesso-claro text-sucesso-escuro border border-sucesso-borda",
  desnecessario: "bg-superficie text-texto border border-linha",
  contraindicado: "bg-destaque-claro text-destaque-escuro border border-destaque",
} as const;

export function EscolhaTratamento({
  opcoes,
  valeponto,
  ocupado,
  onConfirmar,
}: {
  opcoes: NonNullable<Visao["tratamentosOpcoes"]>;
  valeponto: boolean;
  ocupado: boolean;
  onConfirmar: (ids: string[]) => void;
}) {
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const alternar = (id: string) =>
    setMarcadas((m) => {
      const n = new Set(m);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfirmar([...marcadas]);
      }}
      className="space-y-3"
    >
      <fieldset>
        <legend className="mb-2 text-sm">
          Marque as condutas que você adotaria.{" "}
          {valeponto
            ? "Conduta adequada soma pontos; conduta contraindicada ou desnecessária tira."
            : "Esta etapa é só para aprender: não vale pontos."}
        </legend>
        <div className="space-y-2">
          {opcoes.map((o) => (
            <label
              key={o.id}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                marcadas.has(o.id) ? "border-marca bg-marca-claro" : "border-linha bg-fundo"
              }`}
            >
              <input
                type="checkbox"
                checked={marcadas.has(o.id)}
                onChange={() => alternar(o.id)}
                className="size-4 shrink-0 accent-[#0018ff]"
              />
              <span>{o.texto}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" disabled={ocupado} className="min-h-12 w-full rounded-md bg-marca px-4 font-medium text-fundo disabled:opacity-40 sm:w-auto">
        Confirmar tratamento
      </button>
    </form>
  );
}

export function TratamentoCorrigido({ itens }: { itens: NonNullable<Visao["tratamentoCorrigido"]> }) {
  return (
    <ul className="space-y-2">
      {itens.map((t) => (
        <li
          key={t.id}
          className={`rounded-md border p-3 text-sm ${t.classificacao === "contraindicado" ? "border-destaque-borda bg-destaque-claro" : "border-linha bg-fundo"}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-suave">
              {t.marcada ? <Check aria-hidden size={14} strokeWidth={2} /> : <X aria-hidden size={14} strokeWidth={2} />}
              {t.marcada ? "Você marcou" : "Não marcou"}
            </span>
            <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO[t.classificacao]}`}>{ROTULO[t.classificacao]}</span>
          </div>
          <p className="mt-1 font-medium">{t.texto}</p>
          <p className="text-suave">{t.justificativa}</p>
          {t.dose?.a_revisar && <p className="mt-1 text-xs text-alerta-escuro">Dose a revisar</p>}
        </li>
      ))}
    </ul>
  );
}
