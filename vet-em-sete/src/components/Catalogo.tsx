import Link from "next/link";
import { ArrowRight, Check, CircleDashed, X } from "lucide-react";
import { ROTULO_GRUPO, type GrupoEspecie } from "@/lib/caso/esquema";
import type { CartaoCaso } from "@/lib/catalogo";
import { formatarDataBR } from "@/lib/util/tempo";

/** Chips de espécie (links), só com as espécies que têm caso. */
export function FiltroEspecie({
  grupos,
  atual,
  base,
  extra = {},
}: {
  grupos: GrupoEspecie[];
  atual?: string;
  base: string;
  extra?: Record<string, string>;
}) {
  if (grupos.length < 2) return null;
  const link = (g?: string) => {
    const q = new URLSearchParams({ ...extra, ...(g ? { especie: g } : {}) }).toString();
    return q ? `${base}?${q}` : base;
  };
  const chip = (ativo: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3 text-sm ${
      ativo ? "border-vinho bg-vinho text-areia" : "border-marfim bg-areia text-grafite"
    }`;
  return (
    <nav aria-label="Filtrar por espécie" className="flex flex-wrap gap-2">
      <Link href={link()} className={chip(!atual)} aria-current={!atual ? "page" : undefined}>
        Todas
      </Link>
      {grupos.map((g) => (
        <Link key={g} href={link(g)} className={chip(atual === g)} aria-current={atual === g ? "page" : undefined}>
          {ROTULO_GRUPO[g]}
        </Link>
      ))}
    </nav>
  );
}

export type Situacao = "acertou" | "errou" | "em_andamento" | undefined;

function Selo({ s }: { s: Situacao }) {
  if (!s) return null;
  const cfg = {
    acertou: { t: "Acertou", c: "bg-esmeralda text-areia", I: Check },
    errou: { t: "Não acertou", c: "bg-superficie text-grafite border border-marfim", I: X },
    em_andamento: { t: "Em andamento", c: "bg-ambar-claro text-ambar border border-ambar-borda", I: CircleDashed },
  }[s];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.c}`}>
      <cfg.I aria-hidden size={12} strokeWidth={2} />
      {cfg.t}
    </span>
  );
}

const DIFICULDADE = ["", "Básico", "Intermediário", "Avançado"];

export function ListaCasos({
  cartoes,
  modo,
  situacao,
}: {
  cartoes: (CartaoCaso & { situacao?: Situacao })[];
  modo: "semestre" | "arquivo";
  situacao?: boolean;
}) {
  if (!cartoes.length) return <p className="text-suave">Nenhum caso disponível aqui por enquanto.</p>;
  return (
    <ul className="space-y-2">
      {cartoes.map((c, i) => {
        const href = `/jogar/${c.codigo}?modo=${modo}${c.data ? `&data=${c.data}` : ""}`;
        const titulo = c.data ? `Caso do dia ${formatarDataBR(c.data)}` : `Caso ${i + 1}`;
        return (
          <li key={c.codigo + (c.data ?? "")}>
            <Link href={href} className="flex min-h-14 items-center gap-3 rounded-lg border border-marfim bg-areia px-4 py-3 hover:border-vinho">
              <div className="flex-1">
                <p className="font-medium">{titulo}</p>
                <p className="text-sm text-suave">
                  {ROTULO_GRUPO[c.grupo_especie]} · {c.semestre}º semestre · {DIFICULDADE[c.dificuldade]}
                </p>
              </div>
              {situacao && <Selo s={c.situacao} />}
              <ArrowRight aria-hidden size={18} strokeWidth={1.5} className="shrink-0 text-vinho" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AvisoForaDoRanking() {
  return <p className="text-sm text-suave">Fora do ranking. Se você estiver logado, a partida entra nas suas estatísticas.</p>;
}
