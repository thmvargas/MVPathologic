# PatoVetZee — Digestório/Fígado/Pâncreas: 43 doenças novas (revisão pendente)

Quarto lote. Banco foi de 90 → **133 doenças**. Como no seu material de
aula essas três áreas ficam em seções separadas, criei **duas categorias
novas** no Modo por Sistemas em vez de forçar tudo em "Digestório":

- **Digestório**: 5 → **25**
- **Hepatobiliar (fígado e vias biliares)**: 0 → **17** (nova, destravada)
- **Pâncreas**: 0 → **6** (nova, destravada)

## O que ficou de fora, e por quê

- **Entidades já cobertas por fichas existentes**: não dupliquei nada que
  já estava no banco (ex.: BVD, IBR, giardíase, hemoparasitoses etc. já
  cadastrados em outros sistemas).
- **Processos gerais/inespecíficos** (por acordo já combinado): tipos de
  estomatite/gengivite genéricos, obstipação inespecífica, diarreia
  inespecífica por causa não determinada — não viram ficha própria.
- **Itens de baixo rendimento didático ou muito raros** que aparecem no
  seu documento mas deixei de fora **por ora** (não descartados, só não
  priorizados neste lote): mucocele salivar canina, actinobacilose
  bovina, vólvulo intestinal canino, linfangiectasia intestinal canina,
  carcinoma de células escamosas oral felino, gasterofilose equina,
  coronavirose entérica bovina, criptosporidiose bovina, corpo estranho
  linear felino, hérnia diafragmática felina, salmonelose bovina,
  aflatoxicose canina, intoxicação por cobre ovina, colelitíase canina,
  granuloma eosinofílico felino, fenda palatina canina, papilomatose oral
  canina. Ficam como candidatos para um lote futuro, se você quiser.
- **Carcinoma de células escamosas genital equino, hermafroditismo etc.**
  não se aplicam aqui (já tratados no lote de Reprodutor).

## Pontos que mais valem sua conferência

- **Deslocamento de abomaso** modelado como cirúrgico, com
  `predisposicao_femeas_nao_castradas: true` (o quadro clássico é em
  vacas leiteiras periparto) — mas não é estritamente "não castrada" no
  sentido reprodutivo, é mais uma questão de manejo periparto. Pode valer
  revisar se esse campo é o mais adequado aqui ou se prefere deixar
  `false`.
- **Toxemia da prenhez ovina** classificada com `causa_hemorragia: false`
  e `causa_alteracao_degenerativa_cronica: false` — modelei como uma
  crise metabólica aguda (hipoglicemia/cetose), não como doença
  degenerativa crônica, mas ela tem uma base metabólica que se desenvolve
  ao longo da gestação. Ponto de leitura crítica.
- **Complexo rumenite-abscesso hepático bovino**: tratei como uma
  entidade única (a rumenite por acidose leva ao abscesso hepático via
  translocação bacteriana), já que didaticamente costumam ser ensinadas
  em conjunto. Se você prefere separar em duas fichas distintas
  (rumenite vs. abscesso hepático), me avise.
- **Síndrome de Zollinger-Ellison canina (gastrinoma)**: é rara na
  clínica, mas mantive porque tem alto valor didático como diferencial de
  úlcera péptica refratária — marquei `doenca_neoplasica: true` e
  `lesao_potencialmente_metastatica: true` (o gastrinoma pancreático tem
  potencial maligno relevante).
- **Xilitol vs. outras hepatotoxinas**: modelei a intoxicação por xilitol
  com progressão muito rápida (`velocidade_progressao: 90`) e
  hemorragia/coagulopatia proeminentes, distinguindo-a claramente da
  hepatopatia por cobre (crônica, lenta) e da seneciose bovina
  (crônica, cumulativa) — um contraste agudo x crônico que acho rico
  para o modo prática.
- **Carcinoma hepatocelular canino**: marquei `prognostico_favoravel:
  true` e `cura_definitiva_possivel: true` quando a forma **massiva** é
  ressecável (diferente do padrão nodular/difuso, pior prognóstico) — é
  uma simplificação que assume a apresentação mais didaticamente citada
  em aula. Vale sua confirmação.
- **Insuficiência pancreática exócrina (IPE) canina**: tratei como
  crônica, controlável mas incurável (reposição enzimática vitalícia),
  distinta da pancreatite aguda (crise, potencialmente fatal, mas com
  chance de cura do episódio).

## Testado

Integridade do banco (133 doenças), contagem por sistema confirmada via
`contarDoencasPorSistema()` (Digestório 25, Hepatobiliar 17, Pâncreas 6),
e partida completa pela interface real nos três sistemas novos/expandidos:

- **Digestório** (25 doenças): jogado até o fim, sem erros de console.
- **Hepatobiliar** (17 doenças): 700/1700 (41% da pontuação ótima),
  tela de resultado renderizou todas as 17 explicações corretamente.
- **Pâncreas** (6 doenças): 300/600 (50%), sem erros de console.

Nenhum erro no console em nenhuma das três partidas.

## Próximo sistema

Sistemas que ainda têm pouco conteúdo: **Musculoesquelético** (hoje 3),
**Nervoso** (hoje 3), **Tegumentar** (hoje 4). Me diga por onde seguir.
