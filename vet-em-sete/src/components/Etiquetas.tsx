import { Check, Contrast, Target, X } from "lucide-react";
import type { Proximidade } from "@/lib/jogo/proximidade";

type Tom = "igual" | "parcial" | "diferente" | "perto";

const ESTILO: Record<Tom, string> = {
  igual: "bg-sucesso text-texto border-sucesso",
  parcial: "bg-alerta text-texto border-alerta",
  diferente: "bg-superficie text-texto border-linha",
  perto: "bg-alerta-claro text-alerta-escuro border-alerta",
};
const ICONE = { igual: Check, parcial: Contrast, diferente: X, perto: Target };

function Etiqueta({ tom, children }: { tom: Tom; children: React.ReactNode }) {
  const I = ICONE[tom];
  return (
    <li className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${ESTILO[tom]}`}>
      <I aria-hidden size={14} strokeWidth={2} />
      {children}
    </li>
  );
}

const TXT_NIVEL = { igual: "igual", parcial: "parcial", diferente: "diferente" } as const;
const TXT_AGENTE = { mesmo_genero: "mesmo gênero", mesmo_grupo: "mesmo grupo", diferente: "diferente" } as const;

export function Etiquetas({ p }: { p: Proximidade }) {
  const tomAgente: Tom = p.agente === "mesmo_genero" ? "igual" : p.agente === "mesmo_grupo" ? "parcial" : "diferente";
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Proximidade do palpite">
      {p.muitoPerto && <Etiqueta tom="perto">Muito perto</Etiqueta>}
      <Etiqueta tom={p.sistema}>Sistema: {TXT_NIVEL[p.sistema]}</Etiqueta>
      <Etiqueta tom={p.categoria}>Categoria: {TXT_NIVEL[p.categoria]}</Etiqueta>
      {p.agente && <Etiqueta tom={tomAgente}>Agente: {TXT_AGENTE[p.agente]}</Etiqueta>}
    </ul>
  );
}
