/* =============================================================================
 * PatoVetZee — MODELO para cadastrar uma nova doença
 * -----------------------------------------------------------------------------
 * Este bloco foi gerado automaticamente a partir do catálogo real de parâmetros
 * do jogo (CATALOGO_PARAMETROS dentro de patovetzee.html), então os 60 campos
 * abaixo estão na ordem certa e com os nomes exatamente como o motor espera.
 * Se você só copiar, preencher e colar, não tem como esquecer um campo.
 *
 * COMO USAR:
 *   1. Copie o bloco inteiro entre os marcadores "COPIE A PARTIR DAQUI" e
 *      "COPIE ATÉ AQUI" logo abaixo.
 *   2. Abra patovetzee.html, ache a constante `BANCO_DOENCAS` (seção 1 do
 *      arquivo) e cole o bloco como um novo item do array — antes do `];`
 *      que fecha o array, lembrando da vírgula depois do item anterior.
 *   3. Preencha `id`, `nome`, `especie`.
 *   4. Troque cada `false` por `true` quando a afirmação for verdadeira para
 *      a doença (o comentário ao lado de cada linha diz o que ela significa).
 *   5. Troque cada `0` dos parâmetros graduais por um número de 0 a 100,
 *      seguindo o critério de referência que está no comentário da linha.
 *   6. Salve o arquivo e abra com `?debug=1` no final da URL (ex.:
 *      patovetzee.html?debug=1) — o console do navegador vai avisar se
 *      esqueceu algum campo (a checagem `validarBancoDoencas` roda sozinha).
 *   7. Veja o GUIA_MANUTENCAO.md para o passo a passo completo (inclusive
 *      como colocar essa doença em um desafio do dia).
 *
 * NÃO PRECISA mexer em nada além do bloco copiado — `dica` fica `null` de
 * propósito (reservado para uma versão futura do jogo).
 * ============================================================================= */

