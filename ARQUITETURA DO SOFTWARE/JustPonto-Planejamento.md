# JustPonto — Sistema de Justificativas de Não Registro de Ponto
### Planejamento de Desenvolvimento Assistido por IA (Google Antigravity)

**Versão:** 1.0  
**Stack:** NestJS (backend/API) + Supabase (PostgreSQL + Storage)  
**Estratégia:** *Mock-first* — desenvolver e testar com dados mockados, depois plugar o banco real.  
**Status:** Rascunho para execução

---

## Como usar este documento

Ele tem três camadas, do "o quê" ao "como construir":

1. **Parte I — PRD/SPEC**: o produto, os perfis, as regras de negócio e os fluxos.
2. **Parte II — Arquitetura técnica**: como NestJS e Supabase se encaixam, módulos, segurança, e-mail e a estratégia mock-first.
3. **Parte III — Plano de execução no Antigravity**: as *Rules*, os *Workflows* e a sequência de tarefas (com prompts prontos) para você delegar ao agente, uma de cada vez.

Os scripts SQL (`01_schema.sql` e `02_seed.sql`) acompanham este pacote para você rodar no Supabase **depois** que a aplicação estiver validada com mocks.

---

# PARTE I — PRD / SPEC

## 1. Visão Geral do Produto

O JustPonto é uma aplicação web interna que permite a colaboradores **registrar justificativas** para ausências de marcação de ponto (esquecimento, atestado, falha de equipamento, etc.), encaminha cada justificativa para **aprovação do gerente**, disponibiliza ao **RH** as decisões para ajuste do banco de horas, e dá à **Direção** uma visão analítica completa. É um sistema B2B/interno, com controle de acesso por perfil.

**Proposta de Valor Central:** substituir e-mails soltos e planilhas por um fluxo único, rastreável e auditável de justificativa → aprovação → ajuste de ponto.

## 2. Problema a Ser Resolvido

- **Hoje:** justificativas chegam por e-mail, WhatsApp ou papel; o gerente aprova informalmente; o RH não tem registro consolidado para ajustar o ponto; a Direção não enxerga padrões (quem mais falta, motivos recorrentes).
- **Dores:** retrabalho, perda de comprovantes, falta de trilha de auditoria, ajustes de ponto manuais e sujeitos a erro, ausência de indicadores.
- **Oportunidade:** centralizar o fluxo reduz risco trabalhista (comprovação documentada) e dá dados para decisão.

## 3. Personas (Perfis de Usuário)

| Perfil | O que faz no sistema | Permissões |
|---|---|---|
| **Colaborador** | Cria justificativas e acompanha o status delas | Criar e visualizar **as próprias** justificativas |
| **Gerente** | Recebe notificação por e-mail e aprova/reprova | Ver justificativas **da sua equipe**; aprovar/reprovar |
| **RH** | Consulta justificativas aprovadas/reprovadas para ajustar o ponto | Ver **todas** as avaliadas; marcar como "ajuste lançado" |
| **Direção** | Visão completa + relatórios analíticos | Ver **todas** (pendentes/aprovadas/reprovadas) + relatórios |

## 4. Objetivos e Métricas de Sucesso

| Objetivo | Métrica | Meta |
|---|---|---|
| Agilizar aprovação | Tempo médio entre criação e decisão | < 48h |
| Rastreabilidade | % de justificativas com trilha de auditoria completa | 100% |
| Adoção | % de ausências justificadas pelo sistema (vs. fora dele) | > 90% em 3 meses |
| Qualidade do dado | % de justificativas com comprovante quando exigido | 100% |

## 5. Escopo de Funcionalidades

### 5.1 IN SCOPE (MVP)

**Módulo Autenticação & Acesso**
- Login por e-mail e senha (JWT).
- Autorização por perfil (RBAC) em todas as rotas.
- *Prioridade: MVP.*

**Módulo Justificativas (Colaborador)**
- Tela inicial listando as próprias justificativas com status (pendente/aprovada/reprovada).
- Botão **Nova Justificativa** abrindo popup com: **Tipo de Ocorrência** (lista pré-cadastrada), **Data de Ocorrência** (date), **Justificativa** (texto), **Anexos** (upload de comprovante).
- Validação: todos os campos obrigatórios, **exceto anexo** (mas anexo torna-se obrigatório se o tipo de ocorrência exigir — ver regra de negócio RN-03).
- *Prioridade: MVP.*

