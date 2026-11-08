# Vet em Sete — Plano de arquitetura (Etapa 1)

Documento para aprovação antes de qualquer código. Nada aqui foi implementado
ainda. As decisões marcadas com **[decidir]** dependem das respostas da seção 9.

---

## 1. Visão geral da arquitetura

```
Navegador (celular/PC)
   │  só recebe o que já foi revelado
   ▼
Next.js na Vercel (App Router, TypeScript)
   ├─ páginas (React Server Components + componentes cliente)
   ├─ "motor do jogo" no servidor (server actions / route handlers)
   │     revela camadas, valida palpite, calcula pontos
   └─ chave service_role só no servidor
   ▼
Supabase (Postgres + Auth por link mágico/código + Storage para imagens)
```

### Princípio central: o gabarito nunca vai para o navegador

No Hipotle e similares, o caso inteiro costuma ir para o navegador e um aluno
curioso acha a resposta no DevTools. Aqui, o caso fica no servidor:

- A tabela `casos` **não** tem leitura pública. Só o servidor lê (service_role).
- A cada ação do aluno (palpite, exame escolhido, pular), o servidor registra a
  ação na `partida`, decide o que revelar e devolve só aquele trecho.
- Diagnóstico, explicação e classificação dos tratamentos só são enviados no
  fim da partida.
- A pontuação é calculada no servidor. O aluno não consegue forjar resultado
  no ranking.

Na Etapa 2 (sem login) o mesmo motor roda no servidor com o caso de exemplo em
arquivo JSON e o estado da partida guardado num cookie assinado. Na Etapa 3 o
estado passa para a tabela `partidas`.

### Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js (versão estável atual) + TypeScript | Servidor e interface no mesmo projeto, deploy nativo na Vercel |
| Estilo | Tailwind CSS v4 com os tokens da identidade visual | Paleta centralizada, sem sombra/gradiente por padrão |
| Fontes | Lora 600 (títulos) e Inter (corpo) via `next/font` | Carregadas localmente, sem piscar |
| Ícones | Lucide (traço fino, `strokeWidth 1.5`) | Linha, monocromático, recolorível |
| Banco e login | Supabase (plano gratuito) | Postgres, RLS, link mágico e código de 6 dígitos |
| Validação | Zod | Esquema do caso validado ao salvar no admin e nos testes |
| Testes | Vitest (unidade) + Playwright (fluxo de uma partida) | Partes críticas pedidas na seção 9 do briefing |

### Onde fica o código

Subpasta `vet-em-sete/` dentro deste repositório (`MVPathologic`). Na Vercel o
projeto aponta para essa pasta como "Root Directory". O PatoVetZee e o
Patológical continuam como estão, no GitHub Pages, sem nenhuma alteração.
**[decidir: subpasta aqui ou repositório próprio]**

---

## 2. Rotas (telas)

| Rota | Tela |
|---|---|
| `/` | Início: modos de jogo, streak, link para estatísticas |
| `/hoje` | Escolha da espécie (só espécies com caso do dia) |
| `/hoje/[especie]` | Partida do caso do dia |
| `/semestre` e `/semestre/[n]` | Casos por semestre, com filtro de espécie |
| `/treino` | Caso aleatório com filtros (espécie, semestre, sistema) |
| `/arquivo` | Casos do dia anteriores (jogados em modo treino) |
| `/jogar/[partidaId]` | Tela da partida (comum a todos os modos) |
| `/entrar` | E-mail institucional, envio de link + código |
| `/cadastro` | Nome, semestre, turma, aceite de privacidade |
| `/eu` | Estatísticas do aluno |
| `/ranking` | Geral, por semestre, por turma; semanal e mensal |
| `/professor` | Painel do professor + exportação CSV |
| `/admin/casos`, `/admin/casos/[id]` | Lista, edição, revisão e aprovação de casos |
| `/admin/diagnosticos` | Lista controlada de diagnósticos e atributos |
| `/admin/agenda` | Calendário do caso do dia |
| `/privacidade` | Aviso de privacidade (LGPD) |

---

## 3. Esquema de dados

### 3.1 Tabelas

