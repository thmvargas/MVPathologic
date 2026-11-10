import { z } from "zod";

/**
 * Esquema de um caso clínico do Vet em Sete.
 *
 * O mesmo esquema valida: os casos em arquivo (src/dados/casos), o que o
 * painel de administração salvar no banco (Etapa 6) e os testes automáticos.
 */

export const SISTEMAS = [
  "tegumentar",
  "digestorio",
  "hepatobiliar",
  "pancreatico",
  "respiratorio",
  "cardiovascular",
  "urinario",
  "reprodutor",
  "nervoso",
  "musculoesqueletico",
  "endocrino",
  "hematopoietico_linfatico",
  "oftalmico",
  "multissistemico",
] as const;

export const ROTULO_SISTEMA: Record<Sistema, string> = {
  tegumentar: "Tegumentar",
  digestorio: "Digestório",
  hepatobiliar: "Hepatobiliar",
  pancreatico: "Pancreático",
  respiratorio: "Respiratório",
  cardiovascular: "Cardiovascular",
  urinario: "Urinário",
  reprodutor: "Reprodutor",
  nervoso: "Nervoso",
  musculoesqueletico: "Musculoesquelético",
  endocrino: "Endócrino",
  hematopoietico_linfatico: "Hematopoiético e linfático",
  oftalmico: "Oftálmico",
  multissistemico: "Multissistêmico",
};

export const CATEGORIAS = [
  "infecciosa_viral",
  "infecciosa_bacteriana",
  "infecciosa_fungica",
  "infecciosa_parasitaria",
  "neoplasica",
  "metabolica_endocrina",
  "toxica",
  "degenerativa",
  "congenita_genetica",
  "imunomediada",
  "nutricional",
  "traumatica_mecanica",
  "idiopatica",
] as const;

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  infecciosa_viral: "Infecciosa viral",
  infecciosa_bacteriana: "Infecciosa bacteriana",
  infecciosa_fungica: "Infecciosa fúngica",
  infecciosa_parasitaria: "Parasitária",
  neoplasica: "Neoplásica",
  metabolica_endocrina: "Metabólica/endócrina",
  toxica: "Tóxica",
  degenerativa: "Degenerativa",
  congenita_genetica: "Congênita/genética",
  imunomediada: "Imunomediada",
  nutricional: "Nutricional",
  traumatica_mecanica: "Traumática/mecânica",
  idiopatica: "Idiopática",
};

export const ESPECIES = [
  "canina",
  "felina",
  "equina",
  "bovina",
  "ovina",
  "caprina",
  "suina",
  "aves",
] as const;

export const GRUPOS_ESPECIE = ["caes", "gatos", "equinos", "ruminantes", "suinos", "aves"] as const;

export const ROTULO_GRUPO: Record<GrupoEspecie, string> = {
  caes: "Cães",
  gatos: "Gatos",
  equinos: "Equinos",
  ruminantes: "Ruminantes",
  suinos: "Suínos",
  aves: "Aves",
};

export type Sistema = (typeof SISTEMAS)[number];
export type Categoria = (typeof CATEGORIAS)[number];
export type Especie = (typeof ESPECIES)[number];
export type GrupoEspecie = (typeof GRUPOS_ESPECIE)[number];

// ---------------------------------------------------------------------------
// Diagnósticos (lista controlada)
// ---------------------------------------------------------------------------

export const DiagnosticoSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  nome: z.string().min(2),
  sinonimos: z.array(z.string()).default([]),
  especies: z.array(z.enum(ESPECIES)).min(1),
  sistemas: z.array(z.enum(SISTEMAS)).min(1), // o primeiro é o sistema principal
  categoria: z.enum(CATEGORIAS),
  agente_grupo: z.string().optional(), // família, ordem ou grupo
  agente_genero: z.string().optional(),
});
export type Diagnostico = z.infer<typeof DiagnosticoSchema>;

// ---------------------------------------------------------------------------
// Caso
// ---------------------------------------------------------------------------

const Bloco = z.object({
  titulo: z.string(),
  itens: z.array(z.string()).min(1),
});

