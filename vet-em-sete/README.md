# Vet em Sete

Jogo diário de raciocínio diagnóstico em medicina veterinária: o aluno tem
**7 tentativas** para chegar ao diagnóstico de um caso clínico. A cada erro,
uma nova parte do caso aparece (histórico, anamnese, exame físico e exames
complementares escolhidos pelo aluno). Depois do diagnóstico vem a escolha do
tratamento e uma explicação didática.

Plano completo, esquema de dados e fórmula de pontuação: [`PLANO.md`](./PLANO.md).

## Situação atual: Etapa 2 (jogo sem login)

- Um caso de exemplo completo (erliquiose monocítica canina, **em rascunho**).
- Revelação em 7 tentativas, escolha de exames a partir da 5ª, autocompletar,
  feedback de proximidade, tratamento, pontuação item a item, explicação e
  botão de compartilhar.
- O gabarito nunca vai para o navegador: o servidor revela uma camada por vez.

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
npm test          # pontuação, proximidade, motor do jogo, caso do dia, domínio de e-mail, validação dos casos
npm run typecheck
```

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

Supabase, login e aprovação de casos entram neste README nas próximas etapas.

## Aviso

Conteúdo didático produzido para graduação, sob curadoria de patologista
veterinário. Não substitui avaliação clínica.
