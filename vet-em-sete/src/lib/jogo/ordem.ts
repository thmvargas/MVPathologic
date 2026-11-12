import { hash32 } from "@/lib/util/tempo";

/**
 * Embaralhamento determinístico (Fisher-Yates com gerador mulberry32).
 *
 * Exames e condutas são cadastrados em qualquer ordem (em geral os
 * relevantes e adequados primeiro). Mostrar nessa ordem entregaria a
 * resposta pela posição. A ordem exibida depende só da semente, então é a
 * mesma ao recarregar a página e em todas as fases da partida.
 */
export function embaralhar<T>(itens: readonly T[], semente: string): T[] {
  let s = hash32(semente) || 1;
  const aleatorio = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = [...itens];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
