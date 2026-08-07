# PatoVetZee — 17 doenças novas (revisão pendente)

Adicionei ao `BANCO_DOENCAS` em `patovetzee.html`. Passaram na checagem de
integridade (`validarBancoDoencas()` — 26 doenças no total, todos os 60
parâmetros presentes e válidos em cada uma). **Ainda não entram em nenhum
desafio** — o `DESAFIO_DO_DIA` continua usando só as 9 originais até você
escolher incluir alguma destas (ver `GUIA_MANUTENCAO.md`, seção 3).

Como da primeira vez: os valores abaixo são meu rascunho clínico, não a
palavra final — quero sua revisão antes de usar qualquer uma delas num
desafio de verdade.

## Decisão que tomei por conta própria — revise com atenção

Você pediu "FIV/FeLV felina" como uma doença só; cadastrei como **duas**
(`fiv_felina` e `felv_felina`), porque são vírus com comportamento clínico
bem diferente (FeLV é oncogênico e muito mais contagioso por contato
casual; FIV é mais lento e menos transmissível, principalmente por
mordida). Se você preferir uma ficha combinada, eu removo uma das duas e
ajusto.

## As 17 doenças

| id | Nome | Espécie | Pontos que mais pesaram na minha decisão |
|---|---|---|---|
| `otite_externa_malassezia_felina` | Otite externa por Malassezia (felina) | Felina | Menos comum que no cão; mantive `maior_prevalencia_felinos: false` porque a entidade "otite por Malassezia" ainda é predominantemente canina mesmo na versão felina. Vale seu olhar clínico aqui. |
| `toxoplasmose_felina` | Toxoplasmose felina | Felina | Zoonose relevante (risco em gestantes), transmissão fecal-oral/ambiental + transplacentária, multissistêmica. |
| `cinomose_canina` | Cinomose canina | Canina | Viral, altamente contagiosa, multissistêmica, prognóstico reservado especialmente com sinais neurológicos — marquei `cura_definitiva_possivel: false` pra refletir sequelas frequentes mesmo em sobreviventes. |
| `fiv_felina` | Imunodeficiência viral felina (FIV) | Felina | Curso lento (anos), transmissão por mordida, associação neoplásica **fraca** (marquei `doenca_neoplasica: false`) — contraste proposital com FeLV. |
| `felv_felina` | Leucemia viral felina (FeLV) | Felina | Contato casual (muito mais contagiosa que FIV), forte associação com linfoma/leucemia, transmissão vertical documentada. |
| `osteossarcoma_canino` | Osteossarcoma apendicular canino | Canina | Raças grandes/gigantes, altamente metastático (pulmão), tratamento padrão = amputação + quimio adjuvante, prognóstico reservado mesmo tratado. |
| `mastocitoma_canino` | Mastocitoma cutâneo canino | Canina | Comportamento muito variável por grau — usei valores "médios" nos graduais (ex. letalidade 40) sabendo que isso simplifica bastante a variação grau I-III. Talvez valha diferenciar por grau no futuro. |
| `diarreia_viral_bovina` | Diarreia viral bovina (BVD) | Bovina | Transmissão vertical é o ponto central (gera animais persistentemente infectados/PI) — é o principal mecanismo de manutenção da doença no rebanho. |
| `anemia_infecciosa_equina` | Anemia infecciosa equina (AIE) | Equina | Notificação obrigatória (teste de Coggins no Brasil) — marquei `requer_notificacao_obrigatoria: true`, único caso do banco até agora. Marquei `tratamento_essencialmente_de_suporte: false` porque a conduta real diante de positivo é isolamento/sacrifício por lei, não tratamento clínico — vale conferir se você concorda com essa leitura. |
| `papilomatose_bovina` | Papilomatose bovina | Bovina | Benigna, regressão espontânea na maioria dos casos — é a doença "mais branda" do lote (letalidade 2, invasividade de tratamento 5). |
| `leucose_enzootica_bovina` | Leucose enzoótica bovina | Bovina | Maioria dos portadores é assintomática a vida toda; só uma minoria desenvolve linfoma. Marquei os binários de sinais clínicos como `false` refletindo o padrão predominante (assintomático), não o caso raro sintomático — pode valer a pena discutir se isso é didaticamente a melhor escolha. |
| `pif_felina` | Peritonite infecciosa felina (PIF) | Felina | Historicamente quase sempre fatal, mas com os antivirais novos (GS-441524/molnupiravir análogos) a cura passou a ser possível — marquei `cura_definitiva_possivel: true`, o que é uma mudança recente e pode valer discussão se você quer refletir esse avanço ou manter a visão clássica. Também marquei `contagiosa_contato_direto: false` porque a PIF em si (a mutação) não se transmite gato a gato, só o coronavírus "comum" precursor — nuance didática importante que pode confundir sem contexto na aula. |
| `volvulo_gastrico_canino` | Síndrome de dilatação-vólvulo gástrico | Canina | Emergência cirúrgica agudíssima (velocidade de progressão 98), a mais "rápida" do banco. Marquei `cura_definitiva_possivel: true` porque a gastropexia é curativa/preventiva definitiva quando bem-sucedida. |
| `giardiase_canina` | Giardíase canina | Canina | Marquei `zoonose: true` de forma simplificada — o potencial zoonótico real depende do genótipo/assemblagem de *Giardia*, isso é uma simplificação didática que talvez mereça uma ressalva em aula. |
| `laminite_equina` | Laminite equina | Equina | Marquei `associada_uso_hormonios: true` pela ligação com corticoide como gatilho e com a forma endocrinopática (PPID/síndrome metabólica equina) — é a categoria mais "forçada" desse parâmetro no lote, vale seu crivo. Dor extrema (impacto na qualidade de vida 90). |
| `acidose_ruminal_bovina` | Acidose ruminal em bovinos | Bovina | Marquei `doenca_bacteriana: false` mesmo bactérias ruminais produtoras de lactato estarem envolvidas no mecanismo, porque entendo a doença em si como metabólico-nutricional, não uma "infecção bacteriana" — decisão de enquadramento que pode gerar debate. |
| `timpanismo_ruminal_bovino` | Timpanismo ruminal | Bovina | Progressão extremamente rápida (pode matar em minutos por compressão cardiorrespiratória) — junto com vólvulo gástrico, são as duas doenças "mais urgentes" do banco agora. |

## Padrão que reparei ao longo do preenchimento

Categorias como `maior_prevalencia_felinos` e `predisposicao_femeas_nao_castradas`
foram desenhadas pensando em cão/gato — para as doenças de bovino e equino
elas tendem a ficar `false` quase sempre, meio "sem graça" nesse eixo. Não é
um erro (a resposta é honestamente falsa), mas se você montar um desafio
misturando espécies de grande porte com essas categorias, pode valer a pena
evitar essas duas categorias específicas naquele dia — ou eu posso, se você
quiser, sugerir 2-3 categorias novas mais "neutras entre espécies" (ex.:
"doença de importância em produção/rebanho", "requer isolamento do
animal") para dar mais variação em desafios mistos. Me avisa se quiser que
eu monte isso.

## Próximo passo

Quando você revisar e confirmar (ou pedir ajustes), me diga se quer que eu
já monte um desafio de exemplo usando algumas dessas doenças novas — ou se
prefere só deixá-las no banco por enquanto, prontas pra quando você definir
o assunto da próxima aula.
