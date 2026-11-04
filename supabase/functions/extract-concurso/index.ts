// Extrai os dados de um concurso (datas, níveis, cargos, vagas, salário e
// estados) de um post do blog ou de um texto colado, usando a mesma IA
// gratuita da reescrita de notícias (Gemini → Groq → OpenRouter).
//
// POST JSON: { "postId": "uuid" }  ou  { "texto": "...", "titulo"?: "..." }
// Resposta: { dados: ConcursoExtraido, provider: "gemini/..." }

// @ts-ignore - import remoto do Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - import remoto do Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { authorize, STAFF_ROLES } from "../_shared/auth.ts";
import { AIError, generateJson } from "../_shared/ai.ts";
import { buildPrompt, htmlParaTexto, MAX_TEXTO, normalizarConcurso, SYSTEM_PROMPT } from "../_shared/concurso.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const auth = await authorize(req, [...STAFF_ROLES, "jornalista"]);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  let titulo = typeof body.titulo === "string" ? body.titulo.slice(0, 300) : "";
  let texto = typeof body.texto === "string" ? htmlParaTexto(body.texto) : "";

  if (typeof body.postId === "string" && body.postId) {
    const db = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "", {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: post, error } = await db
      .from("blog_posts")
      .select("title, summary, content")
      .eq("id", body.postId)
      .maybeSingle();
    if (error) return json({ error: `Erro ao ler o post: ${error.message}` }, 500);
    if (!post) return json({ error: "Post não encontrado" }, 404);
    titulo = post.title || titulo;
    texto = `${post.summary || ""}\n${htmlParaTexto(post.content || "")}`.trim();
  }

  if (texto.length < 80) {
    return json({ error: "Texto curto demais para extrair os dados do concurso" }, 400);
  }

  try {
    const hoje = new Date();
    const result = await generateJson({
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(titulo, texto.slice(0, MAX_TEXTO), hoje.toISOString().slice(0, 10)),
      temperature: 0.1,
      maxOutputTokens: 2048,
    });
    const dados = normalizarConcurso(result.data, hoje);
    console.log("[extract-concurso] ok com", `${result.provider}/${result.model}`);
    return json({ dados, provider: `${result.provider}/${result.model}` });
  } catch (error) {
    if (error instanceof AIError) {
      console.error("[extract-concurso] IA falhou:", error.attempts.join(" | "));
      return json(
        {
          error: error.rateLimited
            ? "Limite gratuito da IA atingido. Tente de novo em alguns minutos."
            : error.message,
          details: error.attempts,
        },
        error.rateLimited ? 429 : 502,
      );
    }
    console.error("[extract-concurso] erro", error);
    return json({ error: error instanceof Error ? error.message : "Erro interno" }, 500);
  }
});