```
instituicoes      id, nome, dominios_email text[], ativa
perfis            id (= auth.users.id), nome, apelido, email, semestre (1–6),
                  turma, instituicao_id, papel ('aluno'|'professor'),
                  aceite_privacidade_em, criado_em
turmas            id, instituicao_id, nome, semestre, ativa        (lista fechada para o cadastro)
diagnosticos      id (slug), nome, sinonimos text[], especies text[],
                  sistemas text[], categoria, agente_grupo, agente_genero,
                  agente_especie, ativo
casos             id, titulo_interno, status, versao, conteudo jsonb (esquema 3.2),
                  especie, grupo_especie, semestre, sistema, dificuldade,
                  diagnostico_id, criado_por, revisado_por, revisado_em, atualizado_em
casos_historico   caso_id, versao, conteudo jsonb, editado_por, editado_em   (auditoria)
caso_do_dia       data (America/Sao_Paulo), grupo_especie, caso_id   unique(data, grupo_especie)
partidas          id, user_id (nulo na Etapa 2), caso_id, caso_versao, modo
                  ('diario'|'semestre'|'treino'|'arquivo'), data_caso,
                  acoes jsonb (palpites, exames, pulos, em ordem),
                  tratamento_marcado text[], acertou, tentativa_acerto,
                  pontos jsonb (detalhe item a item), pontos_total,
                  conta_ranking bool, iniciada_em, finalizada_em
                  unique(user_id, caso_id, data_caso) quando modo = 'diario'
```

Colunas "achatadas" em `casos` (espécie, semestre, sistema...) existem só para
filtrar rápido; o conteúdo completo fica em `conteudo` e é validado por Zod.

**RLS (resumo):**
- `casos`, `caso_do_dia` futuros: sem leitura pelo navegador. Só servidor.
- `diagnosticos`: leitura pública só de `id, nome, sinonimos` (o autocompletar
  precisa; os atributos de proximidade ficam no servidor).
- `partidas`: aluno lê só as próprias; ninguém grava pelo navegador (só o servidor).
- `perfis`: aluno lê/edita o próprio; professor lê todos da instituição.
- Ranking e estatísticas: views/funções que expõem apelido e números, nunca e-mail.

### 3.2 Esquema de um caso (`conteudo`)

```ts
type ValorRevisavel<T> = { valor: T; a_revisar?: boolean; nota_revisao?: string };

type Caso = {
  id: string;                        // ex.: "cao-erliquiose-001"
  status: "rascunho" | "em_revisao" | "revisado" | "arquivado";
  versao: number;

  // Paciente (tentativa 1)
  especie: "canina" | "felina" | "equina" | "bovina" | "ovina" | "caprina" | "suina" | "aves";
  grupo_especie: "caes" | "gatos" | "equinos" | "ruminantes" | "suinos" | "aves";
  raca: string;
  idade: string;                     // "4 anos", "18 meses", "lote de 35 dias"
  sexo: "macho" | "fêmea" | "macho castrado" | "fêmea castrada" | "lote misto";
  peso?: ValorRevisavel<string>;
  queixa_principal: string[];        // palavras-chave curtas

  // Metadados de ensino
  semestre: 1 | 2 | 3 | 4 | 5 | 6;
  sistema: Sistema;                  // sistema principal (lista da seção 3.3)
  dificuldade: 1 | 2 | 3;
  tags?: string[];

  // Tentativas 2 a 4
  historico: Bloco[];                // ambiente, manejo, alimentação, vacinação, vermifugação, contactantes
  anamnese: Bloco[];                 // evolução, sistemas, medicações em uso
  exame_fisico: {
    parametros: Parametro[];         // FC, FR, TR, TPC, mucosas, hidratação, escore corporal...
    achados: Bloco[];                // por sistema
  };

  // Tentativas 5 a 7
  exames: Exame[];                   // 6 a 10 opções por caso

  // Gabarito
  diagnostico_id: string;            // ligado à lista controlada
  diferenciais: { diagnostico_id: string; como_descartar: string }[];  // geram o "muito perto"

  // Tratamento
  tratamentos: Conduta[];            // 8 a 14 opções

  // Fim de partida
  explicacao: {
    resumo: string;
    fisiopatologia: string;
    pistas: { achado: string; por_que_importa: string }[];
    comentario_exames: string;
    comentario_tratamento: string;
  };
  referencias: Referencia[];
  revisao: { autor: string; revisor?: string; revisado_em?: string; observacoes?: string };
};

type Bloco = { titulo: string; itens: string[] };

type Parametro = {
  nome: string;                      // "Frequência cardíaca"
  valor: string; unidade?: string;
  referencia?: string;               // "70–120 bpm"
  fonte?: string;                    // id de uma Referencia
  alterado?: "alto" | "baixo" | "anormal";
  a_revisar?: boolean;
};

type Exame = {
  id: string;
  tipo: "hemograma" | "bioquimica" | "urinalise" | "citologia" | "histopatologia"
      | "radiografia" | "ultrassonografia" | "sorologia" | "pcr" | "coproparasitologico"
      | "necropsia" | "outro";
  nome: string;                      // "Bioquímica sérica (função renal e hepática)"
  classificacao: "relevante" | "pouco_util" | "desnecessario";
  resultado: {
    tabela?: { analito: string; valor: string; unidade: string;
               referencia: string; fonte: string; alterado?: "alto" | "baixo";
               a_revisar?: boolean }[];
    descricao?: string[];            // laudo descritivo (imagem, citologia, necropsia)
    conclusao?: string;
    imagens?: { url: string; legenda: string; credito: string }[];
  };
  comentario_didatico: string;       // usado na explicação final
};

type Conduta = {
  id: string;
  texto: string;                     // "Doxiciclina 10 mg/kg VO a cada 24 h por 28 dias"
  tipo: "farmaco" | "suporte" | "manejo" | "cirurgia" | "eutanasia" | "sanitaria";
  classificacao: "adequado" | "aceitavel" | "desnecessario" | "contraindicado";
  justificativa: string;
  dose?: { texto: string; fonte: string; a_revisar?: boolean };
};

type Referencia = { id: string; citacao: string; paginas?: string; url?: string };
```

