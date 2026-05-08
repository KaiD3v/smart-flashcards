import Groq from "groq-sdk";
import type { AgentChatParams, AgentChatResponse, AgentRole } from "./llm.types";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function resolveGroqModel(): string {
  const model = process.env.GROQ_MODEL?.trim();
  return model && model.length > 0 ? model : DEFAULT_MODEL;
}

function wantsJsonOutput(format: AgentChatParams["format"]): boolean {
  return format === "json";
}

/**
 * Chat não-streaming via Groq (API compatível com OpenAI).
 */
export async function groqChat(params: AgentChatParams): Promise<AgentChatResponse> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is required when LLM_PROVIDER=groq");
  }

  const model = params.model?.trim() || resolveGroqModel();
  const temperature = params.options?.temperature;

  const client = new Groq({ apiKey });
  const jsonMode = wantsJsonOutput(params.format);

  const completion = await client.chat.completions.create({
    model,
    messages: params.messages.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    })),
    ...(typeof temperature === "number" ? { temperature } : {}),
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  const choice = completion.choices[0];
  const rawContent = choice?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : "";

  const role = (choice?.message?.role ?? "assistant") as AgentRole;

  return {
    message: {
      role,
      content,
    },
  };
}
