import type { Caso, Diagnostico } from "@/lib/caso/esquema";
import { compararDiagnosticos, type Proximidade } from "./proximidade";
import { calcularPontuacao, MAX_TENTATIVAS, type Pontuacao } from "./pontuacao";

/**
 * Motor do jogo. Funções puras: recebem o estado e o caso, devolvem o novo
 * estado ou um erro. Roda só no servidor; o navegador só recebe a "visão"
 * (o que já foi revelado), nunca o caso inteiro.
 */

export const PRIMEIRA_TENTATIVA_COM_EXAME = 5;

export type Acao =
  | { tipo: "palpite"; diagnosticoId: string }
  | { tipo: "pular" }
  | { tipo: "exame"; exameId: string }
  | { tipo: "tratamento"; condutas: string[] };

export type Fase = "diagnostico" | "tratamento" | "fim";

export type Estado = {
  casoId: string;
  versao: number;
  acoes: Acao[];
};

export class ErroDeJogo extends Error {}

// ---------------------------------------------------------------------------
// Estado derivado das ações
// ---------------------------------------------------------------------------

export type Resumo = {
  fase: Fase;
  /** tentativa em curso (1–7); depois do fim da fase de diagnóstico fica em 7 ou na do acerto */
  tentativa: number;
  palpitesFeitos: number;
  tentativaAcerto: number | null;
  examesPedidos: string[];
  palpites: (string | null)[]; // null = pulou
  tratamentoMarcado: string[] | null;
};

export function resumir(estado: Estado, caso: Pick<Caso, "diagnostico_id">): Resumo {
  let usadas = 0;
  let tentativaAcerto: number | null = null;
  const examesPedidos: string[] = [];
  const palpites: (string | null)[] = [];
  let tratamentoMarcado: string[] | null = null;

  for (const a of estado.acoes) {
    if (a.tipo === "palpite") {
      usadas++;
      palpites.push(a.diagnosticoId);
      if (a.diagnosticoId === caso.diagnostico_id) tentativaAcerto = usadas;
    } else if (a.tipo === "pular") {
      usadas++;
      palpites.push(null);
    } else if (a.tipo === "exame") {
      examesPedidos.push(a.exameId);
    } else if (a.tipo === "tratamento") {
      tratamentoMarcado = a.condutas;
    }
  }

  const fimDiagnostico = tentativaAcerto !== null || usadas >= MAX_TENTATIVAS;
  const fase: Fase = !fimDiagnostico ? "diagnostico" : tratamentoMarcado === null ? "tratamento" : "fim";
  const tentativa = fimDiagnostico ? (tentativaAcerto ?? MAX_TENTATIVAS) : usadas + 1;
  return { fase, tentativa, palpitesFeitos: usadas, tentativaAcerto, examesPedidos, palpites, tratamentoMarcado };
}

/** Quantos exames o aluno já deveria ter escolhido antes de palpitar nesta tentativa. */
export function examesExigidos(tentativa: number): number {
  return Math.max(0, tentativa - PRIMEIRA_TENTATIVA_COM_EXAME + 1);
}

export function precisaEscolherExame(r: Resumo, caso: Pick<Caso, "exames">): boolean {
  if (r.fase !== "diagnostico") return false;
  const disponiveis = caso.exames.length - r.examesPedidos.length;
  return r.examesPedidos.length < examesExigidos(r.tentativa) && disponiveis > 0;
}

// ---------------------------------------------------------------------------
// Aplicar ação
// ---------------------------------------------------------------------------

