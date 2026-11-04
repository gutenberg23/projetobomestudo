import { supabase } from "@/integrations/supabase/client";

export interface ConcursoExtractedData {
  titulo: string;
  dataInicioInscricao: string;
  dataFimInscricao: string;
  dataProva: string;
  prorrogado: boolean;
  niveis: string[];
  cargos: string[];
  vagas: number;
  salario: string;
  estados: string[];
}

export type FonteAutoPreencher = { postId: string } | { texto: string; titulo?: string };

/** Lê a mensagem de erro devolvida pela Edge Function, quando houver. */
async function mensagemDoErro(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const body = await ctx.clone().json();
      if (body?.error) return String(body.error);
    } catch {
      /* corpo não é JSON */
    }
    if (ctx.status === 404) {
      return "A função extract-concurso ainda não foi publicada no Supabase.";
    }
  }
  return error instanceof Error ? error.message : "Erro ao chamar a IA";
}

/**
 * Extrai os dados do concurso de um post do blog (ou de um texto colado)
 * usando a mesma IA gratuita da reescrita de notícias (Gemini e Groq),
 * pela Edge Function `extract-concurso`.
 */
export async function autoPreencherConcurso(fonte: FonteAutoPreencher | string): Promise<ConcursoExtractedData & { provider?: string }> {
  const body = typeof fonte === "string" ? { postId: fonte } : fonte;
  const { data, error } = await supabase.functions.invoke("extract-concurso", { body });
  if (error) throw new Error(await mensagemDoErro(error));
  if (!data?.dados) throw new Error(data?.error || "Resposta inválida da IA");
  return { ...data.dados, provider: data.provider };
}
