# PatoVetZee — Guia de manutenção

Este guia é pra você (ou qualquer outro professor do laboratório) conseguir
manter o jogo atualizado sem precisar reler todo o código. Três tarefas
cobrem 95% do que você vai fazer: **adicionar uma doença**, **trocar o
desafio do dia** e, mais raramente, **adicionar uma categoria nova**.

Arquivos desta pasta:

| Arquivo | Para que serve |
|---|---|
| `patovetzee.html` | O jogo em si — é o único arquivo que os alunos abrem. |
| `MODELO_NOVA_DOENCA.js` | Template pronto pra copiar e preencher uma doença nova. |
| `hungarian.js` | Cópia isolada do algoritmo, só pra você rodar `node hungarian.js` e conferir os testes sem abrir navegador. |
| `revisao_conteudo_patovetzee.md` | Documento de revisão do conteúdo original (histórico — não precisa editar). |
| `GUIA_MANUTENCAO.md` | Este arquivo. |
| `supabase_migration_002_doencas.sql` | Migração que cria a tabela `doencas` no Supabase e migra as que já existem — precisa rodar uma vez (ver seção 0). |
| `supabase_migration_003_tentativas_duelos.sql` | Migração que cria o acompanhamento de alunos (tabela `tentativas`) e o duelo 1v1 (tabela `duelos`) — precisa rodar uma vez, depois da 002 (ver seção 0). |
| `supabase_migration_004_categorias.sql` | Migração que permite criar categorias novas pelo painel de admin — precisa rodar uma vez, depois da 002 e 003 (ver seção 0.3). |

---

## 0. Painel de administração (o jeito mais fácil, recomendado)

Desde a migração 002, o banco de doenças pode ser gerenciado **direto pelo
jogo**, sem editar `patovetzee.html` nem fazer deploy — mudanças aparecem
pra todo mundo na hora.

**Configuração única** (só precisa fazer isso uma vez):

1. Abra o SQL Editor do seu projeto Supabase, cole o conteúdo de
   `supabase_migration_002_doencas.sql` inteiro e rode. Isso cria a tabela
   `doencas`, as permissões (só admin escreve, todo mundo lê) e já migra as
   doenças que existiam no jogo até agora.
2. No final do mesmo arquivo tem um passo manual: rode a linha `update
   public.perfis set is_admin = true where apelido = '...'` trocando pelo
   seu apelido de login no jogo.
3. Faça login no jogo normalmente. Uma aba **"🛠️ Administração"** aparece
   na tela inicial, só pra você.

**No dia a dia**, pelo painel de administração você pode:

- Buscar/filtrar doenças por nome, sistema ou espécie.
- Criar uma doença nova preenchendo um formulário (com os 60 parâmetros
  organizados por tema — etiologia, transmissão, predisposição etc.),
  em vez de editar JSON à mão.
- Editar qualquer doença existente.
- Excluir uma doença (o jogo bloqueia a exclusão se ela estiver no desafio
  diário oficial fixo no código, pra não quebrar o desafio da turma).

Se o Supabase cair ou a migração não tiver sido rodada ainda, o jogo
**continua funcionando normalmente** com o banco embutido no
`patovetzee.html` (`BANCO_DOENCAS_EMBUTIDO`) — o painel de admin é uma
camada extra, não uma dependência obrigatória. As seções 1 e 2 abaixo (editar
o arquivo à mão) continuam válidas como alternativa, ou para quem prefere
manter tudo versionado no HTML.

### 0.1 Cadastro obrigatório e acompanhamento em aula

Desde esta versão, é **obrigatório criar conta** (e-mail + senha) pra jogar
qualquer modo (desafio diário, Modo por Sistemas, Duelo) — sem isso não dá
pra saber quem é quem no acompanhamento. A tela de login mostra um aviso
pedindo e-mail institucional quando o uso é em aula. (Exceção: se o Supabase
não estiver configurado neste arquivo, o jogo libera modo convidado — não
tem como exigir login sem sistema de login.)