Regras checadas automaticamente pelo validador (Zod + testes):

- Todo valor laboratorial tem `referencia` e `fonte`; se faltar, o caso não
  pode sair de rascunho.
- Toda dose tem `fonte` ou `a_revisar: true`.
- Nenhum caso com algum `a_revisar: true` pode ser marcado como "revisado".
- Pelo menos 2 exames relevantes, 1 pouco útil e 1 desnecessário; pelo menos 1
  conduta contraindicada.
- `diagnostico_id` e todos os diferenciais existem na lista controlada.

Observação: acrescentei a classe **"desnecessário"** no tratamento (além de
adequado, aceitável e contraindicado). Sem ela, a estratégia ótima seria marcar
tudo que não é perigoso.

### 3.3 Lista controlada de diagnósticos e feedback de proximidade

Atributos de cada diagnóstico:

| Atributo | Valores |
|---|---|
| `sistemas` | tegumentar, digestório, hepatobiliar, pancreático, respiratório, cardiovascular, urinário, reprodutor, nervoso, musculoesquelético, endócrino, hematopoiético/linfático, oftálmico, multissistêmico |
| `categoria` | infecciosa viral, infecciosa bacteriana, infecciosa fúngica, parasitária, neoplásica, metabólica/endócrina, tóxica, degenerativa, congênita/genética, imunomediada, nutricional, traumática/mecânica, idiopática |
| `agente_grupo` | ex.: "Rickettsiales", "Parvoviridae", "Enterobacteriaceae", "Nematoda – Strongylida" |
| `agente_genero` | ex.: "Ehrlichia", "Leptospira", "Babesia" |

Mesmas categorias e sistemas que já uso no Patológical, com três acréscimos
(nutricional, idiopática, oftálmico/multissistêmico), para poder aproveitar
aquele banco.

Etiquetas mostradas após palpite errado:

| Etiqueta | Regra | Cor |
|---|---|---|
| Sistema | **igual** (mesmo sistema principal), **parcial** (sistemas se cruzam), **diferente** | esmeralda / âmbar / neutro |
| Categoria | **igual** ou **diferente** (infecciosa viral x bacteriana = "parcial": ambas infecciosas) | idem |
| Agente | **mesmo gênero**, **mesmo grupo**, **diferente**; não aparece se nenhum dos dois for infeccioso/parasitário | idem |
| Muito perto | palpite está em `diferenciais` do caso | âmbar com contorno |

Cor nunca é o único sinal: cada etiqueta tem texto ("Sistema: igual") e ícone
de linha (visto, meio círculo, traço).

Autocompletar: busca sem acento e sem maiúsculas em `nome` e `sinonimos`
("DRC" → "Doença renal crônica"). Só aceita item da lista. Palpite repetido é
bloqueado e não consome tentativa. Combobox acessível (setas, Enter, Esc,
leitor de tela).

---

## 4. Fluxo da partida

| Tentativa | Revelado antes do palpite |
|---|---|
| 1 | Paciente + queixa principal |
| 2 | + Histórico |
| 3 | + Anamnese |
| 4 | + Exame físico |
| 5, 6, 7 | Aluno escolhe 1 exame da lista → resultado aparece → palpite |

- Botão **"Pular"**: consome a tentativa sem palpitar (para quem quer ver a
  próxima camada). **[proposta, confirmar]**