export function aplicarAcao(
  estado: Estado,
  acao: Acao,
  caso: Caso,
  diagnosticos: Map<string, Diagnostico>,
): Estado {
  if (estado.casoId !== caso.id || estado.versao !== caso.versao)
    throw new ErroDeJogo("Esta partida é de outra versão do caso. Recomece.");
  const r = resumir(estado, caso);

  switch (acao.tipo) {
    case "exame": {
      if (r.fase !== "diagnostico") throw new ErroDeJogo("A fase de exames já terminou.");
      if (r.tentativa < PRIMEIRA_TENTATIVA_COM_EXAME)
        throw new ErroDeJogo(`Exames complementares só a partir da ${PRIMEIRA_TENTATIVA_COM_EXAME}ª tentativa.`);
      if (!precisaEscolherExame(r, caso)) throw new ErroDeJogo("Você já escolheu o exame desta tentativa.");
      if (!caso.exames.some((e) => e.id === acao.exameId)) throw new ErroDeJogo("Exame não disponível neste caso.");
      if (r.examesPedidos.includes(acao.exameId)) throw new ErroDeJogo("Esse exame já foi pedido.");
      break;
    }
    case "palpite":
    case "pular": {
      if (r.fase !== "diagnostico") throw new ErroDeJogo("A fase de diagnóstico já terminou.");
      if (precisaEscolherExame(r, caso)) throw new ErroDeJogo("Escolha um exame complementar antes.");
      if (acao.tipo === "palpite") {
        if (!diagnosticos.has(acao.diagnosticoId)) throw new ErroDeJogo("Escolha um diagnóstico da lista.");
        if (r.palpites.includes(acao.diagnosticoId)) throw new ErroDeJogo("Você já tentou esse diagnóstico.");
      }
      break;
    }
    case "tratamento": {
      if (r.fase !== "tratamento") throw new ErroDeJogo("Ainda não é hora do tratamento.");
      const validos = new Set(caso.tratamentos.map((t) => t.id));
      const unicos = [...new Set(acao.condutas)];
      if (unicos.some((c) => !validos.has(c))) throw new ErroDeJogo("Conduta inválida.");
      return { ...estado, acoes: [...estado.acoes, { tipo: "tratamento", condutas: unicos }] };
    }
    default:
      throw new ErroDeJogo("Ação desconhecida.");
  }
  return { ...estado, acoes: [...estado.acoes, acao] };
}

export function estadoInicial(caso: Pick<Caso, "id" | "versao">): Estado {
  return { casoId: caso.id, versao: caso.versao, acoes: [] };
}

// ---------------------------------------------------------------------------
// Visão do aluno: só o que já foi revelado
// ---------------------------------------------------------------------------

export type PalpiteVisto =
  | { tipo: "pulou"; tentativa: number }
  | { tipo: "acerto"; tentativa: number; id: string; nome: string }
  | { tipo: "erro"; tentativa: number; id: string; nome: string; proximidade: Proximidade };

export type ExameVisto = {
  id: string;
  nome: string;
  tipo: string;
  tentativa: number;
  resultado: Caso["exames"][number]["resultado"];
  // só no fim:
  classificacao?: Caso["exames"][number]["classificacao"];
  comentario_didatico?: string;
};

export type Visao = {
  fase: Fase;
  tentativa: number;
  maxTentativas: number;
  status: Caso["status"];
  paciente: Pick<Caso, "especie" | "grupo_especie" | "raca" | "idade" | "sexo" | "peso" | "queixa_principal">;
  historico?: Caso["historico"];
  anamnese?: Caso["anamnese"];
  exame_fisico?: Caso["exame_fisico"];
  examesDisponiveis?: { id: string; nome: string; tipo: string }[];
  precisaEscolherExame: boolean;
  examesFeitos: ExameVisto[];
  palpites: PalpiteVisto[];
  diagnostico?: { id: string; nome: string };
  acertou?: boolean;
  tratamentosOpcoes?: { id: string; texto: string; tipo: string }[];
  // fim
  tratamentoCorrigido?: (Caso["tratamentos"][number] & { marcada: boolean })[];
  pontuacao?: Pontuacao;
  explicacao?: Caso["explicacao"];
  diferenciais?: { nome: string; como_descartar: string }[];
  referencias?: Caso["referencias"];
  /** no fim: todos os exames do caso, pedidos ou não, para estudo */
  examesTodos?: (Caso["exames"][number] & { pedido: boolean })[];
  temItensARevisar: boolean;
};