**Módulo Aprovação (Gerente)**
- Lista de justificativas **pendentes** da equipe.
- Ação aprovar/reprovar com comentário opcional.
- Registro de quem avaliou e quando.
- *Prioridade: MVP.*

**Módulo Notificações**
- Ao criar justificativa, dispara e-mail para o(s) gerente(s) responsável(is).
- Log de envio (sucesso/falha).
- *Prioridade: MVP.*

**Módulo RH**
- Visão de todas as justificativas **aprovadas e reprovadas**.
- Filtro por colaborador, período e status.
- Marcação "ajuste de ponto lançado" (controle operacional do RH).
- *Prioridade: MVP.*

**Módulo Direção / Relatórios**
- Visão de **todas** as justificativas em qualquer status.
- Relatórios: justificativas por colaborador; **dias e horas** justificados; motivos mais frequentes; taxa de aprovação por gerente.
- *Prioridade: MVP (visão) + Fase 2 (gráficos avançados/export).*

**Cadastros de apoio**
- Tipos de ocorrência (motivos) — gerenciáveis por RH/Direção.
- Usuários e vínculo colaborador→gerente.
- *Prioridade: MVP.*

### 5.2 OUT OF SCOPE (nesta versão)

| Funcionalidade | Motivo | Fase futura |
|---|---|---|
| Integração com relógio de ponto / folha | Complexidade e dependência de fornecedor | Fase 3 |
| App mobile nativo | MVP é web-first (responsivo já atende) | Fase 2 |
| Aprovação em múltiplos níveis (gerente + diretor) | Fluxo simples primeiro | Fase 2 |
| SSO / login com Google corporativo | Login próprio resolve o MVP | Fase 2 |
| Assinatura digital do comprovante | Não essencial para o fluxo | Fase 3 |

## 6. Jornadas Principais

**Jornada A — Colaborador cria justificativa**
1. Faz login → cai na lista das suas justificativas com status.
2. Clica em **Nova Justificativa** → popup.
3. Preenche tipo, data, justificativa e (se aplicável) anexo → envia.
4. Sistema cria a justificativa como **pendente**, grava anexo no Storage e dispara e-mail ao gerente.
5. Colaborador vê a nova justificativa na lista como "pendente".

**Jornada B — Gerente avalia**
1. Recebe e-mail → faz login → vê pendências da equipe.
2. Abre uma justificativa, lê descrição e baixa anexo.
3. **Aprova** ou **Reprova** com comentário opcional.
4. Status muda; trilha de auditoria registra autor e horário; (opcional) e-mail ao colaborador.

**Jornada C — RH e Direção**
1. RH filtra justificativas aprovadas/reprovadas e lança o ajuste no ponto (fora do sistema ou marcando como lançado).
2. Direção abre relatórios e analisa dias/horas justificados por colaborador e motivos recorrentes.

## 7. Regras de Negócio (RN)

- **RN-01** — Toda justificativa nasce com status `pendente`.
- **RN-02** — Apenas o **gerente do colaborador** (ou perfil Direção) pode aprovar/reprovar; RH não altera status, apenas consulta.
- **RN-03** — Se o **tipo de ocorrência** tiver `exige_anexo = true` (ex.: atestado), o anexo passa a ser **obrigatório**.
- **RN-04** — Colaborador só enxerga as **próprias** justificativas; gerente só as **da sua equipe**; RH e Direção veem todas (RH só as já avaliadas).
- **RN-05** — Mudança de status grava registro em `justificativa_historico` (auditoria).
- **RN-06** — Justificativa avaliada (aprovada/reprovada) **não** pode ser editada pelo colaborador.
- **RN-07** — Campos obrigatórios na criação: tipo, data, descrição. Anexo conforme RN-03.

## 8. Requisitos Não-Funcionais

- **Segurança:** senhas com bcrypt; JWT com expiração; autorização por perfil em **toda** rota; anexos acessíveis só via URL assinada temporária; validação/sanitização de uploads (tipo e tamanho).
- **Performance:** respostas de API < 500ms nas listagens com paginação.
- **Auditabilidade:** toda transição de status rastreável.
- **LGPD:** dados pessoais e atestados são sensíveis — acesso restrito por perfil, retenção definida, e nada de comprovante exposto publicamente.
- **Disponibilidade:** alvo 99,5%.

