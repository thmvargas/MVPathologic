# PatoVetZee — 9 doenças novas: endócrino + urinário (revisão pendente)

Adicionadas ao `BANCO_DOENCAS`. Banco agora com **37 doenças**. Passou na
checagem de integridade. Criei a categoria **"Endócrino"** no catálogo de
sistemas (não existia) — 7 das 9 doenças caem lá; as outras 2 (renais) vão
para **"Urinário"**, que agora tem 3 doenças e **destravou** no Modo por
Sistemas (antes só tinha a DRC felina, sozinha, insuficiente para jogar).

## Distribuição de espécie que escolhi

Como as 9 são endócrinas/renais (mais típicas de pequenos animais), sem
pista de espécie no seu pedido, distribuí para dar contraste entre cão e
gato: **Canina** — Hiperadrenocorticismo, Hipotireoidismo, Diabetes
insipidus, Hipoadrenocorticismo, Glomerulonefrite imunomediada. **Felina** —
Diabetes mellitus, Acromegalia, Hipertireoidismo, Necrose tubular aguda.
Se preferir outra distribuição (ex.: alguma também cadastrada em felino ou
canino), me avise que ajusto.

## Pontos que mais pesaram nas decisões (vale sua conferência)

- **Diabetes mellitus felina x canina**: cadastrei só a versão felina por
  ora (fisiopatologia tipo 2/resistência à insulina, ligada a obesidade —
  bem diferente da forma canina, tipo 1-símile). Se quiser a versão canina
  também, é só pedir — mantenho o mesmo padrão de duas fichas separadas
  que usei com FIV/FeLV.
- **Cura definitiva possível**: marquei `true` só para Diabetes mellitus
  felina (remissão verdadeira é bem documentada em gatos com diagnóstico
  precoce) e Necrose tubular aguda (reversível se a causa for removida a
  tempo) — todas as outras 7 ficaram `false`, já que endocrinopatias
  crônicas (Cushing, hipotireoidismo, Addison, hipertireoidismo\*,
  acromegalia) são manejadas com reposição/controle vitalício, não cura.
  \*Hipertireoidismo é exceção parcial: marquei `true` porque iodo
  radioativo/tireoidectomia podem ser curativos — mas o tratamento mais
  acessível na prática (metimazol) é só controle. Se achar que isso
  confunde mais do que ajuda, aviso que é fácil trocar para `false`.
- **Hipoadrenocorticismo — "predisposição em fêmeas não castradas"**:
  marquei `false` de propósito. Fêmeas têm predisposição reconhecida ao
  Addison, mas não é uma predisposição ligada a estar "não castrada" (ao
  contrário da piometra) — é só uma predisposição de sexo. Julguei que
  marcar `true` aqui distorceria o sentido da categoria.
- **Acromegalia felina — tratamento**: marquei
  `tratamento_exclusivamente_paliativo: true` porque, na prática da
  maioria das clínicas, hipofisectomia/radioterapia são pouco acessíveis e
  o manejo real costuma ser só controlar o diabetes secundário — mesmo a
  literatura descrevendo tratamentos definitivos. Reflete a rotina mais
  que o "ideal" — se preferir refletir o tratamento definitivo (menos
  realista, mas mais "livro-texto"), me avisa.
- **Glomerulonefrite imunomediada e Necrose tubular aguda**: montei como
  um bom par de contraste (crônica progressiva x aguda potencialmente
  reversível) — funcionam bem junto com a DRC felina já cadastrada no Modo
  por Sistemas "Urinário" (testei as 3 juntas, categorias automáticas
  saíram coerentes).

## Testado

- Integridade do banco (37 doenças, todos os 60 parâmetros + `sistema`
  válidos).
- Partida completa no Modo por Sistemas "Endócrino" (7 doenças) pela
  interface real: 400/600, sem erros.
- Seleção automática de categorias para "Urinário" (3 doenças) — auto-picker
  encontrou 3 categorias com boa variação entre as três.

## Próximo passo

Revise os pontos acima quando puder. Quer que eu já publique como está, ou
prefere ajustar algo (ex.: adicionar a versão canina de diabetes mellitus)
antes de eu publicar?