export function montarVisao(estado: Estado, caso: Caso, diagnosticos: Map<string, Diagnostico>): Visao {
  const r = resumir(estado, caso);
  const terminouDiagnostico = r.fase !== "diagnostico";
  const fim = r.fase === "fim";
  const alvo = diagnosticos.get(caso.diagnostico_id);
  if (!alvo) throw new Error(`diagnóstico ${caso.diagnostico_id} ausente da lista`);
  const difIds = caso.diferenciais.map((d) => d.diagnostico_id);

  // Nível de revelação = tentativa em curso (ou tudo, se a fase de diagnóstico acabou)
  const nivel = terminouDiagnostico ? MAX_TENTATIVAS : r.tentativa;

  const palpites: PalpiteVisto[] = r.palpites.map((id, i) => {
    const tentativa = i + 1;
    if (id === null) return { tipo: "pulou", tentativa };
    const d = diagnosticos.get(id)!;
    if (id === caso.diagnostico_id) return { tipo: "acerto", tentativa, id, nome: d.nome };
    return { tipo: "erro", tentativa, id, nome: d.nome, proximidade: compararDiagnosticos(d, alvo, difIds) };
  });

  const examesFeitos: ExameVisto[] = r.examesPedidos.map((id, i) => {
    const e = caso.exames.find((x) => x.id === id)!;
    return {
      id: e.id,
      nome: e.nome,
      tipo: e.tipo,
      tentativa: PRIMEIRA_TENTATIVA_COM_EXAME + i,
      resultado: e.resultado,
      ...(fim ? { classificacao: e.classificacao, comentario_didatico: e.comentario_didatico } : {}),
    };
  });

  const temItensARevisar =
    caso.exame_fisico.parametros.some((p) => p.a_revisar) ||
    caso.exames.some((e) => e.resultado.tabela?.some((l) => l.a_revisar)) ||
    caso.tratamentos.some((t) => t.dose?.a_revisar);

  const visao: Visao = {
    fase: r.fase,
    tentativa: r.tentativa,
    maxTentativas: MAX_TENTATIVAS,
    status: caso.status,
    paciente: {
      especie: caso.especie,
      grupo_especie: caso.grupo_especie,
      raca: caso.raca,
      idade: caso.idade,
      sexo: caso.sexo,
      peso: caso.peso,
      queixa_principal: caso.queixa_principal,
    },
    precisaEscolherExame: precisaEscolherExame(r, caso),
    examesFeitos,
    palpites,
    temItensARevisar,
  };
  if (nivel >= 2) visao.historico = caso.historico;
  if (nivel >= 3) visao.anamnese = caso.anamnese;
  if (nivel >= 4) visao.exame_fisico = caso.exame_fisico;
  if (r.fase === "diagnostico" && nivel >= PRIMEIRA_TENTATIVA_COM_EXAME)
    visao.examesDisponiveis = caso.exames
      .filter((e) => !r.examesPedidos.includes(e.id))
      .map((e) => ({ id: e.id, nome: e.nome, tipo: e.tipo }));

  if (terminouDiagnostico) {
    visao.diagnostico = { id: alvo.id, nome: alvo.nome };
    visao.acertou = r.tentativaAcerto !== null;
    visao.tratamentosOpcoes = caso.tratamentos.map((t) => ({ id: t.id, texto: t.texto, tipo: t.tipo }));
  }

  if (fim) {
    const marcadas = new Set(r.tratamentoMarcado ?? []);
    visao.tratamentoCorrigido = caso.tratamentos.map((t) => ({ ...t, marcada: marcadas.has(t.id) }));
    visao.pontuacao = calcularPontuacao({
      caso,
      tentativaAcerto: r.tentativaAcerto,
      examesPedidos: r.examesPedidos,
      tratamentoMarcado: r.tratamentoMarcado ?? [],
    });
    visao.explicacao = caso.explicacao;
    visao.diferenciais = caso.diferenciais.map((d) => ({
      nome: diagnosticos.get(d.diagnostico_id)?.nome ?? d.diagnostico_id,
      como_descartar: d.como_descartar,
    }));
    visao.referencias = caso.referencias;
    // No fim, todos os exames ficam visíveis com classificação, para estudo
    visao.examesTodos = caso.exames.map((e) => ({ ...e, pedido: r.examesPedidos.includes(e.id) }));
  }
  return visao;
}