- Blocos já revelados ficam visíveis e recolhíveis, cada um com seu acento
  (cartão no tom claro, contorno de 1px, título no acento):
  queixa **vinho**, histórico **azul**, anamnese **violeta**, exame físico
  **âmbar**, exames complementares **esmeralda**. Para resultados do jogo:
  acerto **esmeralda sólido** (texto areia), "perto" **âmbar**, conduta
  contraindicada **carmim**. Como esmeralda e âmbar aparecem nos dois papéis,
  as etiquetas de resultado são sólidas e os blocos de pista são em tom claro,
  para não confundir. Ajusto na Etapa 2 vendo na tela.
- Acertou → etapa de tratamento (marcar condutas, confirmar) → explicação.
- Errou as 7 → diagnóstico revelado → tratamento sem pontuação → explicação.
- Partida interrompida pode ser retomada (estado salvo no servidor).

---

## 5. Fórmula de pontuação (proposta)

```
Total = Diagnóstico + Exames + Tratamento         (mínimo 0, máximo 900)
```

**Diagnóstico** (só se acertar):

| Acertou na | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Não acertou |
|---|---|---|---|---|---|---|---|---|
| Pontos | 700 | 600 | 500 | 400 | 300 | 200 | 100 | 0 |

**Exames** (cada exame pedido nas tentativas 5–7, só se acertar o diagnóstico):

| Classificação | Pontos |
|---|---|
| Relevante | +40 |
| Pouco útil | 0 |
| Desnecessário | −20 |

Garantia: acertar antes nunca vale menos que acertar depois com os melhores
exames (tentativa 4 = 400; tentativa 5 com exame relevante = 340; tentativa 6
com 2 relevantes = 280; tentativa 7 com 3 relevantes = 220).

**Tratamento** (teto 200):

```
A = nº de condutas "adequado" do caso
acertos = (adequadas marcadas) + 0,5 × (aceitáveis marcadas)
bruto   = 200 × min(1, acertos / A)
penal   = 50 × (contraindicadas marcadas) + 10 × (desnecessárias marcadas)
Tratamento = max(0, round(bruto − penal))
```

- Percentual do compartilhamento = Tratamento / 200.
- Se não acertou o diagnóstico: etapa de tratamento existe, mostra o
  gabarito, mas vale 0.
- Modo treino e arquivo: pontos calculados e mostrados, mas fora do ranking.

**Explicação ao aluno** (exemplo):

```
Diagnóstico na 5ª tentativa ............ 300
Exame: Hemograma (relevante) ............ +40
Tratamento: 3 de 4 condutas adequadas ... 150
  Marcou "Dexametasona" (contraindicado)  −50
Total ................................... 440
```

**Ranking:** soma dos pontos dos casos do dia (só casos "revisados") no
período, semanal (segunda a domingo) e mensal, horário de Brasília. Desempate:
maior nº de acertos, depois menor média de tentativas.

**Streak:** dias consecutivos (horário de Brasília) com pelo menos um caso do
dia concluído, de qualquer espécie.

---

## 6. Caso do dia e fuso horário

- "Hoje" é sempre calculado em `America/Sao_Paulo` (função única `hojeBR()`,
  testada inclusive na virada 23:59 → 00:00 e com servidor em UTC).
- Professor agenda no `/admin/agenda` qual caso cai em cada dia e grupo de espécie.
- Dia sem agendamento: **[decidir]** proposta = sorteio automático,
  determinístico pela data, entre casos revisados daquela espécie ainda não
  usados como caso do dia; se não houver, a espécie some da tela `/hoje`.
- Uma partida oficial por aluno, por espécie, por dia.

---

## 7. Contas, perfis e LGPD

- **Login sem senha**: o aluno digita o e-mail; recebe um e-mail com **link e
  código de 6 dígitos**. O código resolve um problema comum no celular: o link
  abre dentro do app do Gmail/Outlook, num navegador diferente de onde o aluno
  começou, e o login falha.
- **Restrição de domínio em duas camadas**:
  1. Servidor do jogo recusa e-mail fora de `ALLOWED_EMAIL_DOMAINS` antes de
     pedir o envio.
  2. Gancho "antes de criar usuário" no próprio Supabase (função Postgres),
     para barrar quem tentar criar conta chamando a API do Supabase direto.
- **Professor**: e-mail em `PROFESSOR_EMAILS` → papel "professor" no primeiro
  login. Admin de casos = professor.
