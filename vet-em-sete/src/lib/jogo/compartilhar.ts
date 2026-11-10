import type { Visao } from "./motor";
import { ROTULO_GRUPO } from "@/lib/caso/esquema";
import { formatarDataBR } from "@/lib/util/tempo";

/**
 * Texto de compartilhar, estilo Wordle, sem revelar o diagnóstico.
 * Emoji só aqui, no texto copiado; nunca na interface.
 *   verde = acerto, amarelo = muito perto, vermelho = erro, branco = pulou
 */
export function textoCompartilhar(visao: Visao, dataIso: string, url?: string): string {
  const quadrados = visao.palpites
    .map((p) => (p.tipo === "acerto" ? "🟩" : p.tipo === "pulou" ? "⬜" : p.proximidade.muitoPerto ? "🟨" : "🟥"))
    .join("");
  const n = visao.palpites.length;
  const linhas = [
    `Vet em Sete · ${formatarDataBR(dataIso)} · ${ROTULO_GRUPO[visao.paciente.grupo_especie]}`,
    visao.acertou ? `Acertei em ${n}/${visao.maxTentativas}` : `Não acertei (X/${visao.maxTentativas})`,
    quadrados,
  ];
  const relevantes = visao.examesFeitos.filter((e) => e.classificacao === "relevante").length;
  if (visao.examesFeitos.length)
    linhas.push(`Exames: ${relevantes} relevante${relevantes === 1 ? "" : "s"} de ${visao.examesFeitos.length}`);
  if (visao.acertou && visao.pontuacao)
    linhas.push(`Tratamento: ${Math.round(visao.pontuacao.tratamentoFracao * 100)}%`);
  if (visao.pontuacao) linhas.push(`${visao.pontuacao.total} pontos`);
  if (url) linhas.push(url);
  return linhas.join("\n");
}