// ============================= COPIE A PARTIR DAQUI =============================
{
  id: "PREENCHA_UM_ID_UNICO_EM_SNAKE_CASE", // ex.: "cinomose_canina" — sem espaços/acentos, único no banco
  nome: "PREENCHA O NOME DE EXIBIÇÃO", // ex.: "Cinomose canina" — este é o texto que o aluno vê no jogo
  especie: "Canina", // "Canina" | "Felina" | outra — guardado no dado, mas NÃO é exibido ao jogador
  dica: null, // reservado para o futuro — não preencha ainda

  parametros_binarios: {
    // --- Etiologia ---
    zoonose: false, // Zoonose
    doenca_viral: false, // Doença viral
    doenca_bacteriana: false, // Doença bacteriana
    doenca_parasitaria: false, // Doença parasitária
    doenca_fungica: false, // Doença fúngica
    associada_uso_hormonios: false, // Associada ao uso de hormônios
    etiologia_hereditaria_genetica: false, // Etiologia hereditária/genética
    // --- Transmissão ---
    transmitida_por_vetores: false, // Transmitida por vetores
    contagiosa_contato_direto: false, // Contagiosa por contato direto
    transmissao_ambiental_fomites: false, // Transmissão ambiental/fômites relevante
    transmissao_vertical_transplacentaria: false, // Transmissão vertical/transplacentária possível
    requer_notificacao_obrigatoria: false, // Doença de notificação obrigatória
    // --- Predisposição ---
    maior_prevalencia_felinos: false, // Maior prevalência em felinos
    predisposicao_racial_reconhecida: false, // Predisposição racial reconhecida
    maior_prevalencia_animais_idosos: false, // Maior prevalência em animais idosos
    maior_prevalencia_filhotes_jovens: false, // Maior prevalência em filhotes/jovens
    predisposicao_femeas_nao_castradas: false, // Predisposição em fêmeas não castradas
    associada_obesidade: false, // Associada à obesidade
    maior_prevalencia_ambientes_coletivos: false, // Maior prevalência em ambientes coletivos
    // --- Natureza da lesão ---
    doenca_neoplasica: false, // Doença neoplásica
    causa_hemorragia: false, // Causa hemorragia
    lesao_caracteristicamente_multissistemica: false, // Lesão caracteristicamente multissistêmica
    processo_inflamatorio_predominante: false, // Processo inflamatório predominante
    lesao_potencialmente_metastatica: false, // Lesão potencialmente metastática/invasiva
    causa_alteracao_degenerativa_cronica: false, // Causa alteração degenerativa crônica
    // --- Sinais clínicos ---
    sinais_gastrointestinais_proeminentes: false, // Sinais gastrointestinais proeminentes
    sinais_respiratorios_proeminentes: false, // Sinais respiratórios proeminentes
    sinais_dermatologicos_proeminentes: false, // Sinais dermatológicos proeminentes
    sinais_musculoesqueleticos_proeminentes: false, // Sinais musculoesqueléticos proeminentes
    linfonodomegalia_frequente: false, // Linfonodomegalia frequente
    febre_frequente: false, // Febre frequente
    sinais_sistemicos_inespecificos_comuns: false, // Sinais sistêmicos inespecíficos comuns
    perda_peso_ou_caquexia_frequente: false, // Perda de peso/caquexia frequente
    // --- Diagnóstico ---
    diagnostico_por_exame_sorologico: false, // Diagnóstico auxiliado por sorologia
    diagnostico_por_citologia_biopsia: false, // Diagnóstico via citologia/biópsia
    diagnostico_por_imagem_essencial: false, // Diagnóstico com uso essencial de imagem
    diagnostico_laboratorial_bioquimico_essencial: false, // Bioquímica/hematologia essencial ao Dx
    diagnostico_definitivo_requer_histopatologia: false, // Diagnóstico definitivo requer histopatologia
    teste_rapido_disponivel_rotina: false, // Teste rápido disponível na rotina
    alteracoes_hematologicas_caracteristicas: false, // Alterações hematológicas características
    // --- Tratamento ---
    tratamento_cirurgico_indicado: false, // Tratamento cirúrgico indicado
    tratamento_quimioterapico_indicado: false, // Tratamento quimioterápico indicado
    tratamento_com_antimicrobianos_especificos: false, // Tratamento com agente específico (anti-inf.)
    tratamento_essencialmente_de_suporte: false, // Tratamento essencialmente de suporte
    tratamento_topico_frequente: false, // Tratamento tópico frequente
    tratamento_exclusivamente_paliativo: false, // Tratamento essencialmente paliativo
    requer_tratamento_continuo_longo_prazo: false, // Requer tratamento contínuo/longo prazo
    // --- Prognóstico ---
    prognostico_favoravel: false, // Prognóstico favorável (Dx/Tx precoces)
    doenca_potencialmente_fatal_sem_tratamento: false, // Potencialmente fatal sem tratamento
    risco_recidiva_relevante: false, // Risco de recidiva relevante
    cura_definitiva_possivel: false, // Cura definitiva possível
    doenca_cronica_progressiva: false, // Doença crônica e progressiva
  },

  parametros_graduais: {
    letalidade_nao_tratada: 0, // Letalidade se não tratada. 0 = praticamente nunca letal sem tratamento; 100 = letalidade quase certa sem tratamento.
    velocidade_progressao: 0, // Velocidade de progressão. 0 = curso de anos; 100 = curso de horas/dias.
    custo_complexidade_diagnostica: 0, // Custo/complexidade diagnóstica. 0 = exame clínico/teste simples e barato; 100 = workup multi-etapas e caro.
    impacto_qualidade_vida: 0, // Impacto na qualidade de vida. 0 = sem impacto perceptível; 100 = comprometimento grave e constante.
    disseminacao_ambiente_coletivo: 0, // Grau de disseminação em ambiente coletivo. 0 = não se dissemina entre animais de um canil/gatil; 100 = disseminação explosiva.
    relevancia_diferencial_rotina: 0, // Relevância como diagnóstico diferencial na rotina. 0 = raramente entra como DDx; 100 = DDx obrigatório e frequente na clínica geral.
    invasividade_tratamento_padrao: 0, // Grau de invasividade do tratamento padrão. 0 = tratamento não invasivo (tópico/oral simples); 100 = cirurgia de grande porte/agressivo.
    impacto_economico_tratamento: 0, // Impacto econômico do tratamento. 0 = tratamento de baixo custo; 100 = tratamento caro e/ou prolongado.
  },
},
// ============================= COPIE ATÉ AQUI =============================


/* -----------------------------------------------------------------------------
 * BÔNUS: modelo para cadastrar um NOVO PARÂMETRO (uma 61ª categoria, por ex.)
 * -----------------------------------------------------------------------------
 * Use isto só se quiser ampliar o catálogo além dos 60 parâmetros atuais.
 * Depois de adicionar, é OBRIGATÓRIO voltar em TODAS as doenças do
 * BANCO_DOENCAS e preencher esse novo campo nelas também — se esquecer, o
 * `validarBancoDoencas()` vai avisar no console (rode com ?debug=1).
 * ----------------------------------------------------------------------------- */

// Se for um parâmetro OBJETIVO/BINÁRIO, adicione dentro de
// CATALOGO_PARAMETROS.binarios (escolha o grupo_tematico mais parecido):
meu_novo_parametro_binario: {
  label: "Texto que aparece como categoria no jogo",
  grupo_tematico: "etiologia", // ou: transmissao | predisposicao | natureza_lesao |
                                 //     sinais_clinicos | diagnostico | tratamento | prognostico
},

// Se for um parâmetro SUBJETIVO/GRADUAL (0-100), adicione dentro de
// CATALOGO_PARAMETROS.graduais:
meu_novo_parametro_gradual: {
  label: "Texto que aparece como categoria no jogo",
  grupo_tematico: "prognostico",
  criterio_referencia: "Descreva aqui o que 0 significa e o que 100 significa, " +
    "pra você (ou outro professor) conseguir dar a mesma nota no futuro sem ficar em dúvida.",
},
