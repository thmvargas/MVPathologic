"use client";

import { useState } from "react";
import {
  Bone, ClipboardList, Dna, Droplet, FlaskConical, Microscope, ScanLine, Scissors, Search, TestTube, TestTubes,
  type LucideIcon,
} from "lucide-react";
import type { ExameVisto } from "@/lib/jogo/motor";

export const ICONE_EXAME: Record<string, LucideIcon> = {
  hemograma: Droplet,
  bioquimica: FlaskConical,
  urinalise: TestTube,
  citologia: Microscope,
  histopatologia: Microscope,
  radiografia: Bone,
  ultrassonografia: ScanLine,
  sorologia: TestTubes,
  pcr: Dna,
  coproparasitologico: Search,
  necropsia: Scissors,
  outro: ClipboardList,
};

export const ROTULO_CLASSE = {
  relevante: "Relevante",
  pouco_util: "Pouco útil",
  desnecessario: "Desnecessário",
} as const;

const ESTILO_CLASSE = {
  relevante: "bg-sucesso text-texto",
  pouco_util: "bg-superficie text-texto border border-linha",
  desnecessario: "bg-destaque-claro text-destaque-escuro border border-destaque",
} as const;

export function SeloClasse({ c }: { c: keyof typeof ROTULO_CLASSE }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO_CLASSE[c]}`}>{ROTULO_CLASSE[c]}</span>;
}

export function ResultadoExame({ exame, mostrarRevisar }: { exame: Omit<ExameVisto, "tentativa">; mostrarRevisar: boolean }) {
  const { resultado } = exame;
  const Icone = ICONE_EXAME[exame.tipo] ?? ClipboardList;
  return (
    <article className="space-y-2 rounded-md border border-sucesso-borda bg-fundo p-3">
      <header className="flex flex-wrap items-center gap-2">
        <Icone aria-hidden size={18} strokeWidth={1.5} className="text-sucesso-escuro" />
        <h3 className="flex-1 font-sans text-sm font-semibold">{exame.nome}</h3>
        {exame.classificacao && <SeloClasse c={exame.classificacao} />}
      </header>
      {resultado.tabela && (
        <div className="-mx-1 overflow-x-auto" tabIndex={0} role="region" aria-label={`Tabela: ${exame.nome}`}>
          <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
            <caption className="sr-only">Resultado de {exame.nome}</caption>
            <thead>
              <tr className="border-b border-linha text-xs text-suave">
                <th scope="col" className="px-1 py-1 font-medium">Analito</th>
                <th scope="col" className="px-1 py-1 font-medium">Resultado</th>
                <th scope="col" className="px-1 py-1 font-medium">Referência</th>
              </tr>
            </thead>
            <tbody>
              {resultado.tabela.map((l) => (
                <tr key={l.analito} className="border-b border-linha/60 align-top">
                  <th scope="row" className="px-1 py-1 font-normal">{l.analito}</th>
                  <td className={`px-1 py-1 whitespace-nowrap ${l.alterado ? "font-semibold" : ""}`}>
                    {l.valor} {l.unidade}
                    {l.alterado === "alto" && <span className="ml-1 text-xs" aria-label="acima da referência">↑</span>}
                    {l.alterado === "baixo" && <span className="ml-1 text-xs" aria-label="abaixo da referência">↓</span>}
                  </td>
                  <td className="px-1 py-1 text-suave whitespace-nowrap">
                    {l.referencia}
                    {mostrarRevisar && l.a_revisar && (
                      <span className="ml-1 rounded border border-alerta-borda bg-alerta-claro px-1 text-[0.65rem] text-alerta-escuro">
                        a revisar
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {resultado.descricao && (
        <ul className="space-y-0.5 text-sm">
          {resultado.descricao.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      {resultado.conclusao && (
        <p className="text-sm">
          <span className="font-medium">Conclusão: </span>
          {resultado.conclusao}
        </p>
      )}
      {exame.comentario_didatico && <p className="border-t border-linha pt-2 text-sm text-suave">{exame.comentario_didatico}</p>}
    </article>
  );
}

export function EscolhaExame({
  opcoes,
  tentativa,
  ocupado,
  onPedir,
}: {
  opcoes: { id: string; nome: string; tipo: string }[];
  tentativa: number;
  ocupado: boolean;
  onPedir: (id: string) => void;
}) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (sel) onPedir(sel);
      }}
      className="space-y-3"
    >
      <fieldset>
        <legend className="mb-2 text-sm">
          <span className="font-semibold">Tentativa {tentativa}:</span> escolha um exame complementar antes do palpite.
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {opcoes.map((o) => {
            const I = ICONE_EXAME[o.tipo] ?? ClipboardList;
            const marcado = sel === o.id;
            return (
              <label
                key={o.id}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                  marcado ? "border-sucesso bg-sucesso-claro" : "border-linha bg-fundo"
                }`}
              >
                <input
                  type="radio"
                  name="exame"
                  value={o.id}
                  checked={marcado}
                  onChange={() => setSel(o.id)}
                  className="size-4 accent-[#0018ff]"
                />
                <I aria-hidden size={18} strokeWidth={1.5} className="shrink-0 text-sucesso-escuro" />
                <span>{o.nome}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={!sel || ocupado}
        className="min-h-12 w-full rounded-md bg-sucesso px-4 font-medium text-texto disabled:opacity-40 sm:w-auto"
      >
        Pedir exame
      </button>
    </form>
  );
}
