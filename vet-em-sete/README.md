# Vet em Sete

Jogo diário de raciocínio diagnóstico em medicina veterinária: o aluno tem
**7 tentativas** para chegar ao diagnóstico de um caso clínico. A cada erro,
uma nova parte do caso aparece (histórico, anamnese, exame físico e exames
complementares escolhidos pelo aluno). Depois do diagnóstico vem a escolha do
tratamento e uma explicação didática.

Plano completo, esquema de dados e fórmula de pontuação: [`PLANO.md`](./PLANO.md).

## O que já funciona (Etapas 1 a 6)

- Partida em 7 tentativas com revelação progressiva, exames, autocompletar,
  feedback de proximidade, tratamento, pontuação explicada e compartilhar.
- Login sem senha com e-mail institucional, cadastro e aviso de privacidade.
- Caso do dia (um por dia, igual para todos), modos por semestre, treino e
  casos anteriores, com filtro de espécie.
- Estatísticas do aluno, ranking semanal e mensal, painel do professor com CSV.
- Painel de administração de casos, diagnósticos, agenda e professores.
- O gabarito nunca vai para o navegador; a pontuação é calculada no servidor.

## Rodar no seu computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
cd vet-em-sete
npm install
cp .env.example .env.local     # e preencha SEGREDO_PARTIDA (instrução no arquivo)
npm run dev                    # abre em http://localhost:3000
```

Para testar no celular na mesma rede Wi-Fi: `npm run dev -- -H 0.0.0.0` e
abra `http://IP-DO-COMPUTADOR:3000` no celular.

## Testes

```bash
npm test                    # pontuação, proximidade, motor, caso do dia, domínio de e-mail, ranking, painel, validação dos casos
npm run typecheck
npm run build && npm run e2e   # partida completa no navegador (celular e computador)
```

Acessibilidade: as telas principais e todas as fases da partida passam na
auditoria automática axe (WCAG 2.1 AA), e a partida pode ser jogada só com o
teclado.

## Onde ficam os dados (por enquanto)

| Arquivo | Conteúdo |
|---|---|
| `src/dados/diagnosticos.json` | Lista controlada de diagnósticos (nome, sinônimos, sistemas, categoria, agente) |
| `src/dados/casos/*.json` | Casos clínicos, um arquivo por caso |
| `src/lib/caso/esquema.ts` | Esquema do caso e regras que impedem aprovar caso com pendência |

A partir da Etapa 3 os dados passam para o Supabase, e na Etapa 6 você
edita tudo pelo painel de administração, sem mexer em arquivo.

## Publicar uma prévia na Vercel

