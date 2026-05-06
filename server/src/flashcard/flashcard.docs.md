# Flashcard Review (FSRS)

Esta documentação descreve o fluxo de revisão espaçada dos flashcards com FSRS (`ts-fsrs`) no backend.

## Visão geral

A funcionalidade implementa repetição espaçada com FSRS para:

- listar flashcards pendentes de revisão;
- revisar um flashcard com rating (`again`, `hard`, `good`, `easy`);
- atualizar estado de memória do card com base no cálculo da lib.

## Arquitetura

### Camadas principais

- `flashcard.router.ts`
  - expõe as rotas HTTP;
- `flashcard.controller.ts`
  - valida entrada HTTP e delega ao service;
- `flashcard.service.ts`
  - orquestra regras de negócio e ownership;
- `flashcard.repository.ts`
  - acesso ao banco via Prisma;
- `helpers/fsrs/*`
  - adapter/wrapper da lib `ts-fsrs`.

### Princípios adotados

- sem lógica de scheduling no controller;
- cálculo de próximo estado delegado ao helper FSRS;
- sem filtro em memória para pendências (`need-review`);
- query eficiente e ordenada por vencimento.

## Modelo de dados (Flashcard)

Campos usados no agendamento:

- `due: DateTime`
- `lastReviewedAt: DateTime?`
- `stability: Float`
- `difficulty: Float`
- `reps: Int`
- `lapses: Int`
- `state: Int`

Índice recomendado:

- `@@index([due])`

## Rotas

As rotas estão aninhadas em:

`/subjects/:id/flashcards`

### 1) Listar cards pendentes

`GET /subjects/:id/flashcards/need-review`

#### Regra de seleção

- retorna apenas cards com `due <= now`
- ordena por `due ASC` (mais atrasados primeiro)

#### Resposta (exemplo)

```json
{
  "flashcards": [
    {
      "id": "card-id",
      "front": "Pergunta",
      "back": "Resposta",
      "due": "2026-05-06T16:00:00.000Z",
      "stability": 1.2,
      "difficulty": 5.0,
      "reps": 2,
      "lapses": 0,
      "state": 2
    }
  ]
}
```

### 2) Revisar um card

`POST /subjects/:id/flashcards/:flashcardId/review`

#### Body

```json
{
  "rating": "good"
}
```

Ratings aceitos:

- `again`
- `hard`
- `good`
- `easy`

Também aceita variações capitalizadas (`Again`, `Hard`, `Good`, `Easy`), normalizando para minúsculo.

#### Fluxo interno

1. valida autenticação;
2. valida `flashcardId`;
3. valida body (`rating`);
4. busca card por usuário;
5. monta entrada do helper FSRS com estado atual do card;
6. executa scheduler da lib (`ts-fsrs`);
7. persiste novo estado (`due`, `stability`, `difficulty`, `lastReviewedAt`, `reps`, `lapses`, `state`);
8. retorna card atualizado.

#### Resposta (exemplo)

```json
{
  "flashcard": {
    "id": "card-id",
    "due": "2026-05-10T16:00:00.000Z",
    "lastReviewedAt": "2026-05-06T16:35:00.000Z",
    "stability": 2.34,
    "difficulty": 4.21,
    "reps": 3,
    "lapses": 1,
    "state": 2
  }
}
```

## Helper FSRS

Estrutura:

- `helpers/fsrs/index.ts`
- `helpers/fsrs/fsrs.service.ts`
- `helpers/fsrs/fsrs.types.ts`

Responsabilidades:

- encapsular `ts-fsrs`;
- mapear `rating` da API para enum da lib;
- converter modelo interno para o formato da lib;
- retornar modelo de domínio sem vazar tipos externos.

## Comportamento esperado

- `again` reduz/encurta próximo intervalo;
- `hard` aumenta pouco;
- `good` aumenta de forma equilibrada;
- `easy` aumenta mais.

O campo `due` passa a ser a fonte de verdade para fila de revisão (`need-review`).

## Erros comuns

- `401 Not authenticated`
  - usuário sem sessão/token válido;
- `404 Flashcard not found`
  - card inexistente ou não pertence ao usuário;
- `400 Validation failed`
  - body inválido (ex.: `rating` fora dos valores aceitos).

## Fluxo de uso recomendado (cliente)

1. criar/gerar cards com persistência;
2. chamar `need-review`;
3. para cada card, enviar `review` com rating;
4. atualizar UI com resposta e chamar `need-review` novamente.
