/** Papéis aceites por Ollama chat e pela API chat da Groq (OpenAI-compatible). */
export type AgentRole = "system" | "user" | "assistant";

export type AgentMessage = {
  role: AgentRole;
  content: string;
};

/** Parâmetros agnósticos de provedor para chat não-streaming. */
export type AgentChatParams = {
  messages: AgentMessage[];
  model?: string;
  stream?: false;
  /**
   * `json` ativa saída estruturada (Ollama: `format`; Groq: `response_format` json_object).
   * Outros valores são repassados apenas ao Ollama.
   */
  format?: unknown;
  options?: Partial<{ temperature?: number }>;
};

export type AgentChatResponse = {
  message: {
    role: AgentRole;
    content: string;
  };
};
