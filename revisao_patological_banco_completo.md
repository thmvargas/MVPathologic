# Patological — banco completo (215 doenças, revisão pendente)

Portei o resto do banco do PatoVetZee pro Patological: **39 → 215
doenças**, mesma cobertura dos 13 sistemas.

## Como derivei os dados das 176 doenças novas

- **Letalidade, reversibilidade, cura, zoonose**: puxados direto dos
  mesmos campos já existentes no PatoVetZee (`letalidade_nao_tratada`,
  `reversibilidade_lesao`, `cura_definitiva_possivel`, `zoonose`) — sem
  reinventar critério clínico, é o mesmo já revisado neste projeto.
- **Contagiosa**: `true` se a doença tem `contagiosa_contato_direto`,
  `transmitida_por_vetores` **ou** `transmissao_ambiental_fomites` no
  PatoVetZee — combina os três jeitos de "se espalhar" num único sim/não,
  já que o Patological não distingue o mecanismo de transmissão.
- **Categoria etiológica**: derivada automaticamente dos parâmetros
  binários já existentes sempre que possível (`doenca_viral` →
  infecciosa_viral, `doenca_bacteriana` → infecciosa_bacteriana,
  `doenca_neoplasica` → neoplásica, `etiologia_hereditaria_genetica` →
  congênita/genética, `doenca_metabolica` → metabólica/endócrina,
  `causa_alteracao_degenerativa_cronica` → degenerativa, etc.) — **175 das
  176** doenças caíram nessa derivação automática (pelo menos 1 categoria).

## As ~40 exceções (sem categoria óbvia — atribuí por julgamento clínico)

O PatoVetZee não tem parâmetro binário pra "tóxica", "traumática/mecânica"
nem "imunomediada" — então toda doença cuja causa é intoxicação, evento
mecânico/obstrutivo ou processo autoimune/imunomediado não teve nenhuma
categoria derivada automaticamente. Atribuí manualmente pra essas ~40,
com critério consistente:

- **Tóxica**: intoxicações explícitas (xilitol, NaCl, fotossensibilização
  hepatógena), acidose ruminal (excesso de carboidrato fermentável),
  úlceras gástricas (lesão química/ácida), pancreatite aguda canina
  (indiscrição alimentar), necrose tubular aguda felina (a genérica, sem
  toxina especificada no nome — mecanismo é o mesmo).
- **Traumática/mecânica**: timpanismo ruminal, torção/prolapso uterino,
  deslocamento de abomaso, intussuscepção, corpo estranho GI, urolitíase
  (canina e ovina obstrutiva), nefrolitíase felina, tromboembolismo
  arterial felino (obstrução mecânica de vaso).
- **Metabólica/endócrina**: hipotireoidismo, Addison, cisto folicular
  ovariano, hiperplasias hormônio-dependentes (endometrial cística,
  fibroadenomatosa mamária, prostática benigna), pseudociese, toxemia da
  prenhez, polioencefalomalácia (deficiência de tiamina), encefalopatia
  hepática, doença do músculo branco (deficiência de selênio/vit. E).
- **Imunomediada**: vasculite cutânea imunomediada, tríade felina,
  púrpura hemorrágica equina, paniculite (pós-vacinal), complexo
  granuloma eosinofílico felino.
- **Congênita/genética**: freemartinismo (quimerismo XX/XY).
- **Cistite idiopática felina**: essa é literalmente "idiopática" por
  definição — não force nenhuma categoria de verdade; marquei
  `metabolica_endocrina` como aproximação (modelo fisiopatológico
  neuroendócrino ligado a estresse é uma das teorias mais aceitas), mas é
  a atribuição mais fraca/arbitrária do lote — se quiser, posso deixar
  essa doença sem categoria (célula sempre vermelha na comparação) em vez
  de forçar um rótulo que não é bem estabelecido.

Nenhuma doença ficou sem NENHUMA categoria — todas têm pelo menos 1 tag
pra comparação funcionar.

## Testado

- Banco completo valida limpo: **215 doenças**, mesma distribuição por
  sistema do PatoVetZee (31 tegumentar, 28 reprodutor, 25 digestório...
  até 4 hematopoiético/linfático), sem duplicata, sem categoria/sistema
  desconhecido.
- Partida completa pela interface real com o banco de 215: doença do dia
  sorteada automaticamente (Orquite/epididimite bacteriana canina),
  palpite errado (Piometra canina) com todas as 8 células conferidas
  contra cálculo manual, palpite certo finalizando em 2 tentativas.
- Testei especificamente uma doença com categoria atribuída manualmente
  (Vasculite cutânea imunomediada → "Imunomediada") pra confirmar que as
  categorias novas (tóxica/traumática-mecânica/imunomediada, que não
  apareciam no lote de 39) renderizam e comparam certinho.
- Sem erros de console em nenhum teste.

## Passo seu (Supabase)

Te mandei `supabase_migration_patological_002_resto_do_banco.sql` — insere
as 176 doenças novas (a 001 já tinha as 39 originais, essa completa o
banco). Precisa rodar pra turma jogar com as 215 doenças de verdade.
