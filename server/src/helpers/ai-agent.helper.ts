import type { ChatRequest } from "ollama";
import { groqChat } from "./groq-chat.helper";
import type { AgentChatParams, AgentChatResponse, AgentMessage } from "./llm.types";
import { resolveLlmProvider } from "./llm-provider.helper";
import { createOllamaClient, resolveOllamaModel } from "./ollama-client.helper";

/**
 * Chat não-streaming via `LLM_PROVIDER` (`ollama` | `groq`).
 * O modelo default vem de `OLLAMA_MODEL` ou `GROQ_MODEL`, conforme o provedor.
 */
export async function chatWithAgent(params: AgentChatParams): Promise<AgentChatResponse> {
  if (resolveLlmProvider() === "groq") {
    return groqChat(params);
  }

  const client = createOllamaClient();
  const model = params.model ?? resolveOllamaModel();
  const res = await client.chat({
    messages: params.messages,
    model,
    stream: false,
    format: params.format as ChatRequest["format"],
    options: params.options,
  });

  return {
    message: {
      role: res.message.role as AgentMessage["role"],
      content: res.message.content,
    },
  };
}

export type AskAgentParams = {
  userMessage: string;
  systemPrompt?: string;
  /** Mensagens anteriores (ex.: histórico); não incluir a última pergunta do utilizador. */
  conversation?: AgentMessage[];
  model?: string;
  options?: AgentChatParams["options"];
  format?: AgentChatParams["format"];
};

/**
 * Pergunta ao agente e devolve só o texto da última resposta do modelo.
 */
export async function askAgent(params: AskAgentParams): Promise<string> {
  const messages: AgentMessage[] = [];

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
