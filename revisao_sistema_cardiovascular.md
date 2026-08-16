# PatoVetZee — Sistema Cardiovascular: 11 doenças novas (revisão pendente)

Segundo lote. Banco agora com **63 doenças**. Cardiovascular saiu de 1
(só dirofilariose) para **12** — bem jogável agora.

## O que ficou de fora, e por quê

- **Respostas adaptativas do miocárdio** (dilatação, hipertrofia
  concêntrica/excêntrica como consequência de outras doenças) — são
  processos/mecanismos, não doenças primárias com etiologia própria.
- **Aterosclerose / arteriosclerose** — mudanças degenerativas
  vasculares gerais, mesmo critério.
- **Transposição dos troncos arteriosos** — deixei de fora por ser rara e
  muito complexa; fácil de acrescentar depois.
- **Miocardites por causa específica** (bacteriana, necrotizante por
  toxoplasmose, eosinofílica parasitária, hemorrágica por carbúnculo,
  linfocitária por parvovirose) — a de toxoplasmose e a de parvovirose já
  são manifestações das doenças `toxoplasmose_felina` e `parvovirose_canina`
  já cadastradas (não dupliquei). "Carbúnculo sintomático" (a causa da
  miocardite hemorrágica) vou trazer no lote do Musculoesquelético, onde
  ele se encaixa melhor como entidade própria (é uma mionecrose sistêmica,
  não uma doença cardíaca primária).

## Pontos que valem sua conferência

- **CIA e CIV**: marquei `tratamento_cirurgico_indicado: false` e
  `cura_definitiva_possivel: false` refletindo que a maioria dos casos
  (defeitos pequenos/restritivos) é acompanhada clinicamente, não operada
  — diferente do PDA, onde cirurgia é o padrão. Se você ensina esses casos
  com ênfase diferente, me avisa.
- **Tetralogia de Fallot**: marquei `tratamento_exclusivamente_paliativo: true`
  porque correção cirúrgica definitiva é rara/muito especializada na
  prática — manejo clínico (flebotomia, beta-bloqueador) é o mais comum.
- **Retículo-pericardite traumática bovina**: mesma lógica da tuberculose
  — doença de alto impacto econômico (`impacto_economico_tratamento: 70`)
  por ser causa importante de descarte de vacas leiteiras.
- **Cardiomiopatia dilatada canina**: cadastrei só a forma
  genética/idiopática (a mais ensinada, Doberman/Dogue Alemão) — não incluí
  a forma nutricional por deficiência de taurina/dieta *grain-free* como
  ficha separada. Se quiser, posso adicionar como entidade própria (é um
  contraste didático interessante: reversível com suplementação, diferente
  da forma genética).

## Testado

Integridade do banco (63 doenças), auto-seleção de categorias e partida
completa de 12 doenças pela interface real (500/1200, 42%, sem erros).

## Próximo sistema

O próximo mais vazio é **Reprodutor** (hoje só 1 doença — piometra). Sigo
por ele, ou prefere outra ordem?
