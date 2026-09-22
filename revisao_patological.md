# Patological — jogo novo, lote inicial (revisão pendente)

Novo jogo, arquivo separado (`patological.html`), estilo Spotle: adivinhe
a doença veterinária do dia comparando atributos a cada palpite. Botão de
ida/volta na tela inicial de cada jogo.

## Decisões de arquitetura (conforme combinado)

- **Login compartilhado, conteúdo separado**: mesmo projeto Supabase do
  PatoVetZee — login e a tabela `perfis` (apelido, is_admin) são os
  mesmos, então quem já tem conta num dos dois jogos já entra logado no
  outro (sessão do Supabase Auth persiste por origem no navegador, não por
  arquivo). As tabelas `patological_doencas` e `patological_tentativas`
  são **próprias**, sem nenhuma relação com `doencas`/`tentativas` do
  PatoVetZee.
- **RLS**: `patological_doencas` é leitura pública/escrita só-admin (mesmo
  padrão de `doencas`). `patological_tentativas` é leitura/escrita só do
  próprio aluno + leitura total pro admin (mesmo padrão de `tentativas`) —
  já deixei pronto pra um futuro painel do professor, mesmo sem construir
  a tela ainda.

## A mecânica

8 atributos comparados por palpite: espécie, sistema, categoria etiológica
(pode ter mais de uma — comparação parcial em amarelo quando há
sobreposição sem ser conjunto idêntico), zoonose, contagiosa, letalidade
(0-100, com seta ↑/↓ e cor por proximidade), cura definitiva possível,
reversibilidade da lesão (0-100, mesmo esquema de cor/seta). Tentativas
ilimitadas — pontuação é "em quantos palpites você acertou". Tem grade de
compartilhamento estilo Wordle (emoji coloridos + botão "copiar
resultado").

## Lote inicial: 39 doenças (~3 por sistema)

Escolhi doenças "bandeira" de cada um dos 13 sistemas, priorizando as que
já existem no banco do PatoVetZee — puxei letalidade/cura/reversibilidade
de lá pra manter o mesmo critério clínico já validado, e derivei
zoonose/contagiosa a partir dos mesmos parâmetros binários já cadastrados
(`zoonose`, `contagiosa_contato_direto`, `transmitida_por_vetores`,
`transmissao_ambiental_fomites`). A "categoria etiológica" é nova pra este
jogo (11 categorias: infecciosa viral/bacteriana/parasitária/fúngica,
neoplásica, degenerativa, congênita/genética, tóxica, traumática/mecânica,
metabólica/endócrina, imunomediada) — atribuí por julgamento clínico,
podendo ter mais de uma por doença (é o que permite o "amarelo" de match
parcial).

Esse lote é uma amostra deliberadamente pequena pra validar a mecânica
antes de portar as ~215 doenças inteiras do PatoVetZee — como combinamos.

## Testado

- `validarBancoDoencas()`-equivalente: 39 doenças, sem duplicata, sem
  campo faltando, todas as categorias dentro do catálogo válido.
- Partida completa pela interface real (modo convidado, Supabase
  desligado só pra testar sem exigir login): 3 palpites até acertar a
  doença do dia sorteada automaticamente (Peritonite infecciosa felina),
  cores/setas de cada célula conferidas uma a uma contra o cálculo manual
  — todas batem exatamente.
- Persistência: localStorage trava o replay do dia ("Você já jogou"),
  "Ver resultado novamente" reconstrói a grade certinho, "Jogar de novo
  (prática)" não sobrescreve o resultado oficial.
- Validação de palpite inválido (nome que não bate com nenhuma doença)
  mostra erro e não trava a partida.
- Responsivo: testado em 375px de largura — achei e corrigi um bug visual
  (texto de categoria/sistema longo estourando a célula colorida; corrigido
  com `overflow-wrap: break-word`).
- Link cruzado PatoVetZee ↔ Patological testado nos dois sentidos, sem
  erros de console.

## O que falta (próximos passos, não bloqueiam o lançamento)

- Painel de admin pra editar/adicionar doenças pelo navegador (hoje só dá
  pra editar direto no `patological.html` + SQL).
- Painel do professor pra acompanhar tentativas da turma — a tabela e a
  RLS já estão prontas, falta só a tela.
- Portar as ~215 doenças do PatoVetZee pro Patological, depois que você
  validar que a mecânica está boa com esse lote de 39.

## Passo seu (Supabase)

Te mandei `supabase_migration_patological_001.sql` — cria as duas tabelas
novas (`patological_doencas`, `patological_tentativas`) e insere as 39
doenças. Precisa rodar antes de qualquer aluno conseguir jogar de verdade
(sem isso, o jogo funciona só com o banco embutido, sem salvar tentativa
nenhuma).
