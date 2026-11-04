// Gera a "Explicação da IA" de uma questão de concurso, usando a mesma IA
// gratuita da reescrita de notícias (Gemini → Groq → OpenRouter, com troca
// automática quando um provedor falha ou estoura o limite gratuito).
//
// POST JSON:
//   { "questao": { enunciado, alternativas: [{ letra, texto, correta }], tipo,
//                  disciplina, banca, orgao, ano, assuntos, topicos,
//                  textoApoio, explicacaoExistente },
//     "instrucoes"?: "pedido extra do professor" }
//   ou, formato antigo: { "prompt": "texto livre" }
// Resposta: { text: "<p>...</p>", provider: "gemini/gemini-flash-latest" }

// @ts-ignore - import remoto do Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authorize, STAFF_ROLES } from "../_shared/auth.ts";
import { AIError, generateJson } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM_PROMPT = `Você é professor de cursinho preparatório para concursos públicos no Brasil.
Explica questões de prova de forma clara, correta e didática, em português do Brasil.
Responda somente com um objeto JSON válido no formato {"html": "..."}.`;

const REGRAS_HTML = `Formato do campo "html":
- HTML simples, sem Markdown, sem crases e sem <html>, <body>, <style> ou <script>.
- Use <p> para parágrafos, <strong> para destaques, <ul>/<ol> com <li> para listas e <h3> para títulos curtos.
- Não repita o enunciado inteiro.`;

const MAX = 12_000;

/** Converte HTML em texto simples para economizar tokens. */
function texto(html: unknown): string {
  if (typeof html !== "string") return "";
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<img[^>]*>/gi, " [imagem] ")
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<\/(tr|p|li|h[1-6]|div)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

const lista = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).join("; ") : "");

interface Alternativa {
  letra?: string;
  texto?: string;
  correta?: boolean;
}

function montarPrompt(q: Record<string, unknown>, instrucoes: string): string {
  const alternativas = (Array.isArray(q.alternativas) ? q.alternativas : []) as Alternativa[];
  const tipo = typeof q.tipo === "string" ? q.tipo : "";
  const certoErrado = /certo|errado/i.test(tipo);
  const gabarito = alternativas.find((a) => a.correta);
  const contexto = [
    q.banca && `Banca: ${q.banca}`,
    q.orgao && `Órgão: ${q.orgao}`,
    q.ano && `Ano: ${q.ano}`,
    q.disciplina && `Disciplina: ${q.disciplina}`,
    lista(q.assuntos) && `Assuntos: ${lista(q.assuntos)}`,
    lista(q.topicos) && `Tópicos: ${lista(q.topicos)}`,
    tipo && `Tipo: ${tipo}`,
  ]
    .filter(Boolean)
    .join("\n");

  const apoio = texto(q.textoApoio);
  const existente = texto(q.explicacaoExistente);

  const pedido = certoErrado
    ? `Explique por que o item está ${gabarito ? `"${texto(gabarito.texto)}"` : "certo ou errado"}, apontando o fundamento (lei, conceito, jurisprudência ou regra) e o trecho que torna o item certo ou errado.`
    : `Explique por que a alternativa ${gabarito?.letra || "correta"} é a correta e, em seguida, por que cada uma das outras está errada (uma linha ou parágrafo curto por alternativa, começando com a letra em <strong>).`;

  return `${contexto}

${apoio ? `Texto de apoio:\n"""\n${apoio}\n"""\n\n` : ""}Enunciado:
"""
${texto(q.enunciado)}
"""

${alternativas.length ? `Alternativas:\n${alternativas.map((a) => `${a.letra || "-"}) ${texto(a.texto)}${a.correta ? "  ← GABARITO" : ""}`).join("\n")}\n` : ""}
${pedido}
Use o gabarito informado; não conteste o gabarito. Cite artigos de lei apenas se tiver certeza do número.
${existente ? `\nJá existe esta explicação; escreva uma nova versão melhor, sem copiar frases:\n"""\n${existente}\n"""\n` : ""}${instrucoes ? `\nPedido do professor: ${instrucoes}\n` : ""}
${REGRAS_HTML}`.slice(0, MAX);
}

/** Remove o que não deve ir para o banco e garante parágrafos. */
function limparHtml(html: string): string {
  let s = html
    .replace(/```(?:html)?/gi, "")
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(html|head|body)[^>]*>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .trim();
  if (s && !/^<(p|h\d|ul|ol|div|table|blockquote)/i.test(s)) {
    s = s
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }
  return s;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const auth = await authorize(req, STAFF_ROLES);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const instrucoes = typeof body.instrucoes === "string" ? body.instrucoes.trim().slice(0, 1000) : "";
  let prompt = "";
  if (body.questao && typeof body.questao === "object") {
    const q = body.questao as Record<string, unknown>;
    if (texto(q.enunciado).length < 10) return json({ error: "Escreva o enunciado antes de gerar a explicação" }, 400);
    prompt = montarPrompt(q, instrucoes);
  } else if (typeof body.prompt === "string" && body.prompt.trim()) {
    prompt = `${body.prompt.trim().slice(0, MAX)}\n\n${REGRAS_HTML}`;
  } else {
    return json({ error: "Envie a questão (ou um prompt)" }, 400);
  }

  try {
    const result = await generateJson({ system: SYSTEM_PROMPT, prompt, temperature: 0.4, maxOutputTokens: 4096 });
    const bruto = typeof result.data.html === "string" ? result.data.html : typeof result.data.text === "string" ? result.data.text : "";
    const html = limparHtml(bruto);
    if (!html) return json({ error: "A IA devolveu uma explicação vazia. Tente de novo." }, 502);
    console.log("[generate-question-explanation] ok com", `${result.provider}/${result.model}`);
    return json({ text: html, provider: `${result.provider}/${result.model}` });
  } catch (error) {
    if (error instanceof AIError) {
      console.error("[generate-question-explanation] IA falhou:", error.attempts.join(" | "));
      return json(
        {
          error: error.rateLimited
            ? "O limite gratuito da IA acabou por agora. Tente de novo em alguns minutos."
            : error.message,
          detalhes: error.attempts,
        },
        error.rateLimited ? 429 : 502,
      );
    }
    console.error("[generate-question-explanation] erro:", error);
    return json({ error: error instanceof Error ? error.message : "Erro interno" }, 500);
  }
});