## 9. Questões em Aberto (decidir antes/durante o build)

- [ ] **Horas justificadas:** o formulário pedido não tem campo de horas, mas a Direção quer relatório de "dias e horas". Proposta: adicionar **período** (dia inteiro / parcial) e, se parcial, **hora início/fim**. *(Já incluído no schema — confirmar se entra no MVP.)*
- [ ] Notificação vai para **o gerente direto** do colaborador ou para **todos os gerentes**? (Schema suporta vínculo direto via `gerente_id`.)
- [ ] O ajuste de ponto é feito **dentro** do sistema (marcação) ou só **fora** (RH lança em outro sistema)?
- [ ] Provedor de e-mail transacional: **Resend**, **SendGrid** ou **SMTP** próprio?
- [ ] Haverá frontend nesta etapa ou só a API + Swagger? (Plano abaixo trata o frontend como Fase 2 opcional.)

---

# PARTE II — ARQUITETURA TÉCNICA

## 10. Visão de alto nível

```
[ Cliente / Frontend ]  ←HTTP/JSON→  [ NestJS API ]  ──→  [ Supabase ]
   (Fase 2: React/Next)                  │  ├─ Postgres (dados)
                                         │  └─ Storage (anexos)
                                         └──→ [ Provedor de E-mail ]
```

**Decisão de arquitetura (importante):** o **NestJS é o dono da autenticação e da autorização**. Ele se conecta ao Supabase usando a **service role key** (acesso de servidor) e o **Storage** para anexos. A autorização é feita por **Guards** do Nest (não por RLS), o que simplifica o MVP. *(Alternativa: usar Supabase Auth + RLS e o Nest apenas validar o JWT do Supabase — documentada como opção de Fase 2.)*

## 11. Estrutura de módulos (NestJS)

```
src/
├── main.ts
├── app.module.ts
├── config/                 # carregamento de env, validação
├── common/
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── decorators/         # @Roles(), @UsuarioAtual()
│   ├── interceptors/
│   └── enums/              # PerfilUsuario, StatusJustificativa, Periodo
├── data/                   # *** camada mock-first ***
│   ├── repositorio.interface.ts
│   ├── mock/               # implementações em memória + seed mockado
│   └── supabase/           # implementações reais (Postgres/Storage)
├── auth/                   # login, JWT, estratégia
├── usuarios/
├── tipos-ocorrencia/
├── justificativas/         # criar, listar-por-perfil, aprovar/reprovar
├── anexos/                 # upload/download (mock → Storage)
├── notificacoes/           # e-mail (mock → provedor real)
└── relatorios/             # agregações para a Direção
```

## 12. Estratégia *Mock-first* (o coração do seu pedido)

A regra de ouro: **nenhum módulo de negócio fala direto com o Supabase**. Todos falam com uma **interface de repositório**. Existem duas implementações da mesma interface, e uma variável de ambiente decide qual carregar:

```ts
// .env
DATA_SOURCE=mock        // troque para "supabase" depois de rodar os scripts SQL
```

- `DATA_SOURCE=mock` → repositórios em memória, com arrays seedados (usuários, tipos, justificativas de exemplo). E-mail e upload são "fakes" que logam no console. **Tudo testável sem banco.**
- `DATA_SOURCE=supabase` → repositórios reais (Postgres + Storage) e e-mail real.

Vantagem: você desenvolve e valida 100% do fluxo, e a migração para o banco é **trocar uma variável** + rodar `01_schema.sql` e `02_seed.sql`. Nenhuma regra de negócio muda.

> Padrão técnico: use **provedores do Nest** com `useClass`/`useFactory` baseados em `DATA_SOURCE`, ou um `DataModule` que exporta a implementação correta. Mantenha **DTOs e entidades de domínio idênticos** entre mock e Supabase.

## 13. Modelo de dados (resumo)

| Tabela | Papel |
|---|---|
| `usuarios` | Pessoas + perfil + vínculo `gerente_id` |
| `tipos_ocorrencia` | Motivos pré-cadastrados (com flag `exige_anexo`) |
| `justificativas` | Registro central (status, período, horas, avaliação) |
| `anexos` | Metadados do comprovante (arquivo vai pro Storage) |
| `justificativa_historico` | Trilha de auditoria das mudanças de status |
| `notificacoes` | Log de e-mails disparados |

