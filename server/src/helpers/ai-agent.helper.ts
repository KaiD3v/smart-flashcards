import type { ChatRequest, ChatResponse, Message, Options } from "ollama";
import { createOllamaClient, resolveOllamaModel } from "./ollama-client.helper";

/**
 * Chat não-streaming com o modelo configurado em `OLLAMA_MODEL` (ou override).
 * Expõe a API `chat` do cliente Ollama para perguntas ao agente.
 */
export async function chatWithAgent(
  params: Omit<ChatRequest, "stream" | "model"> & {
    model?: string;
    stream?: false;
  }
): Promise<ChatResponse> {
  const client = createOllamaClient();
  const model = params.model ?? resolveOllamaModel();
  return client.chat({
    ...params,
    model,
    stream: false,
  });
}

export type AskAgentParams = {
  userMessage: string;
  systemPrompt?: string;
  /** Mensagens anteriores (ex.: histórico); não incluir a última pergunta do utilizador. */
  conversation?: Message[];
  model?: string;
  options?: Partial<Options>;
  format?: ChatRequest["format"];
};

/**
 * Pergunta ao agente e devolve só o texto da última resposta do modelo.
 */
export async function askAgent(params: AskAgentParams): Promise<string> {
  const messages: Message[] = [];

  if (params.systemPrompt !== undefined && params.systemPrompt.length > 0) {
    messages.push({ role: "system", content: params.systemPrompt });
  }

  if (params.conversation !== undefined) {
    messages.push(...params.conversation);
  }

  messages.push({ role: "user", content: params.userMessage });

  const response = await chatWithAgent({
    messages,
    model: params.model,
    options: params.options,
    format: params.format,
  });

  return response.message.content;
}
