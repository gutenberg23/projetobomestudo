// Reescreve um texto de notícia com IA (usado pelo painel do blog).
// A lógica de IA fica em _shared/news.ts e _shared/ai.ts, compartilhada com
// a sincronização automática de RSS (rss-auto-sync).

// @ts-ignore - import remoto do Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authorize, STAFF_ROLES } from "../_shared/auth.ts";
import { rewriteNews } from "../_shared/news.ts";
import { AIError } from "../_shared/ai.ts";
import { creditHtml, findCityImage } from "../_shared/images.ts";

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await authorize(req, [...STAFF_ROLES, "jornalista"]);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  try {
    const { originalContent, originalTitle, sourceUrl } = await req.json();
    if (typeof originalContent !== "string" || typeof originalTitle !== "string" || !originalContent || !originalTitle) {
      return json({ error: "originalContent e originalTitle são obrigatórios" }, 400);
    }

    const result = await rewriteNews(
      originalTitle.slice(0, 300),
      originalContent,
      typeof sourceUrl === "string" ? sourceUrl : undefined,
    );
    console.log("Conteúdo reescrito com", `${result.provider}/${result.model}`);
    // Sugestão de foto destaque da cidade do concurso (opcional)
    const image = await findCityImage(result.city, result.state, result.region).catch(() => null);
    return json({
      ...result,
      featuredImage: image?.url || null,
      featuredImageCredit: image ? creditHtml(image) : null,
    });
  } catch (error) {
    if (error instanceof AIError) {
      console.error("Falha na IA:", error.attempts.join(" | "));
      return json(
        {
          error: error.rateLimited
            ? "Limite gratuito da IA atingido. Tente novamente mais tarde."
            : error.message,
          details: error.attempts,
        },
        error.rateLimited ? 429 : 502,
      );
    }
    console.error("Erro na edge function rewrite-content:", error);
    return json({ error: error instanceof Error ? error.message : "Erro interno do servidor" }, 500);
  }
});