DDL completo em `supabase/01_schema.sql`; seed em `supabase/02_seed.sql`.

## 14. Endpoints principais (contrato da API)

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| POST | `/auth/login` | público | Login, retorna JWT |
| GET | `/justificativas/minhas` | colaborador | Lista as próprias |
| POST | `/justificativas` | colaborador | Cria (dispara e-mail) |
| GET | `/justificativas/pendentes` | gerente | Pendências da equipe |
| PATCH | `/justificativas/:id/avaliar` | gerente/direcao | Aprova/reprova + comentário |
| GET | `/justificativas` | rh/direcao | Lista com filtros |
| GET | `/tipos-ocorrencia` | autenticado | Lista motivos ativos |
| POST | `/anexos/:justificativaId` | colaborador | Upload de comprovante |
| GET | `/anexos/:id` | autorizado | URL assinada de download |
| GET | `/relatorios/resumo` | direcao | Agregações (dias/horas/motivos) |

## 15. Segurança aplicada (checklist)

- bcrypt nas senhas; nunca logar senha/hash.
- `JwtAuthGuard` global + `RolesGuard` com `@Roles('gerente', 'direcao')` por rota.
- Validação de payload com `class-validator` (DTOs).
- Upload: limitar MIME (pdf/jpg/png) e tamanho (ex.: 5MB); nome de arquivo saneado.
- Anexos servidos por **URL assinada** com expiração — nunca link público.
- CORS restrito ao domínio do frontend.
- Segredos só em `.env` (fora do versionamento).

---

# PARTE III — PLANO DE EXECUÇÃO NO ANTIGRAVITY

O Antigravity é *agent-first*: você descreve um objetivo de alto nível na **Agent Manager**, o agente gera um **Implementation Plan** e um **Task List** (artefatos que você revisa antes de aprovar), executa, e **verifica** (inclusive abrindo o browser). A chave para um bom resultado é: **(1)** fixar regras do projeto uma vez, **(2)** entregar **uma tarefa por vez**, na ordem de dependência, **(3)** revisar o Implementation Plan antes do *Proceed*.

## 16. Setup inicial (uma vez)

1. Crie a pasta do projeto e abra como **Workspace** no Antigravity.
2. Modo de agente recomendado: **Agent-assisted / Review-driven** (você aprova ações sensíveis — ideal para auth e banco).
3. Modelo: para planejamento e tarefas complexas, use o de maior capacidade disponível; mantenha **Planning mode** ligado nas tarefas multi-arquivo.
4. Inicialize o repositório git e faça um commit limpo **antes** de qualquer run (ponto de rollback).
5. Crie o arquivo de **Rules** (seção 17). O Antigravity também suporta **Skills** (`<projeto>/.agents/skills/`) — você pode portar suas skills `saas-prd-spec` e `frontend-designer` para lá.

## 17. Rules do projeto (cole no arquivo de regras do Antigravity)

```
# Regras do projeto JustPonto

## Stack e padrões
- Backend: NestJS (TypeScript, modular). Banco: Supabase (Postgres + Storage).
- Nomes de domínio em português (usuarios, justificativas, tipos_ocorrencia).
- Toda rota protegida por JwtAuthGuard + RolesGuard. Nada público além de /auth/login.
- Validar todo payload com class-validator (DTOs). Senhas com bcrypt.

## Mock-first (OBRIGATÓRIO)
- Nenhum serviço de negócio acessa o Supabase diretamente.
- Todo acesso a dados passa por uma INTERFACE de repositório em src/data.
- Existem duas implementações: 'mock' (em memória) e 'supabase'.
- A variável de ambiente DATA_SOURCE (mock | supabase) decide qual carregar.
- E-mail e upload têm versão "fake" (loga no console) no modo mock.
- Comece SEMPRE pela implementação mock. Não escreva queries SQL no código de negócio.

## Qualidade
- Cada módulo entregue com testes (unitários para regras de negócio).
- Habilitar Swagger (OpenAPI) para verificação manual da API.
- Sem segredos no código; usar .env e ConfigModule.
```

