# PatoVetZee — configurar login e ranking (Supabase)

Por que Supabase: é gratuito para o volume de uma turma (e continua barato se
crescer para várias turmas/semestres — plano pago começa em ~US$25/mês só se
você passar dos limites gratuitos, o que é bastante improvável aqui), usa
SQL puro (mais fácil de auditar/ajustar do que bancos "NoSQL"), e já vem com
autenticação por e-mail+senha pronta — não preciso escrever nem hospedar
nenhum servidor à parte, o jogo continua sendo só arquivos estáticos (como
já está no GitHub Pages), só que agora eles conversam com o Supabase pela
internet.

Eu não posso criar a conta por você (é uma das poucas coisas que faço por
princípio de não fazer no seu lugar), mas o processo é rápido — uns 10
minutos. Depois de feito, me manda só duas informações e eu termino toda a
parte de código.

## Passo 1 — Criar a conta e o projeto

1. Acesse **https://supabase.com** e clique em "Start your project" /
   "Sign up". Pode entrar com GitHub (você já tem conta, é o mais rápido) ou
   e-mail.
2. Depois de logado, clique em **"New project"**.
3. Preencha:
   - **Name**: `patovetzee` (ou o nome que quiser, é só interno)
   - **Database Password**: gere/anote uma senha forte (só é usada em
     conexões diretas ao banco — o jogo não precisa dela, pode até nunca
     usar de novo, mas guarde por segurança).
   - **Region**: escolha a mais próxima do Brasil (ex.: "South America
     (São Paulo)" se disponível na sua conta; senão qualquer região das
     Américas serve).
4. Clique em **"Create new project"** e espere 1-2 minutos até o projeto
   ficar pronto (ele mostra uma barra de progresso).

## Passo 2 — Rodar o schema (tabelas, permissões e rankings)

1. No menu lateral do projeto, clique em **"SQL Editor"**.
2. Clique em **"New query"**.
3. Abra o arquivo [`supabase_schema.sql`](./supabase_schema.sql) desta pasta,
   copie o conteúdo inteiro e cole no editor.
4. Clique em **"Run"** (ou `Ctrl+Enter`). Deve aparecer "Success. No rows
   returned" — isso confirma que as tabelas (`perfis`, `resultados`) e as
   views de ranking (`ranking_diario`, `ranking_semanal`, `ranking_mensal`)
   foram criadas.

Se aparecer algum erro, me mande a mensagem exata que eu ajusto o script.

## Passo 3 — Configurar autenticação por e-mail

1. No menu lateral, vá em **Authentication → Providers** (ou
   **Authentication → Sign In / Providers**, o nome varia um pouco por
   versão da interface).
2. Confirme que **Email** está habilitado (vem habilitado por padrão).
3. Em **Authentication → Settings** (ou **Emails**), você decide:
   - **Confirmar e-mail no cadastro** (padrão = ligado): o aluno recebe um
     link de confirmação antes de poder entrar. Mais seguro contra e-mails
     falsos, mas exige que ele confira a caixa de entrada.
   - Se quiser cadastro sem esse passo (mais rápido para testar em sala),
     dá pra desligar em **Authentication → Providers → Email →
     "Confirm email"**. Recomendo manter ligado quando for usar de verdade
     com a turma, e só desligar temporariamente se quiser testar rápido.

## Passo 4 — Pegar a URL e a chave pública do projeto

1. No menu lateral, vá em **Project Settings** (ícone de engrenagem) →
   **API**.
2. Copie dois valores:
   - **Project URL** (algo como `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (uma string longa, começa geralmente com `eyJ...`)

Essas duas informações **não são secretas** — elas são feitas para ficar
embutidas no código do navegador (é assim que o Supabase foi desenhado: a
segurança real vem das políticas de RLS que já estão no
`supabase_schema.sql`, não em esconder essa chave). Ainda assim, é só o
suficiente pra ler/gravar dentro do que as políticas permitem — nunca cole a
"service_role key" (uma outra chave, bem mais poderosa, que aparece na mesma
tela) em lugar nenhum do jogo.

## Passo 5 — Me mandar as duas informações

Me cole aqui no chat:
- `Project URL`
- `anon public` key

Eu coloco no `patovetzee.html`, testo o cadastro/login/ranking de ponta a
ponta, e publico a versão atualizada no link do GitHub Pages.

## Depois de publicado — o que revisar com o tempo

- **Limites do plano gratuito**: 50.000 usuários autenticados/mês, 500MB de
  banco, 5GB de tráfego/mês — folgado para uso de disciplina. Se algum dia
  isso passar a valer para muitas turmas simultâneas de várias disciplinas,
  dá pra acompanhar o uso em **Project Settings → Billing** e migrar pro
  plano Pro (~US$25/mês) só se necessário.
- **Projeto "pausa" após 1 semana sem uso**: no plano gratuito, um projeto
  sem nenhuma requisição por 7 dias entra em pausa automática. Ele volta
  sozinho na próxima vez que o jogo for acessado (só demora alguns segundos
  extra nesse primeiro acesso) — não perde dados. Se isso incomodar (ex.:
  período de férias longo), me avise que dá pra configurar algo pra manter
  ativo.
