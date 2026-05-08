import { z } from "zod";
import { chatWithAgent } from "./ai-agent.helper";

const flashcardsPayloadSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().min(1).max(8000),
      back: z.string().min(1).max(8000),
    })
  ),
});

export type GeneratedFlashcard = {
  front: string;
  back: string;
};

const FLASHCARD_SYSTEM_PROMPT = `És um assistente de estudo. Recebes material educativo e deves produzir flashcards em português (Portugal ou Brasil), apenas como JSON válido.
Regras:
- Devolve um único objeto JSON com a chave "flashcards", cujo valor é um array de objetos.
- Cada objeto tem "front" (pergunta ou estímulo) e "back" (resposta ou explicação); ambos obrigatoriamente em português.
- Textos curtos e claros para repetição espaçada.
- Cobre os conceitos principais do material; evita duplicados.
- Resposta só em JSON: sem markdown, sem cercas de código, sem texto antes ou depois do JSON.`;

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  if (fence?.[1]) {
    return fence[1].trim();
  }
  return trimmed;
}

function parseFlashcardsPayload(content: string): z.infer<typeof flashcardsPayloadSchema> {
  const jsonText = extractJsonObject(content);
  let data: unknown;
  try {
    data = JSON.parse(jsonText) as unknown;
  } catch {
    throw new Error("Model response was not valid JSON");
  }

  const parsed = flashcardsPayloadSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid flashcard payload: ${parsed.error.message}`);
  }
  return parsed.data;
}

export type GenerateFlashcardsFromTextParams = {
  /** Texto da matéria ou notas enviadas pelo utilizador. */
  materialText: string;
  model?: string;
  /** Limite superior de cartões (1–50). Default 20. */
  maxCards?: number;
};

/**
 * Envia o texto da matéria ao LLM (Ollama ou Groq) e devolve flashcards gerados (frente/verso).
 * Usa `format: "json"` para encorajar saída estruturada.
 */
export async function generateFlashcardsFromMaterialText(
  params: GenerateFlashcardsFromTextParams
): Promise<GeneratedFlashcard[]> {
  const maxCards = Math.min(Math.max(params.maxCards ?? 20, 1), 50);
  const userContent = `Gera no máximo ${maxCards} flashcards a partir do material abaixo. Lembra-te: frente e verso em português.\n\n---\n\n${params.materialText}`;

  const response = await chatWithAgent({
    model: params.model,
    format: "json",
    messages: [
      { role: "system", content: FLASHCARD_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    options: {
      temperature: 0.35,
    },
  });

  const payload = parseFlashcardsPayload(response.message.content);
  return payload.flashcards.slice(0, maxCards);
}
