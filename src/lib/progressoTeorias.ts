import { supabase } from "@/integrations/supabase/client";

/*
 * Teorias concluídas pelo aluno (tabela teorias_progresso, migration 20251120000000).
 * A marca vale em todos os cursos que usam a teoria.
 */

// A tabela ainda não está nos tipos gerados do Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const LOTE = 150;

/** Avisado quando o aluno marca ou desmarca uma teoria (para outras partes da página se atualizarem). */
export const EVENTO_PROGRESSO_TEORIAS = "bomestudo:teorias-progresso";

export interface DetalheProgressoTeoria {
  teoriaId: string;
  concluida: boolean;
}

export const faltaMigrationProgresso = (error: unknown) => {
  const e = error as { code?: string; message?: string } | null;
  return !!e && (e.code === "42P01" || e.code === "PGRST205" || /teorias_progresso/i.test(e.message || ""));
};

/** Quais destas teorias o aluno já concluiu. */
export async function buscarTeoriasConcluidas(userId: string, teoriasIds: string[]): Promise<Set<string>> {
  const ids = Array.from(new Set(teoriasIds.filter(Boolean)));
  const feitas = new Set<string>();
  for (let i = 0; i < ids.length; i += LOTE) {
    const { data, error } = await db
      .from("teorias_progresso")
      .select("teoria_id")
      .eq("user_id", userId)
      .in("teoria_id", ids.slice(i, i + LOTE));
    if (error) throw error;
    ((data || []) as { teoria_id: string }[]).forEach((r) => feitas.add(String(r.teoria_id)));
  }
  return feitas;
}

/** Marca ou desmarca a teoria como concluída e avisa a página. */
export async function marcarTeoria(userId: string, teoriaId: string, concluida: boolean) {
  const { error } = concluida
    ? await db.from("teorias_progresso").upsert({ user_id: userId, teoria_id: teoriaId }, { onConflict: "user_id,teoria_id", ignoreDuplicates: true })
    : await db.from("teorias_progresso").delete().eq("user_id", userId).eq("teoria_id", teoriaId);
  if (error) throw error;
  document.dispatchEvent(new CustomEvent<DetalheProgressoTeoria>(EVENTO_PROGRESSO_TEORIAS, { detail: { teoriaId, concluida } }));
}