const Parametro = z.object({
  nome: z.string(),
  valor: z.string(),
  unidade: z.string().optional(),
  referencia: z.string().optional(),
  fonte: z.string().optional(),
  alterado: z.enum(["alto", "baixo", "anormal"]).optional(),
  a_revisar: z.boolean().optional(),
});

const LinhaTabela = z.object({
  analito: z.string(),
  valor: z.string(),
  unidade: z.string(),
  referencia: z.string(),
  fonte: z.string(),
  alterado: z.enum(["alto", "baixo"]).optional(),
  a_revisar: z.boolean().optional(),
});

export const TIPOS_EXAME = [
  "hemograma",
  "bioquimica",
  "urinalise",
  "citologia",
  "histopatologia",
  "radiografia",
  "ultrassonografia",
  "sorologia",
  "pcr",
  "coproparasitologico",
  "necropsia",
  "outro",
] as const;

const Exame = z.object({
  id: z.string(),
  tipo: z.enum(TIPOS_EXAME),
  nome: z.string(),
  classificacao: z.enum(["relevante", "pouco_util", "desnecessario"]),
  resultado: z.object({
    tabela: z.array(LinhaTabela).optional(),
    descricao: z.array(z.string()).optional(),
    conclusao: z.string().optional(),
    imagens: z
      .array(z.object({ url: z.string(), legenda: z.string(), credito: z.string() }))
      .optional(),
  }),
  comentario_didatico: z.string(),
});

const Conduta = z.object({
  id: z.string(),
  texto: z.string(),
  tipo: z.enum(["farmaco", "suporte", "manejo", "cirurgia", "eutanasia", "sanitaria", "exame"]),
  classificacao: z.enum(["adequado", "aceitavel", "desnecessario", "contraindicado"]),
  justificativa: z.string(),
  dose: z
    .object({ texto: z.string(), fonte: z.string(), a_revisar: z.boolean().optional() })
    .optional(),
});

const Referencia = z.object({
  id: z.string(),
  citacao: z.string(),
  paginas: z.string().optional(),
  url: z.string().optional(),
});

export const CasoSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(["rascunho", "em_revisao", "revisado", "arquivado"]),
  versao: z.number().int().min(1),

  especie: z.enum(ESPECIES),
  grupo_especie: z.enum(GRUPOS_ESPECIE),
  raca: z.string(),
  idade: z.string(),
  sexo: z.string(),
  peso: z.string().optional(),
  queixa_principal: z.array(z.string()).min(1),

  semestre: z.number().int().min(1).max(6),
  /**
   * "diario": reservado para o caso do dia; entra no treino só depois de ter
   * sido usado. "treino": só treino e modo por semestre, nunca caso do dia.
   */
  uso: z.enum(["diario", "treino"]).default("diario"),
  sistema: z.enum(SISTEMAS),
  dificuldade: z.number().int().min(1).max(3),
  tags: z.array(z.string()).optional(),

  historico: z.array(Bloco).min(1),
  anamnese: z.array(Bloco).min(1),
  exame_fisico: z.object({
    parametros: z.array(Parametro).min(1),
    achados: z.array(Bloco).min(1),
  }),

  exames: z.array(Exame).min(3),

  diagnostico_id: z.string(),
  diferenciais: z.array(z.object({ diagnostico_id: z.string(), como_descartar: z.string() })),

  tratamentos: z.array(Conduta).min(4),

  explicacao: z.object({
    resumo: z.string(),
    fisiopatologia: z.array(z.string()).min(1),
    pistas: z.array(z.object({ achado: z.string(), por_que_importa: z.string() })).min(1),
    comentario_exames: z.string(),
    comentario_tratamento: z.string(),
  }),
  referencias: z.array(Referencia).min(1),
  revisao: z.object({
    autor: z.string(),
    revisor: z.string().optional(),
    revisado_em: z.string().optional(),
    observacoes: z.string().optional(),
  }),
});

