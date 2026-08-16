# PatoVetZee — Sistema Reprodutor: 27 doenças novas (revisão pendente)

Terceiro lote, e o maior até agora. Banco com **90 doenças**. Reprodutor
saiu de 1 (só piometra canina) para **28**.

## O que ficou de fora, e por quê

- **Hermafroditismo verdadeiro e pseudo-hermafroditismos** — mantive só o
  **freemartinismo** (o mais didaticamente distinto e com fisiopatologia
  clara). Os outros são raros e se sobrepõem muito entre si nos 60
  parâmetros — ficariam quase idênticos como fichas.
- **Achados incidentais/pouco distintos**: agenesia/hipoplasia ovariana,
  cistos paraováricos e de inclusão germinal, ovários supranumerários,
  hipoplasia peniana/uretral, aplasia/hipoplasia de trato tubular
  (útero unicórnio, hímen imperfurado, ductos de Müller) — deixei de fora
  por serem raros e/ou não terem tratamento/prognóstico próprio muito
  distinto de simplesmente "achado ao exame".
- **Ooforite, perimetrite/parametrite, endometriose** — extensões de
  outras doenças já cadastradas (piometra, BVD, IBR) ou raras em Medicina
  Veterinária (endometriose é essencialmente um diagnóstico humano).
- **A extensa lista de subtipos histológicos de neoplasia mamária**
  (carcinoma complexo, tumor misto, simples, sólido, anaplásico,
  comedocarcinoma, cribriforme, micropapilar, adenoescamoso, mioepitelioma
  maligno, neoplasia mesenquimal) — consolidei em **3 fichas**: tumor
  benigno, carcinoma "geral" (representando os subtipos comuns) e carcinoma
  inflamatório (mantido separado por ser uma entidade clínica e
  prognosticamente muito distinta — mimetiza mastite, cirurgia é
  contraindicada). Se quiser diferenciar mais subtipos no futuro, dá pra
  desdobrar essas fichas.
- **Carcinoma de células escamosas genital equino**: consolidei a versão
  feminina (vulvar, égua) e a masculina (peniana) do documento em **uma
  só ficha**, já que os parâmetros seriam quase idênticos nos 60 campos.

## Pontos que mais valem sua conferência

- **Piometra bovina vs. canina**: modelei como entidades bem diferentes de
  propósito — a bovina **sem toxemia sistêmica típica** (a vaca costuma
  parecer clinicamente normal, só em anestro) e com **tratamento
  hormonal** (prostaglandina), não cirúrgico. É um contraste didático que
  acho valioso, mas quero sua confirmação de que reflete bem o que você
  ensina.
- **Brucelose canina**: marquei `tratamento_com_antimicrobianos_especificos: false`
  de propósito — mesmo com antibioticoterapia prolongada, recidiva é comum
  e cura bacteriológica não é garantida (é um ponto que costuma ser
  enfatizado em aula). Também marquei `requer_notificacao_obrigatoria: true`
  pela relevância zoonótica/reprodutiva em canis.
- **Tumor de células de Sertoli**: dei peso grande à síndrome de
  feminização + aplasia medular (`causa_hemorragia: true`,
  `alteracoes_hematologicas_caracteristicas: true`,
  `prognostico_favoravel: false`) — é o "grande vilão" hormonal entre os
  tumores testiculares, bem diferente do Leydig (quase sempre benigno e
  silencioso) e do seminoma (intermediário). Achei esse o contraste mais
  rico dos três.
- **Carcinoma mamário canino "geral"**: como consolidei vários subtipos
  numa ficha só, tive que escolher um prognóstico "médio" — marquei
  `prognostico_favoravel: false` e `cura_definitiva_possivel: false`
  refletindo que uma fração relevante dos casos tem comportamento
  agressivo, mas isso simplifica a variabilidade real (grau/estadiamento
  importam muito). Vale sua leitura crítica aqui.

## Testado

Integridade do banco (90 doenças), auto-seleção de categorias (28
categorias para as 28 doenças) e partida completa pela interface real
(1000/2700, 37%, sem erros).

## Próximo sistema

Sistemas que ainda têm pouco conteúdo: **Musculoesquelético** (hoje 3),
**Nervoso** (hoje 3), **Tegumentar** (hoje 4). Digestório/Fígado/Pâncreas
também é uma seção grande do seu documento que ainda não toquei. Me diga
por onde seguir.