## 18. Workflows reutilizáveis (salve no Antigravity)

- **`novo-modulo-nest`**: "Crie um módulo NestJS com controller, service, DTOs validados, repositório atrás da interface (impl mock primeiro) e teste unitário do service."
- **`gerar-testes`**: "Escreva testes unitários para as regras de negócio deste service e rode até passar."
- **`revisar-seguranca`**: "Audite este módulo: guards aplicados, validação de DTO, vazamento de dados por perfil, tratamento de upload."

## 19. Sequência de tarefas (delegue uma por vez)

> Para cada tarefa: cole o prompt na Agent Manager, **revise o Implementation Plan**, aprove, e ao final confira o **checklist de verificação**.

### Tarefa 1 — Scaffold do projeto
**Prompt:** *"Crie um projeto NestJS chamado justponto com TypeScript, ESLint/Prettier, ConfigModule lendo .env, Swagger habilitado em /docs, e a estrutura de pastas: config, common (guards/decorators/enums), data (interface + mock + supabase), e módulos vazios para auth, usuarios, tipos-ocorrencia, justificativas, anexos, notificacoes, relatorios. Adicione a variável DATA_SOURCE=mock no .env.example. Não implemente lógica ainda."*  
**Verificar:** projeto sobe (`npm run start:dev`), `/docs` abre, estrutura criada.

### Tarefa 2 — Enums, domínio e DTOs
**Prompt:** *"Crie os enums PerfilUsuario (colaborador|gerente|rh|direcao), StatusJustificativa (pendente|aprovada|reprovada) e Periodo (dia_inteiro|parcial). Crie as entidades de domínio (Usuario, TipoOcorrencia, Justificativa, Anexo) e os DTOs de criação/avaliação com class-validator, refletindo as regras RN-01 a RN-07 do PRD."*  
**Verificar:** DTOs com validações; compila sem erro.

### Tarefa 3 — Camada de dados mock
**Prompt:** *"Defina a interface de repositório para usuarios, tipos_ocorrencia, justificativas, anexos, historico e notificacoes em src/data. Implemente a versão MOCK em memória com dados seedados (4 usuários, um para cada perfil, com colaborador vinculado a um gerente; os 8 tipos de ocorrência; 2 justificativas de exemplo). Crie um DataModule que injeta a implementação conforme DATA_SOURCE (por enquanto só mock)."*  
**Verificar:** dados mockados acessíveis via um endpoint de teste; trocar DATA_SOURCE não quebra build.

### Tarefa 4 — Autenticação e autorização
**Prompt:** *"Implemente o AuthModule: POST /auth/login com bcrypt + JWT (expiração configurável). Crie JwtAuthGuard global e RolesGuard com decorator @Roles. Crie o decorator @UsuarioAtual. Use os usuários mockados para login. Escreva testes do fluxo de login e de bloqueio por perfil."*  
**Verificar:** login retorna token; rota protegida nega sem token e por perfil errado.

### Tarefa 5 — Tipos de ocorrência
**Prompt:** *"Implemente o módulo tipos-ocorrencia: GET lista os ativos (qualquer autenticado); POST/PATCH/DELETE restritos a rh e direcao. Use o repositório mock."*  
**Verificar:** lista os 8 tipos; CRUD bloqueado para colaborador.

### Tarefa 6 — Justificativas (núcleo)
**Prompt:** *"Implemente o módulo justificativas seguindo as regras RN-01 a RN-07: POST /justificativas (colaborador) cria como pendente e valida anexo obrigatório quando o tipo exige; GET /justificativas/minhas (colaborador); GET /justificativas/pendentes (gerente, só da sua equipe via gerente_id); PATCH /:id/avaliar (gerente/direcao) grava status, aprovador, comentário e registra em historico; GET /justificativas com filtros (rh/direcao). Escreva testes das regras de visibilidade por perfil."*  
**Verificar:** cada perfil enxerga só o que deve; avaliação grava histórico; colaborador não edita avaliada.

### Tarefa 7 — Anexos (mock de storage)
**Prompt:** *"Implemente upload/download de anexos atrás da interface de storage, com implementação MOCK (salva metadados em memória e simula path). Limite MIME a pdf/jpg/png e tamanho a 5MB. Download retorna uma URL assinada simulada."*  
**Verificar:** upload valida tipo/tamanho; metadados vinculados à justificativa.

