import { Ollama, type Config } from "ollama";

const DEFAULT_HOST = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "llama3.2";

export function resolveOllamaHost(): string {
  const host = process.env.OLLAMA_HOST?.trim();
  return host && host.length > 0 ? host : DEFAULT_HOST;
}

export function resolveOllamaModel(): string {
  const model = process.env.OLLAMA_MODEL?.trim();
  return model && model.length > 0 ? model : DEFAULT_MODEL;
}

function resolveDefaultHeaders(): Record<string, string> | undefined {
  const key = process.env.OLLAMA_API_KEY?.trim();
  if (!key) {
    return undefined;
  }
  return { Authorization: `Bearer ${key}` };
}

/**
 * Cliente Ollama configurável por ambiente (`OLLAMA_HOST`, `OLLAMA_API_KEY`, etc.).
 */
export function createOllamaClient(overrides?: Partial<Config>): Ollama {
  const host = overrides?.host ?? resolveOllamaHost();
  const headers = overrides?.headers ?? resolveDefaultHeaders();
  return new Ollama({
    ...overrides,
    host,
    ...(headers !== undefined ? { headers } : {}),
  });
}
