"use client";

import { useId, useState } from "react";
import { ChevronDown, Lock, type LucideIcon } from "lucide-react";

export type Acento = "vinho" | "azul" | "violeta" | "ambar" | "esmeralda" | "carmim";

// Classes estáticas (o Tailwind precisa ver os nomes completos).
export const ESTILO: Record<Acento, { cartao: string; titulo: string }> = {
  vinho: { cartao: "bg-vinho-claro border-vinho-borda", titulo: "text-vinho" },
  azul: { cartao: "bg-azul-claro border-azul-borda", titulo: "text-azul" },
  violeta: { cartao: "bg-violeta-claro border-violeta-borda", titulo: "text-violeta" },
  ambar: { cartao: "bg-ambar-claro border-ambar-borda", titulo: "text-ambar" },
  esmeralda: { cartao: "bg-esmeralda-claro border-esmeralda-borda", titulo: "text-esmeralda" },
  carmim: { cartao: "bg-carmim-claro border-carmim-borda", titulo: "text-carmim" },
};

export function Bloco({
  titulo,
  acento,
  icone: Icone,
  children,
  novo = false,
  inicialAberto = true,
}: {
  titulo: string;
  acento: Acento;
  icone: LucideIcon;
  children: React.ReactNode;
  novo?: boolean;
  inicialAberto?: boolean;
}) {
  const [aberto, setAberto] = useState(inicialAberto);
  const id = useId();
  const e = ESTILO[acento];
  return (
    <section className={`rounded-lg border ${e.cartao}`}>
      <h2 className="text-base">
        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={id}
          onClick={() => setAberto((a) => !a)}
          className={`flex min-h-12 w-full items-center gap-2 px-4 py-2 text-left ${e.titulo}`}
        >
          <Icone aria-hidden size={20} strokeWidth={1.5} className="shrink-0" />
          <span className="flex-1">{titulo}</span>
          {novo && <span className="font-sans text-xs font-medium uppercase tracking-wide">novo</span>}
          <ChevronDown
            aria-hidden
            size={20}
            strokeWidth={1.5}
            className={`shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
          />
        </button>
      </h2>
      <div id={id} hidden={!aberto} className="px-4 pb-4 text-sm">
        {children}
      </div>
    </section>
  );
}

export function BlocoBloqueado({ titulo, quando }: { titulo: string; quando: string }) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-lg border border-dashed border-marfim px-4 py-2 text-sm text-suave">
      <Lock aria-hidden size={16} strokeWidth={1.5} className="shrink-0" />
      <span className="flex-1">{titulo}</span>
      <span className="text-xs">{quando}</span>
    </div>
  );
}

/** Lista de blocos {titulo, itens} em palavras-chave. */
export function ListaBlocos({ blocos }: { blocos: { titulo: string; itens: string[] }[] }) {
  return (
    <dl className="space-y-3">
      {blocos.map((b) => (
        <div key={b.titulo}>
          <dt className="text-xs font-medium uppercase tracking-wide text-suave">{b.titulo}</dt>
          <dd>
            <ul className="mt-1 space-y-0.5">
              {b.itens.map((i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-grafite" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
