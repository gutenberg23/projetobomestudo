// Cliente de IA com vários provedores gratuitos e troca automática.
//
// Cada provedor só entra na fila se a chave dele estiver configurada como
// secret no Supabase. Se um provedor falhar (limite gratuito estourado,
// modelo fora do ar, JSON inválido), o próximo é tentado.
//
// Secrets reconhecidos (todos opcionais, mas pelo menos um é necessário):
//   GOOGLE_GEMINI_API_KEY   Google AI Studio (recomendado)
//   GEMINI_MODEL            padrão: gemini-flash-latest
//   GEMINI_FALLBACK_MODEL   padrão: gemini-flash-lite-latest
//   GROQ_API_KEY            Groq (reserva rápida)
//   GROQ_MODEL              padrão: llama-3.3-70b-versatile
//   OPENROUTER_API_KEY      OpenRouter (só é usado se OPENROUTER_MODEL existir)
//   OPENROUTER_MODEL        ex.: um modelo com sufixo ":free"
//   AI_PROVIDERS            ordem, ex.: "gemini,groq,openrouter" (padrão)

declare const Deno: { env: { get(key: string): string | undefined } };

export interface AIRequest {
  system: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface AIResult {
  data: Record<string, unknown>;
  provider: string;
  model: string;
}

interface Provider {
  name: string;
  model: string;
  call: (req: AIRequest) => Promise<string>;
}

export class AIError extends Error {
  constructor(message: string, public attempts: string[], public rateLimited: boolean) {
    super(message);
  }
}

const REQUEST_TIMEOUT_MS = 60_000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

class ProviderHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function geminiProvider(apiKey: string, model: string): Provider {
  return {
    name: "gemini",
    model,
    call: async ({ system, prompt, temperature = 0.6, maxOutputTokens = 8192 }) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!res.ok) {
        throw new ProviderHttpError(res.status, (await res.text()).slice(0, 300));
      }
      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p: { text?: string }) => p.text || "").join("");
      if (!text) {
        const reason = json?.candidates?.[0]?.finishReason || json?.promptFeedback?.blockReason || "sem texto";
        throw new Error(`Resposta vazia (${reason})`);
      }
      return text;
    },
  };
}

// Groq, OpenRouter e outros que seguem o formato da API da OpenAI.
function openAICompatibleProvider(
  name: string,
  baseUrl: string,
  apiKey: string,
  model: string,
  extraHeaders: Record<string, string> = {},
  jsonMode = true,
): Provider {
  return {
    name,
    model,
    call: async ({ system, prompt, temperature = 0.6, maxOutputTokens = 8192 }) => {
      const body: Record<string, unknown> = {
        model,
        temperature,
        max_tokens: maxOutputTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      };
      if (jsonMode) body.response_format = { type: "json_object" };
      const res = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...extraHeaders,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new ProviderHttpError(res.status, (await res.text()).slice(0, 300));
      }
      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content;
      if (!text) throw new Error("Resposta vazia");
      return text;
    },
  };
}

export function configuredProviders(): Provider[] {
  const env = (k: string) => (Deno.env.get(k) || "").trim();
  const order = (env("AI_PROVIDERS") || "gemini,groq,openrouter")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const providers: Provider[] = [];
  for (const name of order) {
    if (name === "gemini" && env("GOOGLE_GEMINI_API_KEY")) {
      const key = env("GOOGLE_GEMINI_API_KEY");
      const main = env("GEMINI_MODEL") || "gemini-flash-latest";
      const fallback = env("GEMINI_FALLBACK_MODEL") || "gemini-flash-lite-latest";
      providers.push(geminiProvider(key, main));
      if (fallback && fallback !== main) providers.push(geminiProvider(key, fallback));
    } else if (name === "groq" && env("GROQ_API_KEY")) {
      providers.push(openAICompatibleProvider(
        "groq",
        "https://api.groq.com/openai/v1",
        env("GROQ_API_KEY"),
        env("GROQ_MODEL") || "llama-3.3-70b-versatile",
      ));
    } else if (name === "openrouter" && env("OPENROUTER_API_KEY") && env("OPENROUTER_MODEL")) {
      providers.push(openAICompatibleProvider(
        "openrouter",
        "https://openrouter.ai/api/v1",
        env("OPENROUTER_API_KEY"),
        env("OPENROUTER_MODEL"),
        { "X-Title": "Bom Estudo" },
        false, // nem todo modelo gratuito aceita response_format
      ));
    }
  }
  return providers;
}

// Extrai o primeiro objeto JSON de uma resposta, tolerando ```json ... ```
// e texto antes/depois.
export function parseJsonObject(text: string): Record<string, unknown> {
  let clean = text.trim();
  const fenced = clean.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) clean = fenced[1].trim();
  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
    // tenta recortar entre a primeira { e a última }
  }
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const parsed = JSON.parse(clean.slice(start, end + 1));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  }
  throw new Error("A IA não devolveu um JSON válido");
}

// Chama os provedores em ordem até um devolver um JSON válido.
export async function generateJson(req: AIRequest): Promise<AIResult> {
  const providers = configuredProviders();
  if (providers.length === 0) {
    throw new AIError(
      "Nenhum provedor de IA configurado. Defina GOOGLE_GEMINI_API_KEY (ou GROQ_API_KEY) nos secrets do Supabase.",
      [],
      false,
    );
  }

  const attempts: string[] = [];
  let allRateLimited = true;
  for (const provider of providers) {
    try {
      const text = await provider.call(req);
      const data = parseJsonObject(text);
      return { data, provider: provider.name, model: provider.model };
    } catch (err) {
      const status = err instanceof ProviderHttpError ? err.status : 0;
      if (status !== 429) allRateLimited = false;
      const msg = err instanceof Error ? err.message : String(err);
      attempts.push(`${provider.name}/${provider.model}: ${status ? `HTTP ${status} ` : ""}${msg}`.slice(0, 300));
      console.warn("[ai] provedor falhou", attempts[attempts.length - 1]);
    }
  }
  throw new AIError("Todos os provedores de IA falharam", attempts, allRateLimited);
}
