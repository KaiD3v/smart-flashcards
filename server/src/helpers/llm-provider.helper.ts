export type LlmProviderId = "ollama" | "groq";

export function resolveLlmProvider(): LlmProviderId {
  const raw = process.env.LLM_PROVIDER?.trim().toLowerCase();
  return raw === "groq" ? "groq" : "ollama";
}