Depois de rodar `supabase_migration_003_tentativas_duelos.sql`, toda partida
completada (diário, sistema ou duelo) fica registrada. Pra ver o
desempenho da turma: **Administração → 📊 Desempenho dos alunos** — lista
todo mundo que jogou, em qualquer modo, com pontuação/eficiência/data, com
busca por aluno e filtro por modo. É separado do ranking público (que
continua só com o desafio diário oficial) porque o Modo por Sistemas sorteia
doenças diferentes pra cada aluno — comparar pontuação bruta ali não seria
justo, mas dá pra acompanhar quem praticou e como foi.

### 0.2 Duelo 1v1

Aba **"⚔️ Duelo 1v1"** na tela inicial (só aparece logado). Um aluno cria um
duelo — o jogo sorteia 9 doenças de todo o banco (não só de um sistema) + 9
categorias, igual ao Modo por Sistemas — e joga na hora. Isso gera um
código de 6 caracteres pra compartilhar. O colega entra com o código quando
quiser (não precisa ser ao mesmo tempo) e joga o **mesmo** conjunto de
doenças/categorias. Assim que os dois tiverem jogado, qualquer um vê o
comparativo lado a lado. Não entra no ranking oficial nem depende dos dois
estarem online juntos.

### 0.3 Adicionar categoria pelo painel (recomendado)

Depois de rodar `supabase_migration_004_categorias.sql`, a tela
**Administração → 🏷️ Categorias** deixa criar uma característica nova (a
"pergunta" que o jogador responde sobre a doença) sem editar código. Duas
coisas importantes:

- **Toda categoria nova entra automaticamente com valor padrão em TODAS as
  doenças já cadastradas** (binária = não/false; graduada = 0) — senão elas
  ficariam incompletas. Depois de criar, vá em cada doença relevante
  (Administração → editar a doença) e ajuste o valor de verdade.
- Categorias graduadas exigem o **critério de referência** (o que 0 e 100
  significam) — é o texto que ajuda a manter a nota consistente entre
  doenças diferentes, igual às ~8 categorias graduadas originais.

A seção 2 abaixo (editar `CATALOGO_PARAMETROS` no HTML à mão) continua
válida como alternativa — ela é a única forma de criar um **tema** novo
(hoje só dá pra encaixar a categoria num dos 8 temas já existentes pelo
painel).

---

## 1. Adicionar uma doença nova (editando o arquivo à mão)

1. Abra `MODELO_NOVA_DOENCA.js` e copie o bloco entre `COPIE A PARTIR DAQUI`
   e `COPIE ATÉ AQUI`.
2. Abra `patovetzee.html` num editor de texto (Notepad++, VS Code, etc.).
   Procure por `const BANCO_DOENCAS_EMBUTIDO = [` (seção 1, bem no início
   do `<script>`).
3. Cole o bloco copiado como mais um item da lista — **antes** do `];` que
   fecha o array — e coloque uma vírgula depois do item anterior, se não
   tiver.