export type Caso = z.infer<typeof CasoSchema>;
export type Exame = z.infer<typeof Exame>;
export type Conduta = z.infer<typeof Conduta>;

// ---------------------------------------------------------------------------
// Regras de qualidade além do formato
// ---------------------------------------------------------------------------

export type Pendencia = { campo: string; problema: string };

/**
 * Regras que impedem um caso de ser aprovado ("revisado"). Um rascunho pode
 * ter pendências; um caso revisado não pode ter nenhuma.
 */
export function pendenciasDoCaso(caso: Caso, diagnosticos: Map<string, Diagnostico>): Pendencia[] {
  const p: Pendencia[] = [];
  const refs = new Set(caso.referencias.map((r) => r.id));

  if (!diagnosticos.has(caso.diagnostico_id))
    p.push({ campo: "diagnostico_id", problema: `diagnóstico "${caso.diagnostico_id}" não está na lista controlada` });
  for (const d of caso.diferenciais)
    if (!diagnosticos.has(d.diagnostico_id))
      p.push({ campo: "diferenciais", problema: `diferencial "${d.diagnostico_id}" não está na lista controlada` });
  if (caso.diferenciais.some((d) => d.diagnostico_id === caso.diagnostico_id))
    p.push({ campo: "diferenciais", problema: "o diagnóstico correto aparece como diferencial" });

  caso.exame_fisico.parametros.forEach((x, i) => {
    if (x.referencia && !x.fonte)
      p.push({ campo: `exame_fisico.parametros[${i}]`, problema: `"${x.nome}" tem referência sem fonte` });
    if (x.fonte && !refs.has(x.fonte))
      p.push({ campo: `exame_fisico.parametros[${i}]`, problema: `fonte "${x.fonte}" não está nas referências` });
    if (x.a_revisar) p.push({ campo: `exame_fisico.parametros[${i}]`, problema: `"${x.nome}" marcado "a revisar"` });
  });

  const contagem = { relevante: 0, pouco_util: 0, desnecessario: 0 };
  const idsExame = new Set<string>();
  caso.exames.forEach((e, i) => {
    contagem[e.classificacao]++;
    if (idsExame.has(e.id)) p.push({ campo: `exames[${i}]`, problema: `id de exame repetido "${e.id}"` });
    idsExame.add(e.id);
    e.resultado.tabela?.forEach((l) => {
      if (!refs.has(l.fonte))
        p.push({ campo: `exames[${i}]`, problema: `fonte "${l.fonte}" de "${l.analito}" não está nas referências` });
      if (l.a_revisar) p.push({ campo: `exames[${i}]`, problema: `"${l.analito}" marcado "a revisar"` });
    });
  });
  if (contagem.relevante < 2) p.push({ campo: "exames", problema: "precisa de pelo menos 2 exames relevantes" });
  if (contagem.pouco_util < 1) p.push({ campo: "exames", problema: "precisa de pelo menos 1 exame pouco útil" });
  if (contagem.desnecessario < 1) p.push({ campo: "exames", problema: "precisa de pelo menos 1 exame desnecessário" });

  const idsConduta = new Set<string>();
  caso.tratamentos.forEach((t, i) => {
    if (idsConduta.has(t.id)) p.push({ campo: `tratamentos[${i}]`, problema: `id de conduta repetido "${t.id}"` });
    idsConduta.add(t.id);
    if (t.dose && !refs.has(t.dose.fonte))
      p.push({ campo: `tratamentos[${i}]`, problema: `fonte da dose "${t.dose.fonte}" não está nas referências` });
    if (t.dose?.a_revisar) p.push({ campo: `tratamentos[${i}]`, problema: `dose de "${t.texto}" marcada "a revisar"` });
  });
  if (!caso.tratamentos.some((t) => t.classificacao === "adequado"))
    p.push({ campo: "tratamentos", problema: "precisa de pelo menos 1 conduta adequada" });
  if (!caso.tratamentos.some((t) => t.classificacao === "contraindicado"))
    p.push({ campo: "tratamentos", problema: "precisa de pelo menos 1 conduta contraindicada" });

  return p;
}
