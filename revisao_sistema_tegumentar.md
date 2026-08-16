# PatoVetZee — Sistema Tegumentar: 27 doenças novas (revisão pendente)

Sétimo lote — e o último dos sistemas que estavam esparsos. Banco foi de
161 → **188 doenças**. Tegumentar saiu de 4 (SCC cutâneo, otite por
Malassezia, mastocitoma canino, papilomatose bovina) para **31**, o maior
sistema do jogo hoje.

Esta é também a seção mais longa e mais "neoplasia-pesada" do seu
documento — por isso o lote saiu grande, com bastante peso em tumores
cutâneos (a própria seção 15, "Neoplasias de interesse", é uma aula
transversal que cruza referências com o Tegumentar).

## O que ficou de fora, e por quê

- **Lesões elementares primárias/secundárias** (mácula, pápula, nódulo,
  crosta, úlcera, liquenificação etc.) — são morfologia descritiva, não
  doenças.
- **Padrões histológicos de reação inflamatória** (dermatite
  perivascular, hiperplásica crônica, perianexial, espongiótica,
  pustular/vesicular, de interface, liquenoide, liquenoide de interface)
  — são esquemas de classificação histopatológica usados para
  *diagnosticar* uma doença, não doenças em si. Em vez de criar uma ficha
  para cada padrão, extraí as **doenças concretas citadas como exemplo**
  dentro de cada padrão (dermatite atópica, escabiose, demodicose,
  piodermite, pênfigo foliáceo, dermatofitose etc.).
- **Entidades muito raras/hiper-específicas de raça**: dermatose
  hiperplásica do West Highland White Terrier, foliculite do Bull
  Terrier, dermatose liquenoide psoriasiforme dos Springer Spaniels,
  dermatite facial dos gatos Persa/Himalaio, síndrome do comedão do
  Schnauzer, vasculopatia cutânea familiar do Pastor Alemão, ictiose —
  baixo rendimento didático fora de uma aula muito aprofundada de
  dermatologia; ficam como candidatas futuras.
- **Dermatoses secundárias a endocrinopatias já cobertas** (calcinose
  cutânea e as dermatoses atróficas de hipotireoidismo/
  hiperadrenocorticismo) — não dupliquei, já que a doença de base já
  está no banco no sistema Endócrino.
- **Alopecias diversas** (pós-traumática, psicogênica, por
  doxorrubicina) e **farmacodermias genéricas** — achados/reações, não
  doenças com identidade própria.
- **Vasculites/vasculopatias específicas** (urticária, telangiectasia,
  vasculite séptica, vasculopatia solar) e **paniculites específicas**
  (medicamentosa, vasculítica, pancreática) — consolidei em **duas
  fichas representativas**: "Vasculite cutânea imunomediada" e
  "Paniculite (pós-vacinal/traumática/estéril idiopática)", em vez de uma
  ficha por variante.
- **Impetigo e piodermite mucocutânea** — variantes/formas de
  apresentação da piodermite bacteriana; consolidadas na ficha única de
  piodermite.
- **Cistos foliculares, cisto dermoide, cisto de glândula apócrina** —
  achados incidentais, geralmente sem relevância clínica própria (mesmo
  critério já usado para excluir cistos ovarianos incidentais no lote de
  Reprodutor).
- **Tricoblastoma, tricoepitelioma, pilomatricoma, adenoma sebáceo,
  epitelioma sebáceo** — consolidados em **uma ficha**: "Tumor benigno de
  anexos cutâneos", já que são histologicamente distintos mas
  clinicamente muito parecidos (nódulos benignos, cura cirúrgica). O
  **carcinoma sebáceo** ficou separado como o contraste maligno.
- **Micobacteriose cutânea, sarcoma histiocítico** — reais, mas mais
  raros/nichados; ficam como candidatos futuros.
- **Leishmaniose cutânea** — não dupliquei; já existe leishmaniose
  visceral canina no banco (sistema hematopoiético/linfático).
- **SCC cutâneo, mastocitoma canino, TVT, papilomatose bovina** — já
  estavam no banco; não duplicados.
- **Tanatologia e alterações cadavéricas** (seção 16 do seu documento) —
  não é uma seção de doenças (algor mortis, rigor mortis, putrefação
  etc. são fenômenos post mortem, não achados diagnosticáveis num
  paciente vivo), então não gerou fichas. Foi a última seção do
  documento — com este lote, as 16 seções catalogadas por você já foram
  todas percorridas (as exclusões documentadas ficam registradas em cada
  revisão de lote).

## Pontos que mais valem sua conferência

- **Dermatite generalizada por Malassezia (canina)**: já existe no banco
  "Otite externa por Malassezia" (localizada ao ouvido). Criei esta ficha
  separada para a forma generalizada/cutânea difusa — são apresentações
  clínicas bem diferentes na prática, mas os 60 parâmetros ficam
  parecidos. Se preferir consolidar as duas em uma só, é um ajuste fácil.
  (Nota: você já havia pedido para excluir "malassezia felina"
  anteriormente — mantive o escopo aqui restrito à Canina, como sempre.)
- **Melanoma cutâneo canino vs. Melanoma oral canino** (já existente):
  modelei o cutâneo com prognóstico favorável e o oral com prognóstico
  desfavorável — reflete a diferença real de comportamento biológico
  (a maioria dos melanomas cutâneos caninos é benigna, ao contrário do
  oral, que é agressivo). Bom par para o modo prática.
- **Criptococose**: mantive no Tegumentar (apresentação nasal/cutânea é
  clássica em gatos), mas ela também tem componente respiratório e
  neurológico relevante — é uma doença multissistêmica na prática.
  Marquei `sinais_respiratorios_proeminentes: true` para refletir isso.
- **Histoplasmose**: coloquei em Canina (para equilibrar espécies com a
  Criptococose felina), mas é uma doença que afeta ambas as espécies.
  Se preferir a versão felina, é só avisar.
- **Histiocitoma cutâneo canino**: modelei com prognóstico muito
  favorável e sem necessidade de tratamento agressivo — reflete a
  regressão espontânea característica dessa neoplasia em cães jovens,
  um ponto didático rico (é a "exceção que não precisa de cirurgia").

## Testado

Integridade do banco (188 doenças), contagem por sistema confirmada via
`contarDoencasPorSistema()` (Tegumentar 31), e partida completa pela
interface real: 700/3100 (23% da pontuação ótima — esperado, é o maior
e mais competitivo sistema do jogo hoje), sem erros de console.

**Nota técnica**: o acesso direto ao arquivo local via `file://` no
navegador de teste parou de funcionar para este arquivo específico
(provavelmente por ele ter ultrapassado um limite de tamanho para
pré-visualização de arquivos fora da pasta de projeto — o arquivo já
passa de 590 KB). Contornei isso subindo um servidor estático local
temporário só para rodar os testes; não afeta o arquivo publicado nem o
funcionamento do jogo em produção.

## Resumo geral do projeto

Com este lote, todo o conteúdo do seu documento de 71 aulas foi
incorporado ao banco (respeitando as exclusões de processos gerais já
combinadas). O banco foi de 9 doenças (challenge original) para **188
doenças** distribuídas em 13 sistemas. Se quiser, posso levantar agora
quais entidades ficaram como "candidatas futuras" em todos os lotes
(consolidado num único documento) para você decidir se vale expandir
algum sistema específico mais à frente.
