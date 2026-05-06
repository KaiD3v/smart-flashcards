> **English:** see [README.md](./README.md).

# API SmartFlashcards

API REST da SmartFlashcards, focada em contas de utilizador, gestão de matérias e fluxo de revisão de flashcards com FSRS, incluindo geração assistida por IA.

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura e Notas de Design](#arquitetura-e-notas-de-design)
- [Stack Tecnológica](#stack-tecnológica)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Execução do Projeto](#execução-do-projeto)
- [Autenticação](#autenticação)
- [Endpoints da API](#endpoints-da-api)
  - [Health](#health)
  - [Auth](#auth)
  - [Users](#users)
  - [Subjects](#subjects)
  - [Flashcards (Aninhados em Subjects)](#flashcards-aninhados-em-subjects)
- [Tratamento de Erros](#tratamento-de-erros)
- [Rate Limiting e Throttling](#rate-limiting-e-throttling)
- [Logs e Monitorização](#logs-e-monitorização)
- [Testes](#testes)
- [Deploy](#deploy)
- [Considerações de Segurança](#considerações-de-segurança)
- [Estratégia de Versionamento](#estratégia-de-versionamento)
- [Diretrizes de Contribuição](#diretrizes-de-contribuição)
- [Licença](#licença)

## Visão Geral

A API SmartFlashcards resolve o problema central de organizar conteúdo de estudo e priorizar revisões de forma inteligente:

- **Gestão de utilizadores** com registo, login, consulta e atualização de perfil.
- **Conteúdo por matéria** para garantir que cada utilizador autenticado acede apenas aos seus próprios dados.
- **Ciclo de vida de flashcards** com operações de criar/listar/editar/apagar.
- **Agendamento FSRS** (`ts-fsrs`) para cálculo do próximo intervalo com base em `again|hard|good|easy`.
- **Geração de flashcards com IA** via Ollama a partir de texto, com persistência opcional.

Esta API foi desenhada para clientes web e mobile que usam autenticação baseada em cookie `HttpOnly`, com JWT no backend.

## Arquitetura e Notas de Design

- **Estrutura em camadas**:
  - `routes/*` -> composição de rotas e middlewares
  - `*.controller.ts` -> validação HTTP e formatação de resposta
  - `*.service.ts` -> regras de negócio e autorização
  - `*.repository.ts` -> acesso a dados com Prisma
- **Base de dados**: PostgreSQL com Prisma e `@prisma/adapter-pg`.
- **Modelo de autenticação**:
  - JWT é gerado no servidor e guardado em cookie `HttpOnly`.
  - Rotas protegidas validam o token presente no cookie.
- **Restrições de ownership**:
  - Operações de matérias e flashcards são sempre limitadas ao dono autenticado.
  - Alteração/apagamento de perfil é permitido apenas ao próprio utilizador.
- **Integração FSRS**:
  - Flashcards armazenam campos de agendamento (`due`, `stability`, `difficulty`, `reps`, `lapses`, `state`).
  - `POST /subjects/:id/flashcards/:flashcardId/review` atualiza estado de memória.

### Fluxo de revisão (Mermaid)

```mermaid
sequenceDiagram
  participant C as Cliente
  participant API as API SmartFlashcards
  participant DB as PostgreSQL
  participant FSRS as ts-fsrs

  C->>API: POST /subjects/:id/flashcards/:flashcardId/review {rating}
  API->>DB: Lê flashcard + valida ownership
  DB-->>API: Estado atual do card
  API->>FSRS: Calcula próximo estado pelo rating
  FSRS-->>API: Novo due/stability/difficulty/reps/lapses/state
  API->>DB: Persiste estado da revisão
  DB-->>API: Flashcard atualizado
  API-->>C: 200 { flashcard }
```

## Stack Tecnológica

- **Runtime**: Node.js (TypeScript, ESM)
- **Framework HTTP**: Express 5
- **Validação**: Zod
- **Base de dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT (`jsonwebtoken`) + cookie `HttpOnly`
- **Hash de password**: bcrypt
- **Integração de IA**: Ollama (geração de flashcards)
- **Repetição espaçada**: `ts-fsrs`

## Instalação e Configuração

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/KaiD3v/smart-flashcards.git
   cd smart-flashcards/server
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Criar ficheiro de ambiente**
   ```bash
   cp .env.example .env
   ```
   Se não existir `.env.example`, crie `.env` manualmente com as variáveis desta documentação.

4. **Configurar base de dados e segredo JWT**
   - Defina `DATABASE_URL` com a string de conexão PostgreSQL.
   - Defina `JWT_SECRET` forte (mínimo recomendado: 32 bytes aleatórios).

5. **Gerar cliente Prisma**
   ```bash
   npm run prisma:generate
   ```

6. **Aplicar schema na base de dados**
   Escolha uma opção:
   - Migrações (recomendado para histórico de alterações):
     ```bash
     npm run prisma:migrate
     ```
   - Push direto do schema (setup local rápido):
     ```bash
     npm run prisma:push
     ```

7. **Iniciar API**
   ```bash
   npm run dev
   ```

## Variáveis de Ambiente

| Variável | Obrigatória | Exemplo | Descrição |
|---|---|---|---|
| `PORT` | Não | `3000` | Porta HTTP da aplicação. Valor padrão: `3000`. |
| `NODE_ENV` | Não | `development` | Ambiente de execução. Em `production`, o cookie de auth é `secure`. |
| `DATABASE_URL` | Sim | `postgresql://smartflashcards:secret@localhost:5432/smartflashcards` | String de conexão PostgreSQL usada pelo Prisma. |
| `JWT_SECRET` | Sim | `4f5f95f7f4c3e8...` | Segredo usado para assinar/validar tokens JWT. |
| `JWT_EXPIRES_IN` | Não | `7d` | Expiração do JWT no formato do `jsonwebtoken` (`7d`, `12h`, etc.). Padrão: `7d`. |
| `AUTH_COOKIE_NAME` | Não | `access_token` | Nome do cookie de autenticação. Padrão: `access_token`. |
| `JWT_COOKIE_MAX_AGE_MS` | Não | `604800000` | Vida útil do cookie em milissegundos. Padrão: 7 dias. |
| `OLLAMA_HOST` | Não | `http://127.0.0.1:11434` | URL base do servidor Ollama. |
| `OLLAMA_MODEL` | Não | `llama3.2` | Modelo padrão usado na geração de flashcards. |
| `OLLAMA_API_KEY` | Não | `sk-local-ollama-key` | Token Bearer opcional enviado para o Ollama. |

## Execução do Projeto

### Desenvolvimento local

```bash
npm run dev
```

- Usa `tsx watch src/index.ts`.
- API sobe em `http://localhost:${PORT}`.

### Verificação de build/tipos

```bash
npm run build
```

- Executa o TypeScript em modo `noEmit`.

### Execução em modo produção

```bash
npm start
```

- Executa `tsx src/index.ts` (sem watch).
- Garanta `NODE_ENV=production`, `DATABASE_URL` e `JWT_SECRET`.

## Autenticação

A API usa **JWT em cookie `HttpOnly`**:

- `register` e `login` devolvem o utilizador e definem cookie (`AUTH_COOKIE_NAME`, padrão `access_token`).
- Rotas protegidas exigem este cookie.
- Propriedades do cookie:
  - `httpOnly: true`
  - `sameSite: "lax"`
  - `secure: true` apenas em `NODE_ENV=production`

### Fluxo de autenticação

1. `POST /auth/register` ou `POST /auth/login`
2. Cliente guarda o cookie retornado
3. Requisições seguintes enviam o cookie
4. `GET /auth/me` devolve o utilizador autenticado atual
5. `POST /auth/logout` limpa o cookie

### Exemplo (cookie jar com curl)

```bash
# Faz login e guarda cookie
curl -i -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "ana.silva@example.com",
    "password": "StrongPassw0rd!"
  }'

# Chama endpoint protegido com cookie guardado
curl -i "http://localhost:3000/subjects" -b cookies.txt
```

## Endpoints da API

Base URL (local): `http://localhost:3000`

---

## Health

### `GET /health`

- **Descrição**: verifica disponibilidade da API.
- **Auth**: não requer autenticação.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/health"
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "status": "ok"
}
```

#### Status codes

- `200` - serviço saudável

---

### `GET /db-health`

- **Descrição**: verifica conectividade com a base de dados (`SELECT 1`).
- **Auth**: não requer autenticação.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/db-health"
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "database": "connected"
}
```

#### Status codes

- `200` - base de dados conectada
- `503` - base de dados indisponível

---

## Auth

### `POST /auth/register`

- **Descrição**: cria utilizador e inicia sessão autenticada.
- **Auth**: não requer autenticação.

#### Exemplo de request (curl)

```bash
curl -i -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "ana.silva@example.com",
    "nickname": "ana_silva",
    "name": "Ana Silva",
    "password": "StrongPassw0rd!"
  }'
```

#### Request body (JSON)

```json
{
  "email": "ana.silva@example.com",
  "nickname": "ana_silva",
  "name": "Ana Silva",
  "password": "StrongPassw0rd!"
}
```

#### Exemplo de response (JSON)

```json
{
  "user": {
    "id": "4f217870-8d72-4acd-b0c8-85e373d5dca1",
    "email": "ana.silva@example.com",
    "nickname": "ana_silva",
    "name": "Ana Silva",
    "createdAt": "2026-05-06T16:10:00.000Z",
    "updatedAt": "2026-05-06T16:10:00.000Z"
  }
}
```

#### Status codes

- `201` - registo concluído
- `400` - erro de validação
- `409` - email ou nickname já existe

---

### `POST /auth/login`

- **Descrição**: autentica utilizador e define cookie de acesso.
- **Auth**: não requer autenticação.

#### Exemplo de request (curl)

```bash
curl -i -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "ana.silva@example.com",
    "password": "StrongPassw0rd!"
  }'
```

#### Request body (JSON)

```json
{
  "email": "ana.silva@example.com",
  "password": "StrongPassw0rd!"
}
```

#### Exemplo de response (JSON)

```json
{
  "user": {
    "id": "4f217870-8d72-4acd-b0c8-85e373d5dca1",
    "email": "ana.silva@example.com",
    "nickname": "ana_silva",
    "name": "Ana Silva",
    "createdAt": "2026-05-06T16:10:00.000Z",
    "updatedAt": "2026-05-06T16:10:00.000Z"
  }
}
```

#### Status codes

- `200` - autenticado
- `400` - erro de validação
- `401` - credenciais inválidas

---

### `POST /auth/logout`

- **Descrição**: limpa cookie de autenticação.
- **Auth**: não obrigatória (pode ser chamada sem sessão ativa).

#### Exemplo de request (curl)

```bash
curl -i -X POST "http://localhost:3000/auth/logout" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{}
```

#### Status codes

- `204` - logout efetuado

---

### `GET /auth/me`

- **Descrição**: retorna utilizador autenticado com base no cookie.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/auth/me" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "user": {
    "id": "4f217870-8d72-4acd-b0c8-85e373d5dca1",
    "email": "ana.silva@example.com",
    "nickname": "ana_silva",
    "name": "Ana Silva",
    "createdAt": "2026-05-06T16:10:00.000Z",
    "updatedAt": "2026-05-06T16:10:00.000Z"
  }
}
```

#### Status codes

- `200` - utilizador autenticado retornado
- `401` - não autenticado / token inválido ou expirado

---

## Users

### `POST /users`

- **Descrição**: cria utilizador (endpoint sem criação de sessão).
- **Auth**: não obrigatória.

#### Exemplo de request (curl)

```bash
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bruno.souza@example.com",
    "nickname": "bruno_souza",
    "name": "Bruno Souza",
    "password": "An0therStrongPass!"
  }'
```

#### Request body (JSON)

```json
{
  "email": "bruno.souza@example.com",
  "nickname": "bruno_souza",
  "name": "Bruno Souza",
  "password": "An0therStrongPass!"
}
```

#### Exemplo de response (JSON)

```json
{
  "user": {
    "id": "52f01ac9-eb7e-42f8-94dc-6fd0365e9428",
    "email": "bruno.souza@example.com",
    "nickname": "bruno_souza",
    "name": "Bruno Souza",
    "createdAt": "2026-05-06T16:15:00.000Z",
    "updatedAt": "2026-05-06T16:15:00.000Z"
  }
}
```

#### Status codes

- `201` - utilizador criado
- `400` - erro de validação
- `409` - conflito de email ou nickname

---

### `GET /users`

- **Descrição**: lista utilizadores.
- **Auth**: não obrigatória.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/users"
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "users": [
    {
      "id": "4f217870-8d72-4acd-b0c8-85e373d5dca1",
      "email": "ana.silva@example.com",
      "nickname": "ana_silva",
      "name": "Ana Silva",
      "createdAt": "2026-05-06T16:10:00.000Z",
      "updatedAt": "2026-05-06T16:10:00.000Z"
    }
  ]
}
```

#### Status codes

- `200` - lista retornada

---

### `GET /users/:id`

- **Descrição**: obtém utilizador por id.
- **Auth**: não obrigatória.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/users/4f217870-8d72-4acd-b0c8-85e373d5dca1"
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "user": {
    "id": "4f217870-8d72-4acd-b0c8-85e373d5dca1",
    "email": "ana.silva@example.com",
    "nickname": "ana_silva",
    "name": "Ana Silva",
    "createdAt": "2026-05-06T16:10:00.000Z",
    "updatedAt": "2026-05-06T16:10:00.000Z"
  }
}
```

#### Status codes

- `200` - utilizador retornado
- `400` - id em falta
- `404` - utilizador não encontrado

---

### `PATCH /users/:id`

- **Descrição**: atualiza perfil do utilizador autenticado (`:id` deve coincidir com o utilizador da sessão).
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X PATCH "http://localhost:3000/users/4f217870-8d72-4acd-b0c8-85e373d5dca1" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Ana Beatriz Silva",
    "nickname": "ana_beatriz"
  }'
```

#### Request body (JSON)

```json
{
  "name": "Ana Beatriz Silva",
  "nickname": "ana_beatriz"
}
```

#### Exemplo de response (JSON)

```json
{
  "user": {
    "id": "4f217870-8d72-4acd-b0c8-85e373d5dca1",
    "email": "ana.silva@example.com",
    "nickname": "ana_beatriz",
    "name": "Ana Beatriz Silva",
    "createdAt": "2026-05-06T16:10:00.000Z",
    "updatedAt": "2026-05-06T16:25:00.000Z"
  }
}
```

#### Status codes

- `200` - perfil atualizado
- `400` - validação falhou / id em falta
- `401` - não autenticado
- `403` - tentativa de alterar perfil de outro utilizador
- `404` - utilizador não encontrado
- `409` - conflito de email/nickname

---

### `DELETE /users/:id`

- **Descrição**: remove perfil do utilizador autenticado (`:id` deve coincidir com a sessão).
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -i -X DELETE "http://localhost:3000/users/4f217870-8d72-4acd-b0c8-85e373d5dca1" \
  -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{}
```

#### Status codes

- `204` - utilizador removido
- `400` - id em falta
- `401` - não autenticado
- `403` - tentativa de remover perfil de outro utilizador
- `404` - utilizador não encontrado

---

## Subjects

> Todos os endpoints de matérias exigem autenticação.

### `POST /subjects`

- **Descrição**: cria matéria do utilizador autenticado.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X POST "http://localhost:3000/subjects" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Biologia Celular",
    "description": "Membrana plasmática, organelos e metabolismo.",
    "imageUrl": "https://cdn.smartflashcards.com/subjects/cell-biology.png",
    "isActive": true
  }'
```

#### Request body (JSON)

```json
{
  "name": "Biologia Celular",
  "description": "Membrana plasmática, organelos e metabolismo.",
  "imageUrl": "https://cdn.smartflashcards.com/subjects/cell-biology.png",
  "isActive": true
}
```

#### Exemplo de response (JSON)

```json
{
  "subject": {
    "id": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
    "name": "Biologia Celular",
    "description": "Membrana plasmática, organelos e metabolismo.",
    "imageUrl": "https://cdn.smartflashcards.com/subjects/cell-biology.png",
    "isActive": true,
    "createdAt": "2026-05-06T16:30:00.000Z",
    "updatedAt": "2026-05-06T16:30:00.000Z"
  }
}
```

#### Status codes

- `201` - matéria criada
- `400` - erro de validação
- `401` - não autenticado

---

### `GET /subjects`

- **Descrição**: lista matérias do utilizador autenticado.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/subjects" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "subjects": [
    {
      "id": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
      "name": "Biologia Celular",
      "description": "Membrana plasmática, organelos e metabolismo.",
      "imageUrl": "https://cdn.smartflashcards.com/subjects/cell-biology.png",
      "isActive": true,
      "createdAt": "2026-05-06T16:30:00.000Z",
      "updatedAt": "2026-05-06T16:30:00.000Z"
    }
  ]
}
```

#### Status codes

- `200` - matérias retornadas
- `401` - não autenticado

---

### `GET /subjects/:id`

- **Descrição**: obtém matéria por id (apenas se pertencer ao utilizador autenticado).
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "subject": {
    "id": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
    "name": "Biologia Celular",
    "description": "Membrana plasmática, organelos e metabolismo.",
    "imageUrl": "https://cdn.smartflashcards.com/subjects/cell-biology.png",
    "isActive": true,
    "createdAt": "2026-05-06T16:30:00.000Z",
    "updatedAt": "2026-05-06T16:30:00.000Z"
  }
}
```

#### Status codes

- `200` - matéria retornada
- `400` - id em falta
- `401` - não autenticado
- `404` - matéria não encontrada ou sem permissão

---

### `PATCH /subjects/:id`

- **Descrição**: atualiza matéria do utilizador autenticado.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X PATCH "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "description": "Inclui transporte pela membrana e sinalização celular.",
    "isActive": true
  }'
```

#### Request body (JSON)

```json
{
  "description": "Inclui transporte pela membrana e sinalização celular.",
  "isActive": true
}
```

#### Exemplo de response (JSON)

```json
{
  "subject": {
    "id": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
    "name": "Biologia Celular",
    "description": "Inclui transporte pela membrana e sinalização celular.",
    "imageUrl": "https://cdn.smartflashcards.com/subjects/cell-biology.png",
    "isActive": true,
    "createdAt": "2026-05-06T16:30:00.000Z",
    "updatedAt": "2026-05-06T16:45:00.000Z"
  }
}
```

#### Status codes

- `200` - matéria atualizada
- `400` - erro de validação / id em falta
- `401` - não autenticado
- `404` - matéria não encontrada ou sem permissão

---

### `DELETE /subjects/:id`

- **Descrição**: remove matéria (com cascade dos flashcards).
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -i -X DELETE "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{}
```

#### Status codes

- `204` - matéria removida
- `400` - id em falta
- `401` - não autenticado
- `404` - matéria não encontrada ou sem permissão

---

## Flashcards (Aninhados em Subjects)

> Todos os endpoints de flashcards exigem autenticação e estão sob:
> `/subjects/:id/flashcards`

### `GET /subjects/:id/flashcards`

- **Descrição**: lista todos os flashcards da matéria.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "flashcards": [
    {
      "id": "4d7b6876-d793-4b17-9b6b-8569f58770b8",
      "front": "Qual a função da membrana plasmática?",
      "back": "Controlar entrada e saída de substâncias e manter a homeostase celular.",
      "order": 0,
      "due": "2026-05-06T16:50:00.000Z",
      "lastReviewedAt": null,
      "stability": 0,
      "difficulty": 0,
      "reps": 0,
      "lapses": 0,
      "state": 0,
      "subjectId": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
      "createdAt": "2026-05-06T16:50:00.000Z",
      "updatedAt": "2026-05-06T16:50:00.000Z"
    }
  ]
}
```

#### Status codes

- `200` - flashcards retornados
- `400` - id da matéria em falta
- `401` - não autenticado
- `404` - matéria não encontrada ou sem permissão

---

### `GET /subjects/:id/flashcards/need-review`

- **Descrição**: retorna flashcards com `due <= now`, ordenados por `due` ascendente.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/need-review" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "flashcards": [
    {
      "id": "4d7b6876-d793-4b17-9b6b-8569f58770b8",
      "front": "Qual a função da membrana plasmática?",
      "back": "Controlar entrada e saída de substâncias e manter a homeostase celular.",
      "order": 0,
      "due": "2026-05-06T16:50:00.000Z",
      "lastReviewedAt": "2026-05-06T16:40:00.000Z",
      "stability": 2.34,
      "difficulty": 4.21,
      "reps": 3,
      "lapses": 1,
      "state": 2,
      "subjectId": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
      "createdAt": "2026-05-06T16:50:00.000Z",
      "updatedAt": "2026-05-06T16:55:00.000Z"
    }
  ]
}
```

#### Status codes

- `200` - cards em revisão retornados
- `400` - id da matéria em falta
- `401` - não autenticado
- `404` - matéria não encontrada ou sem permissão

---

### `POST /subjects/:id/flashcards`

- **Descrição**: cria flashcard numa matéria.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X POST "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "front": "O que é ATP?",
    "back": "A principal molécula de armazenamento e transferência de energia celular.",
    "order": 1
  }'
```

#### Request body (JSON)

```json
{
  "front": "O que é ATP?",
  "back": "A principal molécula de armazenamento e transferência de energia celular.",
  "order": 1
}
```

#### Exemplo de response (JSON)

```json
{
  "flashcard": {
    "id": "93838f2e-5f80-45cc-b9c9-4fd8df954a87",
    "front": "O que é ATP?",
    "back": "A principal molécula de armazenamento e transferência de energia celular.",
    "order": 1,
    "due": "2026-05-06T17:00:00.000Z",
    "lastReviewedAt": null,
    "stability": 0,
    "difficulty": 0,
    "reps": 0,
    "lapses": 0,
    "state": 0,
    "subjectId": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
    "createdAt": "2026-05-06T17:00:00.000Z",
    "updatedAt": "2026-05-06T17:00:00.000Z"
  }
}
```

#### Status codes

- `201` - flashcard criado
- `400` - erro de validação / id da matéria em falta
- `401` - não autenticado
- `404` - matéria não encontrada ou sem permissão

---

### `POST /subjects/:id/flashcards/generate`

- **Descrição**: gera flashcards com Ollama a partir de texto. Pode persistir na matéria.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X POST "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/generate" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "materialText": "A respiração celular ocorre em três etapas principais: glicólise, ciclo de Krebs e cadeia transportadora de eletrões...",
    "maxCards": 8,
    "model": "llama3.2",
    "persist": true
  }'
```

#### Request body (JSON)

```json
{
  "materialText": "A respiração celular ocorre em três etapas principais: glicólise, ciclo de Krebs e cadeia transportadora de eletrões...",
  "maxCards": 8,
  "model": "llama3.2",
  "persist": true
}
```

#### Exemplo de response (JSON)

```json
{
  "flashcards": [
    {
      "id": "0da3514e-6a17-4ad6-973a-99f7d36f9f20",
      "front": "Quais são as três etapas principais da respiração celular?",
      "back": "Glicólise, ciclo de Krebs e cadeia transportadora de eletrões.",
      "order": 2,
      "due": "2026-05-06T17:05:00.000Z",
      "lastReviewedAt": null,
      "stability": 0,
      "difficulty": 0,
      "reps": 0,
      "lapses": 0,
      "state": 0,
      "subjectId": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
      "createdAt": "2026-05-06T17:05:00.000Z",
      "updatedAt": "2026-05-06T17:05:00.000Z"
    }
  ],
  "persisted": true
}
```

Se `persist=false` (ou omitido), o formato é:

```json
{
  "flashcards": [
    {
      "front": "Quais são as três etapas principais da respiração celular?",
      "back": "Glicólise, ciclo de Krebs e cadeia transportadora de eletrões."
    }
  ],
  "persisted": false
}
```

#### Status codes

- `200` - geração concluída
- `400` - erro de validação / id da matéria em falta
- `401` - não autenticado
- `404` - matéria não encontrada ou sem permissão
- `502` - falha de geração por IA

---

### `GET /subjects/:id/flashcards/:flashcardId`

- **Descrição**: obtém flashcard por id (desde que pertença ao utilizador autenticado).
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X GET "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/4d7b6876-d793-4b17-9b6b-8569f58770b8" \
  -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{
  "flashcard": {
    "id": "4d7b6876-d793-4b17-9b6b-8569f58770b8",
    "front": "Qual a função da membrana plasmática?",
    "back": "Controlar entrada e saída de substâncias e manter a homeostase celular.",
    "order": 0,
    "due": "2026-05-10T16:00:00.000Z",
    "lastReviewedAt": "2026-05-06T16:35:00.000Z",
    "stability": 2.34,
    "difficulty": 4.21,
    "reps": 3,
    "lapses": 1,
    "state": 2,
    "subjectId": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
    "createdAt": "2026-05-06T16:50:00.000Z",
    "updatedAt": "2026-05-06T16:55:00.000Z"
  }
}
```

#### Status codes

- `200` - flashcard retornado
- `400` - id do flashcard em falta
- `401` - não autenticado
- `404` - flashcard não encontrado ou sem permissão

---

### `POST /subjects/:id/flashcards/:flashcardId/review`

- **Descrição**: aplica revisão FSRS ao flashcard.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X POST "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/4d7b6876-d793-4b17-9b6b-8569f58770b8/review" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "rating": "good"
  }'
```

#### Request body (JSON)

```json
{
  "rating": "good"
}
```

Valores válidos:

- `again`
- `hard`
- `good`
- `easy`

#### Exemplo de response (JSON)

```json
{
  "flashcard": {
    "id": "4d7b6876-d793-4b17-9b6b-8569f58770b8",
    "front": "Qual a função da membrana plasmática?",
    "back": "Controlar entrada e saída de substâncias e manter a homeostase celular.",
    "order": 0,
    "due": "2026-05-10T16:00:00.000Z",
    "lastReviewedAt": "2026-05-06T17:10:00.000Z",
    "stability": 2.34,
    "difficulty": 4.21,
    "reps": 3,
    "lapses": 1,
    "state": 2,
    "subjectId": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
    "createdAt": "2026-05-06T16:50:00.000Z",
    "updatedAt": "2026-05-06T17:10:00.000Z"
  }
}
```

#### Status codes

- `200` - revisão aplicada
- `400` - validação falhou / id em falta
- `401` - não autenticado
- `404` - flashcard não encontrado ou sem permissão

---

### `PATCH /subjects/:id/flashcards/:flashcardId`

- **Descrição**: atualiza campos do flashcard (`front`, `back`, `order`).
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -X PATCH "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/4d7b6876-d793-4b17-9b6b-8569f58770b8" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "front": "Qual é o papel da membrana plasmática?"
  }'
```

#### Request body (JSON)

```json
{
  "front": "Qual é o papel da membrana plasmática?"
}
```

#### Exemplo de response (JSON)

```json
{
  "flashcard": {
    "id": "4d7b6876-d793-4b17-9b6b-8569f58770b8",
    "front": "Qual é o papel da membrana plasmática?",
    "back": "Controlar entrada e saída de substâncias e manter a homeostase celular.",
    "order": 0,
    "due": "2026-05-10T16:00:00.000Z",
    "lastReviewedAt": "2026-05-06T17:10:00.000Z",
    "stability": 2.34,
    "difficulty": 4.21,
    "reps": 3,
    "lapses": 1,
    "state": 2,
    "subjectId": "ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5",
    "createdAt": "2026-05-06T16:50:00.000Z",
    "updatedAt": "2026-05-06T17:15:00.000Z"
  }
}
```

#### Status codes

- `200` - flashcard atualizado
- `400` - validação falhou / id em falta
- `401` - não autenticado
- `404` - flashcard não encontrado ou sem permissão

---

### `DELETE /subjects/:id/flashcards/:flashcardId`

- **Descrição**: remove flashcard.
- **Auth**: obrigatória.

#### Exemplo de request (curl)

```bash
curl -i -X DELETE "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/4d7b6876-d793-4b17-9b6b-8569f58770b8" \
  -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Exemplo de response (JSON)

```json
{}
```

#### Status codes

- `204` - flashcard removido
- `400` - id do flashcard em falta
- `401` - não autenticado
- `404` - flashcard não encontrado ou sem permissão

## Tratamento de Erros

### Formatos padrão de erro

- **Erros de validação** (Zod):
  ```json
  {
    "message": "Validation failed",
    "issues": [
      {
        "path": ["email"],
        "message": "invalid email"
      }
    ]
  }
  ```
- **Erros de domínio/autorização** (`HttpError`):
  ```json
  {
    "message": "Not authenticated"
  }
  ```
  Pode incluir detalhes:
  ```json
  {
    "message": "Conflict",
    "details": {
      "field": "email"
    }
  }
  ```

### Status codes mais comuns

- `400` - validação falhou ou parâmetro obrigatório em falta
- `401` - não autenticado / token inválido
- `403` - autenticado sem permissão para ação
- `404` - recurso não encontrado
- `409` - conflito de unicidade (email/nickname)
- `502` - falha upstream de geração com IA
- `503` - base de dados indisponível (`/db-health`)

## Rate Limiting e Throttling

Atualmente não há rate limiter aplicado na API.

Recomendação para produção:

- aplicar limites por IP e por utilizador no gateway/API gateway;
- usar limites mais restritivos em `POST /auth/login` e `POST /subjects/:id/flashcards/generate`.

## Logs e Monitorização

Estado atual:

- log básico de arranque no stdout;
- falhas de `db-health` são impressas no stderr.

Recomendação para produção:

- usar logs estruturados em JSON com correlation/request id;
- recolher métricas de latência para auth, DB e geração de flashcards;
- acompanhar taxa de erros `4xx/5xx`, com foco em `401`, `409` e `502`.

## Testes

O script `test` atual em `package.json` é placeholder e não executa suite automatizada.

```bash
npm test
```

Próximo passo recomendado:

- adicionar testes de integração para autenticação, ownership de matérias e revisão FSRS.

## Deploy

Deploy recomendado como serviço Node.js stateless com PostgreSQL gerido:

1. Definir variáveis obrigatórias (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`).
2. Instalar dependências e gerar cliente Prisma:
   ```bash
   npm ci
   npm run prisma:generate
   ```
3. Executar migrações/push de schema no ambiente alvo.
4. Iniciar API:
   ```bash
   npm start
   ```
5. Terminar TLS no reverse proxy/load balancer.
6. Garantir compatibilidade de cookies com domínio HTTPS do frontend.

## Considerações de Segurança

- usar `JWT_SECRET` forte e rotação periódica;
- executar sempre com HTTPS em produção;
- manter cookie de auth como `HttpOnly` e `SameSite`;
- proteger endpoints sensíveis com rate limiting;
- restringir CORS a origens explícitas;
- aplicar limites de payload também na borda (gateway/proxy);
- guardar credenciais e chaves em secret manager.

## Estratégia de Versionamento

As rotas atuais são não versionadas (`/auth`, `/subjects`, `/users`).

Estratégia recomendada:

- introduzir versionamento por path para alterações breaking (`/v1/...`);
- manter compatibilidade dentro da mesma major;
- publicar plano de depreciação e data de sunset para versões antigas.

## Diretrizes de Contribuição

- manter tipagem forte em TypeScript;
- validar payloads HTTP com Zod nos controllers;
- concentrar regras de negócio nos services;
- manter repositories focados em persistência;
- para endpoints protegidos, garantir autenticação + ownership;
- atualizar este README sempre que contrato de API mudar.

Fluxo local sugerido:

```bash
npm install
npm run prisma:generate
npm run build
npm run dev
```

## Licença

ISC