- **Variáveis de ambiente** (`.env.example` documentado):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_EMAIL_DOMAINS`, `PROFESSOR_EMAILS`,
  `INSTITUICAO_PADRAO`, `NEXT_PUBLIC_SITE_URL`, `TZ_JOGO=America/Sao_Paulo`.
- Expansão para outras instituições: tabela `instituicoes` com domínios; a
  variável de ambiente vira só a semente inicial. Ranking e painel já filtram
  por instituição.
- **LGPD**: página `/privacidade` (quais dados, para quê, quem vê, por quanto
  tempo, como pedir exclusão); aceite registrado no cadastro; ranking mostra
  apelido, nunca e-mail; nome real só para o professor; botão "excluir minha
  conta" em `/eu`.

---

## 8. Painéis

**Estatísticas do aluno (`/eu`)**: partidas, taxa de acerto, média de
tentativas, streak atual e recorde, histograma de acerto por tentativa (1–7 e
"não acertou"), desempenho por sistema e por espécie.

**Painel do professor (`/professor`)**:
- Filtros: instituição, semestre, turma, período, modo.
- Tabela por aluno (partidas, acerto, média de tentativas, pontos, último acesso).
- Casos e sistemas com mais erros.
- Exames mais pedidos por caso (com a classificação de cada um).
- Condutas mais marcadas, destacando as contraindicadas.
- Exportação CSV de cada tabela e das partidas brutas (separador `;` e UTF-8
  com BOM, para abrir direto no Excel em português).

**Administração (`/admin`)**:
- Casos: lista com filtros e status; editor por seções (paciente, histórico,
  anamnese, exame físico, exames, gabarito, tratamento, explicação,
  referências); campos "a revisar" destacados; botão "Pré-visualizar como
  aluno" (joga o caso sem salvar); botão "Aprovar" (só habilita sem
  pendências); histórico de versões.
- Diagnósticos: CRUD com atributos e sinônimos, aviso se o diagnóstico está em
  uso por algum caso.
- Agenda: calendário mensal por grupo de espécie.
- Importar/exportar casos em JSON (para eu entregar lotes e você revisar fora
  do sistema, se preferir).

---

## 9. Testes automatizados

| Área | O que é testado |
|---|---|
| Pontuação | todas as faixas de tentativa, exames, teto e piso do tratamento, monotonicidade (acertar antes nunca vale menos), não acertou = 0 |
| Proximidade | sistema igual/parcial/diferente, categoria, agente por gênero/grupo, "muito perto", diagnóstico não infeccioso sem etiqueta de agente |
| Caso do dia | data em São Paulo com servidor em UTC, virada da meia-noite, sorteio determinístico, espécie sem caso |
| Domínio de e-mail | domínios permitidos, maiúsculas, subdomínio falso (`unifeob.pro.br.evil.com`), espaços |
| Validador de caso | caso de exemplo passa; caso com valor sem referência ou com "a revisar" não pode ser aprovado |
| Fluxo (Playwright) | partida completa no celular: 7 camadas, exame, palpite, tratamento, explicação, compartilhar |

---

## 10. Lote inicial de casos (Etapa 6)

Proposta: **30 casos**, todos em "rascunho".

| Grupo | Casos | Exemplos de tema (a ajustar com você) |
|---|---|---|
| Cães | 9 | erliquiose monocítica, parvovirose, DRC, cinomose, hiperadrenocorticismo, piometra, DAPP, mastocitoma, intoxicação por anticoagulante |
| Gatos | 6 | DTUIF obstrutiva, lipidose hepática, esporotricose, hipertireoidismo, FeLV/linfoma, PIF |
| Equinos | 5 | cólica por compactação, garrotilho, laminite, anemia infecciosa equina, babesiose/theileriose |
| Ruminantes | 6 | tristeza parasitária bovina, hipocalcemia puerperal, mastite, raiva, haemoncose em ovinos, timpanismo |
| Suínos | 2 | circovirose (PCVD), erisipela |
| Aves | 2 | coccidiose, doença de Newcastle (diferenciais com influenza aviária) |

Distribuição por semestre depende do que cada semestre já estudou (pergunta 6).
Valores de referência sempre com fonte; dose ou valor sem certeza sai como
"a revisar".

---

## 11. Etapas

| Etapa | Entrega | Precisa de você |
|---|---|---|
| 2 | Jogo jogável sem login, 1 caso de exemplo completo, motor no servidor, testes de pontuação e proximidade | Revisar o caso de exemplo e jogar no celular |
| 3 | Login, cadastro, estatísticas, caso do dia | Criar o projeto Supabase e o SMTP (passo a passo no README) |
| 4 | Semestre, treino, arquivo, filtros | — |
| 5 | Ranking, painel do professor, CSV | — |
| 6 | Admin de casos + lote de 30 casos em rascunho | Revisar e aprovar os casos |
| 7 | Acabamento visual, acessibilidade, deploy final na Vercel | Conectar a Vercel ao GitHub (passo a passo no README) |

Desde a Etapa 2 já dá para publicar uma prévia na Vercel, para você testar no
celular.
