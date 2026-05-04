import { Agent, fetch as undiciFetch } from "undici";
import { Ollama, type Config } from "ollama";

const DEFAULT_HOST = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "llama3.2";

/** 24h — espera até cabeçalhos HTTP completos (o gargalo típico é o corpo, ver agente abaixo). */
const OLLAMA_HEADERS_TIMEOUT_MS = 86_400_000;

/**
 * O `fetch` global do Node (Undici) corta o corpo ao fim de ~300s sem dados.
 * O Ollama pode demorar muito sem enviar bytes até terminar a inferência; desativamos esse limite.
 */
const ollamaUndiciAgent = new Agent({
  bodyTimeout: 0,
  headersTimeout: OLLAMA_HEADERS_TIMEOUT_MS,
  connectTimeout: 120_000,
});

function createOllamaUndiciFetch(): typeof fetch {
  return ((input, init) =>
    undiciFetch(input as never, {
      ...(init as Record<string, unknown> | undefined),
      dispatcher: ollamaUndiciAgent,
    } as never)) as typeof fetch;
}

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
    fetch: overrides?.fetch ?? createOllamaUndiciFetch(),
  });
}