### Tarefa 8 — Notificações por e-mail (mock)
**Prompt:** *"Implemente o NotificacoesModule: ao criar uma justificativa, dispara notificação ao gerente do colaborador. Crie a interface de e-mail com implementação FAKE (loga assunto/destinatário no console) e registra em notificacoes. Garanta que a criação da justificativa chama a notificação."*  
**Verificar:** criar justificativa gera log de e-mail ao gerente correto + registro em notificacoes.

### Tarefa 9 — Relatórios da Direção
**Prompt:** *"Implemente GET /relatorios/resumo (somente direcao): total por status, justificativas por colaborador, soma de dias e horas justificados (usando periodo/hora_inicio/hora_fim) e ranking de motivos mais frequentes. Tudo sobre o repositório mock."*  
**Verificar:** números batem com os dados mockados.

### Tarefa 10 — Integração Supabase (a virada para o banco real)
**Prompt:** *"Implemente as versões SUPABASE dos repositórios e do storage, usando a service role key e o cliente oficial, espelhando exatamente a interface já existente. Implemente o e-mail real com [Resend/SendGrid/SMTP]. Não altere nenhuma regra de negócio. Faça o DataModule carregar a implementação supabase quando DATA_SOURCE=supabase. Confira que os scripts em supabase/01_schema.sql e 02_seed.sql cobrem todas as tabelas usadas pelo código."*  
**Verificar:** com `DATA_SOURCE=mock` tudo continua funcionando; revisar os SQLs antes de rodar no Supabase.

### Tarefa 11 (opcional) — Frontend
**Prompt:** *"Crie um frontend [React/Next] consumindo a API: tela de login; lista de justificativas do colaborador com status e botão Nova Justificativa (popup com tipo, data, justificativa, anexo); tela de aprovação do gerente; visões de RH e Direção com relatórios."* — use sua skill `frontend-designer` como referência de estilo.  
**Verificar:** Antigravity abre o browser e valida os fluxos A, B e C.

## 20. Ordem de "virada" para o banco (resumo operacional)

1. Desenvolva e valide tudo com `DATA_SOURCE=mock`.
2. Crie o projeto no Supabase; pegue URL + service role key.
3. Rode `supabase/01_schema.sql` e depois `supabase/02_seed.sql` no SQL Editor.
4. Crie um bucket de Storage para anexos (privado).
5. Preencha o `.env` (Supabase + provedor de e-mail) e troque `DATA_SOURCE=supabase`.
6. Regenere os hashes de senha reais (script de seed do Nest com bcrypt) — o hash do SQL é placeholder.

---

# PARTE IV — ROADMAP

**MVP (Fase 1):** auth + perfis, criação/listagem de justificativas, aprovação do gerente, e-mail de notificação, visões de RH e Direção, relatórios básicos — **tudo mock-first**, depois plugado ao Supabase.

**Fase 2:** frontend polido, SSO corporativo, e-mail ao colaborador na decisão, gráficos e exportação (CSV/PDF) dos relatórios, aprovação multinível.

**Fase 3:** integração com relógio de ponto/folha, app mobile, retenção/expurgo automático (LGPD).

---

## Apêndice A — Variáveis de ambiente (`.env.example`)

```
# Origem de dados
DATA_SOURCE=mock                 # mock | supabase

# JWT
JWT_SECRET=troque-este-segredo
JWT_EXPIRES_IN=8h

# Supabase (só necessário quando DATA_SOURCE=supabase)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=anexos

# E-mail (escolha um provedor)
MAIL_PROVIDER=fake               # fake | resend | sendgrid | smtp
MAIL_FROM=naoresponda@empresa.com
RESEND_API_KEY=
```

## Apêndice B — Arquivos que acompanham este pacote

- `JustPonto-Planejamento.md` — este documento.
- `supabase/01_schema.sql` — criação de tabelas, enums, índices e triggers.
- `supabase/02_seed.sql` — tipos de ocorrência e usuários de exemplo.

---

*Observação técnica: o Antigravity está em preview e processa o código nos servidores do Google — para um sistema com dados de RH (sensíveis/LGPD), avalie usar um workspace isolado e revisar os termos de tratamento de dados antes de apontar o agente para qualquer base real.*