1. Em [vercel.com](https://vercel.com), entre com o GitHub e clique em **Add New → Project**.
2. Escolha o repositório `MVPathologic`.
3. Em **Root Directory**, selecione `vet-em-sete`.
4. Em **Environment Variables**, cadastre `SEGREDO_PARTIDA` (gere um novo, não reutilize o do seu computador).
5. Clique em **Deploy**. A Vercel publica de novo a cada push.

## Configurar o login (uma vez só)

O Vet em Sete usa o mesmo projeto Supabase do PatoVetZee, com tabelas
próprias (prefixo `ves_`). Nada do PatoVetZee muda.

### 1. Criar as tabelas

Supabase → **SQL Editor** → **New query** → cole o conteúdo de
[`supabase/ves_001_login_partidas.sql`](./supabase/ves_001_login_partidas.sql) → **Run**.
Deve aparecer "Success. No rows returned".

### 2. Liberar o endereço do site

Supabase → **Authentication** → **URL Configuration** → em **Redirect URLs**,
clique em **Add URL** e adicione:

```
https://vet-em-sete.vercel.app/**
http://localhost:3000/**
```

Não mude o "Site URL" (ele é do PatoVetZee).

### 3. Modelo do e-mail de acesso

Supabase → **Authentication** → **Emails** → aba **Magic Link**:

- **Subject:** `Seu código do Vet em Sete`
- **Body** (apague o que estiver lá e cole):

```html
<h2>Vet em Sete</h2>
<p>Seu código de acesso:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Ou toque no link: <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Entrar no Vet em Sete</a></p>
<p>Se você não pediu este e-mail, ignore.</p>
```

O PatoVetZee não usa esse modelo (ele entra com senha), então a troca não o afeta.

### 4. Remetente dos e-mails (Gmail)

Sem isso, o Supabase só entrega e-mail para os membros da equipe do projeto,
e os alunos não recebem o código.

1. Crie uma conta Gmail só para o jogo (ex.: `vetemsete.unifeob@gmail.com`).
2. Nessa conta, ative a **verificação em duas etapas**
   (myaccount.google.com → Segurança).
3. Gere uma **senha de app** em myaccount.google.com/apppasswords
   (nome: "Supabase"). Copie os 16 caracteres.
4. Supabase → **Authentication** → **Emails** → **SMTP Settings** →
   **Enable custom SMTP**:
   - Sender email: o Gmail criado · Sender name: `Vet em Sete`
   - Host: `smtp.gmail.com` · Port: `465`
   - Username: o Gmail criado · Password: a senha de app
5. Supabase → **Authentication** → **Rate Limits**: suba "emails per hour"
   para 100.

Peça aos alunos para olhar a caixa de spam no primeiro acesso.

### 5. Chave secreta na Vercel

Supabase → **Project Settings** → **API Keys** → copie a chave
**service_role** (secreta; nunca cole em chat, e-mail ou código).

Vercel → projeto **vet-em-sete** → **Settings** → **Environment Variables**
→ **Add**: nome `SUPABASE_SERVICE_ROLE_KEY`, valor = a chave, marque
**Production** e **Preview**, **Sensitive** ligado → **Save**. Depois,
em **Deployments**, abra o mais recente → **⋯** → **Redeploy**.

As outras variáveis (URL, chave pública, domínios, professores) já estão
cadastradas na Vercel.

## Painel de administração (Etapa 6)

### Configuração única

1. Supabase → SQL Editor → rode [`supabase/ves_002_casos_admin.sql`](./supabase/ves_002_casos_admin.sql).
2. No jogo, entre como professor → **Administração de casos** → **Importar do repositório**.
   Isso copia para o banco os casos e diagnósticos que estão em `src/dados`. Pode
   clicar de novo sem problema: o que já está no banco não é alterado.

### Revisar e aprovar um caso

1. **Administração → Casos**, filtro **Rascunho**.
2. Abra o caso. O quadro no topo lista as **pendências** (campos "a revisar",
   fontes faltando, exames ou condutas insuficientes).
3. Corrija o que precisar. Para conferir um valor, troque pelo da fonte ou do
   seu laboratório e desmarque **A revisar**.
4. **Jogar como aluno** abre o caso como o aluno vê (usa a última versão salva).
5. **Salvar** guarda sem aprovar. **Aprovar** só fica ativo sem pendências.
6. Caso aprovado e alterado depois volta a rascunho (precisa de nova aprovação).
   Partidas em andamento continuam na versão em que começaram.

**Uso do caso**: "caso do dia" (reservado; entra no treino depois de usado) ou
"só treino" (nunca vira caso do dia).

### Outras telas

- **Diagnósticos**: lista controlada (nome, siglas, sistemas, categoria,
  agente). Não dá para excluir diagnóstico usado em algum caso.
- **Agenda**: fixar o caso de uma data; dias sem agendamento recebem sorteio.
- **Professores**: convidar colegas pelo e-mail (entram como professor).

## Casos e caso do dia

Só casos com `"status": "revisado"` entram no caso do dia. O sorteio é feito
na primeira visita de cada dia (horário de Brasília) e fica gravado na tabela
`ves_caso_do_dia`. Para fixar um caso numa data, use **Administração → Agenda**.

## Identidade visual

Segue o Brandbook UNIFEOB (dez. 2023):

- Paleta institucional na divisão 60 | 30 | 10: branco e cinzas, Azul Unifeob
  `#0018ff` e Rosa Destaque `#ff1863`. Cores definidas em `src/app/globals.css`.
- Logo + assinatura: logotipo oficial, ponto na cor da Escola Agro (`#96d30f`,
  Medicina Veterinária) e o nome "Vet em Sete" (`src/components/Marca.tsx`).
  O logotipo em `public/marca/` foi recortado da imagem oficial do modelo de
  apresentação, sem alterar a forma. Se a comunicação tiver o arquivo vetorial
  (SVG), basta substituir os PNGs.
- Fonte: a da marca é a Arson Pro (comercial). O site usa Montserrat, a opção
  livre mais próxima; se houver licença web da Arson Pro, ela é usada
  automaticamente ao ser incluída.
- Sem gradientes e sem sombras. Textos pequenos sobre rosa, verde e amarelo
  usam versões escuras dessas cores para manter o contraste AA.

## Aviso

Conteúdo didático produzido para graduação, sob curadoria de patologista
veterinário. Não substitui avaliação clínica.
