> **Português:** ver [README.pt.md](./README.pt.md).

# SmartFlashcards API

REST API for SmartFlashcards, focused on user accounts, subject management, and FSRS-powered flashcard review workflows, including AI-assisted flashcard generation.

## Table of Contents

- [Overview](#overview)
- [Architecture and Design Notes](#architecture-and-design-notes)
- [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Health](#health)
  - [Auth](#auth)
  - [Users](#users)
  - [Subjects](#subjects)
  - [Flashcards (Nested Under Subjects)](#flashcards-nested-under-subjects)
- [Error Handling](#error-handling)
- [Rate Limiting and Throttling](#rate-limiting-and-throttling)
- [Logging and Monitoring](#logging-and-monitoring)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Versioning Strategy](#versioning-strategy)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)

## Overview

The SmartFlashcards API addresses the core problem of organizing study content and prioritizing reviews intelligently:

- **User management** with registration, login, profile lookup, and profile updates.
- **Subject-scoped content** so each authenticated user only accesses their own data.
- **Flashcard lifecycle** with create/list/update/delete operations.
- **FSRS scheduling** (`ts-fsrs`) to compute the next interval based on `again|hard|good|easy`.
- **AI flashcard generation** via Ollama from raw text, with optional persistence.

This API is designed for web and mobile clients that use `HttpOnly` cookie-based authentication with JWT on the server.

## Architecture and Design Notes

- **Layered structure**:
  - `routes/*` -> route and middleware composition
  - `*.controller.ts` -> HTTP validation and response formatting
  - `*.service.ts` -> business rules and authorization
  - `*.repository.ts` -> data access with Prisma
- **Database**: PostgreSQL with Prisma and `@prisma/adapter-pg`.
- **Authentication model**:
  - JWT is issued by the server and stored in an `HttpOnly` cookie.
  - Protected routes validate the token from the cookie.
- **Ownership constraints**:
  - Subject and flashcard operations are always limited to the authenticated owner.
  - Profile updates/deletes are only allowed for the account owner.
- **FSRS integration**:
  - Flashcards store scheduling fields (`due`, `stability`, `difficulty`, `reps`, `lapses`, `state`).
  - `POST /subjects/:id/flashcards/:flashcardId/review` updates memory state.

### Review flow (Mermaid)

```mermaid
sequenceDiagram
  participant C as Client
  participant API as SmartFlashcards API
  participant DB as PostgreSQL
  participant FSRS as ts-fsrs

  C->>API: POST /subjects/:id/flashcards/:flashcardId/review {rating}
  API->>DB: Read flashcard + validate ownership
  DB-->>API: Current card state
  API->>FSRS: Compute next state from rating
  FSRS-->>API: Novo due/stability/difficulty/reps/lapses/state
  API->>DB: Persist review state
  DB-->>API: Updated flashcard
  API-->>C: 200 { flashcard }
```

## Tech Stack

- **Runtime**: Node.js (TypeScript, ESM)
- **HTTP framework**: Express 5
- **Validation**: Zod
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (`jsonwebtoken`) + `HttpOnly` cookie
- **Password hashing**: bcrypt
- **AI integration**: Ollama (flashcard generation)
- **Spaced repetition**: `ts-fsrs`

## Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KaiD3v/smart-flashcards.git
   cd smart-flashcards/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   If `.env.example` is missing, create `.env` manually using the variables documented here.

4. **Configure database and JWT secret**
   - Set `DATABASE_URL` to your PostgreSQL connection string.
   - Set a strong `JWT_SECRET` (recommended: at least 32 random bytes).

5. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

6. **Apply schema to the database**
   Choose one:
   - Migrations (recommended for schema history):
     ```bash
     npm run prisma:migrate
     ```
   - Direct schema push (fast local setup):
     ```bash
     npm run prisma:push
     ```

7. **Start the API**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Required | Example | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP port. Default: `3000`. |
| `NODE_ENV` | No | `development` | Runtime mode. In `production`, auth cookies are `secure`. |
| `DATABASE_URL` | Yes | `postgresql://smartflashcards:secret@localhost:5432/smartflashcards` | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | `4f5f95f7f4c3e8...` | Secret used to sign/verify JWTs. |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry in `jsonwebtoken` format (`7d`, `12h`, etc.). Default: `7d`. |
| `AUTH_COOKIE_NAME` | No | `access_token` | Authentication cookie name. Default: `access_token`. |
| `JWT_COOKIE_MAX_AGE_MS` | No | `604800000` | Cookie lifetime in milliseconds. Default: 7 days. |
| `OLLAMA_HOST` | No | `http://127.0.0.1:11434` | Ollama server base URL. |
| `OLLAMA_MODEL` | No | `llama3.2` | Default model for flashcard generation. |
| `OLLAMA_API_KEY` | No | `sk-local-ollama-key` | Optional Bearer token sent to Ollama. |

## Running the Project

### Local development

```bash
npm run dev
```

- Usa `tsx watch src/index.ts`.
- API listens on `http://localhost:${PORT}`.

### Type-check / build verification

```bash
npm run build
```

- Runs the TypeScript compiler in `noEmit` mode.

### Production-style run

```bash
npm start
```

- Runs `tsx src/index.ts` (no watch).
- Ensure `NODE_ENV=production`, `DATABASE_URL`, and `JWT_SECRET` are set.

## Authentication

The API uses **JWT in an `HttpOnly` cookie**:

- `register` and `login` return the user object and set the cookie (`AUTH_COOKIE_NAME`, default `access_token`).
- Protected routes require this cookie.
- Cookie properties:
  - `httpOnly: true`
  - `sameSite: "lax"`
  - `secure: true` only when `NODE_ENV=production`

### Authentication flow

1. `POST /auth/register` ou `POST /auth/login`
2. Client stores the returned cookie
3. Subsequent requests include the cookie
4. `GET /auth/me` returns the currently authenticated user
5. `POST /auth/logout` clears the cookie

### Example (cookie jar with curl)

```bash
# Log in and store cookies
curl -i -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "ana.silva@example.com",
    "password": "StrongPassw0rd!"
  }'

# Call protected endpoint with stored cookie
curl -i "http://localhost:3000/subjects" -b cookies.txt
```

## API Endpoints

Base URL (local): `http://localhost:3000`

---

## Health

### `GET /health`

- **Description**: API liveness probe.
- **Auth**: not required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/health"
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

```json
{
  "status": "ok"
}
```

#### Status codes

- `200` - healthy

---

### `GET /db-health`

- **Description**: database connectivity probe (`SELECT 1`).
- **Auth**: not required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/db-health"
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

```json
{
  "database": "connected"
}
```

#### Status codes

- `200` - database connected
- `503` - database unavailable

---

## Auth

### `POST /auth/register`

- **Description**: creates a user and starts an authenticated session.
- **Auth**: not required.

#### Example request (curl)

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

#### Example response (JSON)

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

- `201` - registration successful
- `400` - validation error
- `409` - email or nickname already taken

---

### `POST /auth/login`

- **Description**: authenticates the user and sets the access cookie.
- **Auth**: not required.

#### Example request (curl)

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

#### Example response (JSON)

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
- `400` - validation error
- `401` - invalid credentials

---

### `POST /auth/logout`

- **Description**: clears the authentication cookie.
- **Auth**: not required (safe to call without an active session).

#### Example request (curl)

```bash
curl -i -X POST "http://localhost:3000/auth/logout" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

```json
{}
```

#### Status codes

- `204` - logged out

---

### `GET /auth/me`

- **Description**: returns the authenticated user from the cookie.
- **Auth**: required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/auth/me" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

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

- `200` - authenticated user returned
- `401` - not authenticated / invalid or expired token

---

## Users

### `POST /users`

- **Description**: creates a user (does not establish a session).
- **Auth**: not required.

#### Example request (curl)

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

#### Example response (JSON)

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

- `201` - user created
- `400` - validation error
- `409` - email or nickname conflict

---

### `GET /users`

- **Description**: lists users.
- **Auth**: not required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/users"
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

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

- `200` - list returned

---

### `GET /users/:id`

- **Description**: gets a user by id.
- **Auth**: not required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/users/4f217870-8d72-4acd-b0c8-85e373d5dca1"
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

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

- `200` - user returned
- `400` - missing id
- `404` - user not found

---

### `PATCH /users/:id`

- **Description**: updates the authenticated user's profile (`:id` must match the session user).
- **Auth**: required.

#### Example request (curl)

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

#### Example response (JSON)

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

- `200` - profile updated
- `400` - validation failed / missing id
- `401` - not authenticated
- `403` - cannot modify another user's profile
- `404` - user not found
- `409` - email/nickname conflict

---

### `DELETE /users/:id`

- **Description**: deletes the authenticated user's profile (`:id` must match the session).
- **Auth**: required.

#### Example request (curl)

```bash
curl -i -X DELETE "http://localhost:3000/users/4f217870-8d72-4acd-b0c8-85e373d5dca1" \
  -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

```json
{}
```

#### Status codes

- `204` - user deleted
- `400` - missing id
- `401` - not authenticated
- `403` - cannot delete another user's profile
- `404` - user not found

---

## Subjects

> All subject endpoints require authentication.

### `POST /subjects`

- **Description**: creates a subject for the authenticated user.
- **Auth**: required.

#### Example request (curl)

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

#### Example response (JSON)

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

- `201` - subject created
- `400` - validation error
- `401` - not authenticated

---

### `GET /subjects`

- **Description**: lists subjects for the authenticated user.
- **Auth**: required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/subjects" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

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

- `200` - subjects returned
- `401` - not authenticated

---

### `GET /subjects/:id`

- **Description**: gets a subject by id (only if owned by the authenticated user).
- **Auth**: required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

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

- `200` - subject returned
- `400` - missing id
- `401` - not authenticated
- `404` - subject not found or not permitted

---

### `PATCH /subjects/:id`

- **Description**: updates a subject owned by the authenticated user.
- **Auth**: required.

#### Example request (curl)

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

#### Example response (JSON)

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

- `200` - subject updated
- `400` - validation error / id em falta
- `401` - not authenticated
- `404` - subject not found or not permitted

---

### `DELETE /subjects/:id`

- **Description**: deletes a subject (cascades flashcards).
- **Auth**: required.

#### Example request (curl)

```bash
curl -i -X DELETE "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

```json
{}
```

#### Status codes

- `204` - subject deleted
- `400` - missing id
- `401` - not authenticated
- `404` - subject not found or not permitted

---

## Flashcards (Nested Under Subjects)

> All flashcard endpoints require authentication under:
> `/subjects/:id/flashcards`

### `GET /subjects/:id/flashcards`

- **Description**: lists all flashcards in the subject.
- **Auth**: required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

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

- `200` - flashcards returned
- `400` - missing subject id
- `401` - not authenticated
- `404` - subject not found or not permitted

---

### `GET /subjects/:id/flashcards/need-review`

- **Description**: returns flashcards with `due <= now`, ordered by `due` ascending.
- **Auth**: required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/need-review" -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

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

- `200` - due cards returned
- `400` - missing subject id
- `401` - not authenticated
- `404` - subject not found or not permitted

---

### `POST /subjects/:id/flashcards`

- **Description**: creates a flashcard in a subject.
- **Auth**: required.

#### Example request (curl)

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

#### Example response (JSON)

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

- `201` - flashcard created
- `400` - validation error / missing subject id
- `401` - not authenticated
- `404` - subject not found or not permitted

---

### `POST /subjects/:id/flashcards/generate`

- **Description**: generates flashcards from text via Ollama. Can persist into the subject.
- **Auth**: required.

#### Example request (curl)

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

#### Example response (JSON)

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

If `persist=false` (or omitted), the response shape is:

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

- `200` - generation completed
- `400` - validation error / missing subject id
- `401` - not authenticated
- `404` - subject not found or not permitted
- `502` - AI generation failed

---

### `GET /subjects/:id/flashcards/:flashcardId`

- **Description**: gets a flashcard by id (must belong to the authenticated user).
- **Auth**: required.

#### Example request (curl)

```bash
curl -X GET "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/4d7b6876-d793-4b17-9b6b-8569f58770b8" \
  -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

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

- `200` - flashcard returned
- `400` - missing flashcard id
- `401` - not authenticated
- `404` - flashcard not found or not permitted

---

### `POST /subjects/:id/flashcards/:flashcardId/review`

- **Description**: applies an FSRS review update to the flashcard.
- **Auth**: required.

#### Example request (curl)

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

Valid values:

- `again`
- `hard`
- `good`
- `easy`

#### Example response (JSON)

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

- `200` - review applied
- `400` - validation failed / missing id
- `401` - not authenticated
- `404` - flashcard not found or not permitted

---

### `PATCH /subjects/:id/flashcards/:flashcardId`

- **Description**: updates flashcard fields (`front`, `back`, `order`).
- **Auth**: required.

#### Example request (curl)

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

#### Example response (JSON)

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

- `200` - flashcard updated
- `400` - validation failed / missing id
- `401` - not authenticated
- `404` - flashcard not found or not permitted

---

### `DELETE /subjects/:id/flashcards/:flashcardId`

- **Description**: deletes a flashcard.
- **Auth**: required.

#### Example request (curl)

```bash
curl -i -X DELETE "http://localhost:3000/subjects/ef94e4f8-ebaa-4f1a-bebf-2b3be81ad4f5/flashcards/4d7b6876-d793-4b17-9b6b-8569f58770b8" \
  -b cookies.txt
```

#### Request body (JSON)

```json
{}
```

#### Example response (JSON)

```json
{}
```

#### Status codes

- `204` - flashcard deleted
- `400` - missing flashcard id
- `401` - not authenticated
- `404` - flashcard not found or not permitted

## Error Handling

### Standard error formats

- **Validation errors** (Zod):
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
- **Domain/authorization errors** (`HttpError`):
  ```json
  {
    "message": "Not authenticated"
  }
  ```
  May include details:
  ```json
  {
    "message": "Conflict",
    "details": {
      "field": "email"
    }
  }
  ```

### Common status codes

- `400` - validation failed or missing required parameter
- `401` - not authenticated / token inválido
- `403` - authenticated but forbidden
- `404` - resource not found
- `409` - uniqueness conflict (email/nickname)
- `502` - upstream AI generation failure
- `503` - database unavailable (`/db-health`)

## Rate Limiting and Throttling

No rate limiter is currently configured in this API.

Production recommendation:

- apply per-IP and per-user limits at the gateway/API gateway;
- use stricter limits for `POST /auth/login` and `POST /subjects/:id/flashcards/generate`.

## Logging and Monitoring

Current state:

- basic startup logging to stdout;
- `db-health` failures are printed to stderr.

Production recommendation:

- use structured JSON logs with correlation/request IDs;
- collect latency metrics for auth, DB, and flashcard generation;
- track `4xx/5xx` error rates, especially `401`, `409`, and `502`.

## Testing

The current `test` script in `package.json` is a placeholder and does not run an automated suite.

```bash
npm test
```

Recommended next step:

- add integration tests for authentication, subject ownership, and FSRS review.

## Deploy

Recommended deployment: stateless Node.js service with managed PostgreSQL:

1. Set required variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`).
2. Install dependencies and generate the Prisma client:
   ```bash
   npm ci
   npm run prisma:generate
   ```
3. Run migrations/schema push against the target environment.
4. Start the API:
   ```bash
   npm start
   ```
5. Terminate TLS at your reverse proxy/load balancer.
6. Ensure cookie settings match your frontend domain and HTTPS setup.

## Security Considerations

- use a strong rotated `JWT_SECRET`;
- always run HTTPS in production;
- keep auth cookies `HttpOnly`/`SameSite` as configured;
- rate-limit sensitive endpoints;
- restrict CORS to explicit origins;
- enforce payload limits at the edge too;
- store credentials and secrets in a secret manager.

## Versioning Strategy

Current routes are unversioned (`/auth`, `/subjects`, `/users`).

Recommended strategy:

- introduce path versioning for breaking changes (`/v1/...`);
- preserve compatibility within a major version;
- publish deprecation plans and sunset dates for older versions.

## Contributing Guidelines

- keep strong TypeScript typing;
- validate HTTP payloads with Zod in controllers;
- keep business logic in services;
- keep repositories persistence-focused;
- for protected endpoints, enforce authentication + ownership;
- update this README whenever the API contract changes.

Suggested local workflow:

```bash
npm install
npm run prisma:generate
npm run build
npm run dev
```

## License

ISC
