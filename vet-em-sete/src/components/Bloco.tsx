"use client";

import { useId, useState } from "react";
import { ChevronDown, Lock, type LucideIcon } from "lucide-react";

/**
 * Identidade UNIFEOB: cartões brancos com contorno cinza, título em azul e o
 * "ponto" da marca depois do título. O rosa (10% da composição) fica para o
 * aviso de camada nova.
 */
export type Acento = "marca" | "destaque";

// Classes estáticas (o Tailwind precisa ver os nomes completos).
export const ESTILO: Record<Acento, { cartao: string; titulo: string; ponto: string }> = {
  marca: { cartao: "bg-fundo border-linha", titulo: "text-marca", ponto: "bg-marca" },
  destaque: { cartao: "bg-fundo border-destaque", titulo: "text-texto", ponto: "bg-destaque" },
};

export function Bloco({
  titulo,
  acento = "marca",
  icone: Icone,
  children,
  novo = false,
  inicialAberto = true,
}: {
  titulo: string;
  acento?: Acento;
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
          <span className="flex-1">
            {titulo}
            <span aria-hidden className={`ml-0.5 inline-block size-1.5 rounded-full align-baseline ${e.ponto}`} />
          </span>
          {novo && (
            <span className="rounded-full border border-destaque bg-destaque-claro px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-destaque-escuro">novo</span>
          )}
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
    <div className="flex min-h-12 items-center gap-2 rounded-lg border border-dashed border-linha px-4 py-2 text-sm text-suave">
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
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-texto" />
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