4. Preencha `id` (um identificador único, sem espaço/acento — ex.:
   `cinomose_canina`), `nome` (o que o aluno vê), `especie` e `sistema`
   (um dos ids listados no comentário do modelo — é o que alimenta o "Modo
   por sistemas", ver seção 4 deste guia).
5. Percorra `parametros_binarios`: troque `false` por `true` sempre que a
   afirmação do comentário for verdadeira para essa doença.
6. Percorra `parametros_graduais`: troque cada `0` por um número de 0 a 100,
   seguindo o critério que está no comentário da linha.
7. Salve o arquivo e abra `patovetzee.html?debug=1` no navegador (adicione
   `?debug=1` no fim do endereço). Olhe o console (F12 → aba "Console"):
   - Se aparecer `[PatoVetZee] Banco de doenças OK: N doenças, todos os 60
     parâmetros presentes e válidos.` → está tudo certo.
   - Se aparecer um aviso amarelo (`console.warn`) citando o `id` da sua
     doença nova, algum campo ficou faltando, com tipo errado, ou com nome
     digitado errado — o próprio aviso lista exatamente o que falta
     corrigir.

**Importante:** só adicionar a doença ao `BANCO_DOENCAS` não a coloca no
desafio diário — ela só aparece lá quando entrar em `doencas_selecionadas`
de algum desafio (ver seção 3). Mas ela já entra automaticamente no **Modo
por sistemas** (ver abaixo), assim que tiver o campo `sistema` preenchido.

### Sobre o campo `sistema` e o Modo por sistemas

Cada doença tem um `sistema` (ex.: `sistema_digestorio`,
`sistema_tegumentar`) — é a mesma classificação que um curso de patologia
veterinária costuma usar para organizar o conteúdo por órgão/aparelho.
Doenças verdadeiramente multiorgânicas (raiva, cinomose, PIF, BVD etc.) vão
em `doencas_infecciosas_sistemicas` em vez de forçar um órgão só — use seu
critério clínico para decidir qual é "mais didático" quando não for óbvio.

O **Modo por sistemas** (botão na tela inicial) deixa o aluno escolher um
desses sistemas e monta, na hora, um desafio de estudo só com as doenças
daquele grupo — sem precisar de curadoria manual de categorias (o jogo
escolhe automaticamente as categorias com mais variação entre as doenças
daquele sistema). Um sistema só aparece habilitado na lista quando tiver
pelo menos `MIN_DOENCAS_MODO_SISTEMA` doenças (hoje = 3, ajustável no
código); antes disso ele aparece como "em construção (N/3)". Esse modo não
usa explicações escritas à mão — mostra uma frase gerada automaticamente a
partir do próprio dado ("Sim: no banco de dados, ... apresenta a
característica ..."). Não conta para o desafio diário nem para o ranking.

---

## 2. Adicionar uma categoria (parâmetro) nova

Faça isso só quando quiser ampliar além dos 60 parâmetros atuais — é mais
trabalhoso porque toda doença já cadastrada precisa ganhar esse campo.

1. Abra `patovetzee.html`, procure `const CATALOGO_PARAMETROS = {`.
2. Se for uma categoria **objetiva/binária** (verdadeiro ou falso), adicione
   uma linha dentro de `binarios`, no grupo temático que fizer mais sentido:
   ```js
   meu_novo_parametro: { label: "Texto que aparece no jogo", grupo_tematico: "etiologia" },
   ```
3. Se for uma categoria **subjetiva/gradual** (0 a 100, sua régua de
   especialista), adicione dentro de `graduais`:
   ```js
   meu_novo_parametro: {
     label: "Texto que aparece no jogo",
     grupo_tematico: "prognostico",
     criterio_referencia: "Descreva o que 0 significa e o que 100 significa.",
   },
   ```
4. **Obrigatório:** volte em **todas** as doenças do `BANCO_DOENCAS` e
   adicione esse mesmo campo (`meu_novo_parametro: false` ou `: 0`, com o
   valor certo para cada uma). Use `MODELO_NOVA_DOENCA.js` como referência de
   onde a chave ficaria na ordem.
5. Abra com `?debug=1` e confira o console — se esquecer alguma doença, o
   aviso `[PatoVetZee] Doença "..." tem problemas no banco de dados: faltando: meu_novo_parametro`
   vai te dizer exatamente qual.

---

## 3. Trocar o desafio do dia (o que os alunos jogam)

Procure `const DESAFIO_DO_DIA = {` em `patovetzee.html`. Edite:

- **`id` e `data`**: use a data do dia em que vai liberar o jogo, formato
  `"AAAA-MM-DD"` (ex.: `"2026-08-12"`). Esse valor é o que garante que todos
  os alunos vejam a mesma ordem de doenças/categorias naquele dia — troque
  sempre que publicar um desafio novo, mesmo que o conteúdo seja parecido
  com o anterior (senão a ordem embaralhada fica igual à do desafio
  antigo).
- **`titulo`**: um texto curto pra identificar o desafio (aparece no topo da
  tela inicial).
- **`doencas_selecionadas`**: lista de 9 ids de doença (do `BANCO_DOENCAS`)
  que vão participar. Hoje o banco tem exatamente 9 doenças, então essa
  lista é o banco inteiro — quando você tiver mais de 9 cadastradas, aqui é
  onde escolhe o subconjunto do dia (ex.: focar num assunto de aula
  específico).
- **`parametros_selecionados`**: lista de 9 `{ id, grupo }`, misturando
  parâmetros binários e graduais. Recomendo manter a mistura de 5-6
  binários + 3-4 graduais (constante `MIX_RECOMENDADO`, só um alerta — não
  trava o jogo se você fugir um pouco disso).
- **`explicacoes`**: `explicacoes[doencaId][parametroId]` = texto de 1-2
  frases, para cada uma das 9 doenças × 9 categorias escolhidas (81 textos).
  Se você deixar algum par sem explicação, o jogo mostra um texto genérico
  no lugar — não quebra, só fica menos rico para o aluno.

Depois de editar, abra com `?debug=1` e olhe o console — a linha
`[PatoVetZee] Checagem de qualidade do desafio "..."` te diz:

- quantas categorias ficaram "constantes" (todas as doenças com o mesmo
  valor — se passar de 3, o jogo avisa que o puzzle pode estar sem graça);
- quantas doenças têm um valor isolado (sem empate) nalguma categoria;
- se a mistura objetivo/gradual está dentro do recomendado.

Ajuste a escolha de parâmetros até essa checagem ficar satisfatória.

### Dica para variar o desafio sem mexer no conteúdo clínico

Como a pontuação nunca é armazenada (é sempre calculada a partir do banco),
trocar só a lista `parametros_selecionados` (mantendo as mesmas 9 doenças)
já gera um puzzle totalmente diferente. Você pode preparar vários desafios
com antecedência só variando essa lista + as explicações correspondentes.

---

## 4. Testar antes de publicar

1. Abra `patovetzee.html?debug=1` no navegador.
2. Confira no console:
   - `Banco de doenças OK` (sem avisos amarelos de doença/parâmetro).
   - `Todos os testes do húngaro passaram` (isso não muda entre edições de
     conteúdo — só quebraria se alguém mexesse no algoritmo em si).
   - A linha de "Checagem de qualidade do desafio" do dia que você acabou de
     montar.
3. Jogue uma rodada completa (as 9 escolhas) e confira se o resultado final
   faz sentido e se as explicações aparecem certinho.
4. Se quiser conferir só o algoritmo isoladamente (sem abrir navegador),
   rode `node hungarian.js` numa pasta com Node.js instalado — útil se você
   editar algo na lógica de pontuação e quiser um teste rápido.

---

## 5. Publicar para a turma

O jogo é um arquivo único (`patovetzee.html`), sem servidor/backend. Formas
simples de distribuir:

- **Arquivo direto**: enviar o `.html` por e-mail/Drive/Moodle e o aluno
  abre localmente no navegador (funciona até offline, exceto pela fonte
  decorativa do Google Fonts, que é cosmética).
- **Link único (recomendado se a turma for grande)**: hospedar em qualquer
  serviço de arquivo estático (GitHub Pages, Netlify, um espaço da própria
  universidade) e mandar o link — assim todo mundo abre a mesma versão sem
  precisar redistribuir arquivo.

Se quiser ajuda para configurar uma dessas opções de hospedagem, me avise
qual prefere que eu monto o passo a passo.
