import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Situacao } from "./filtros";
import { MAX_IDS_RESTRICAO, type Restricao } from "./useBuscaQuestoes";

/**
 * Última tentativa do aluno em cada questão (tabela user_question_attempts).
 * Serve para o filtro "Situação" e para marcar as questões já resolvidas.
 */
export function useTentativas(userId: string | null | undefined) {
  const [mapa, setMapa] = useState<Map<string, boolean>>(new Map());
  const [carregando, setCarregando] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setMapa(new Map());
      setCarregando(false);
      return;
    }
    let ativo = true;
    setCarregando(true);
    supabase
      .from("user_question_attempts")
      .select("question_id, is_correct")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1000)
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error) console.error("Erro ao carregar suas respostas:", error);
        setMapa(new Map((data || []).map((t) => [t.question_id as string, Boolean(t.is_correct)])));
        setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [userId]);

  /** Guarda na hora uma resposta dada nesta página. */
  const registrar = (questaoId: string, acertou: boolean) =>
    setMapa((m) => {
      const novo = new Map(m);
      novo.set(questaoId, acertou);
      return novo;
    });

  const resumo = useMemo(() => {
    let acertos = 0;
    mapa.forEach((v) => v && acertos++);
    return { resolvidas: mapa.size, acertos, aproveitamento: mapa.size ? Math.round((acertos / mapa.size) * 100) : 0 };
  }, [mapa]);

  /** Converte a situação escolhida em lista de ids para a consulta. */
  const restricaoPara = (situacao: Situacao): Restricao | null => {
    if (situacao === "todas" || !userId) return null;
    const ids = (certo: boolean | null) =>
      Array.from(mapa.entries())
        .filter(([, v]) => certo === null || v === certo)
        .map(([id]) => id)
        .slice(0, MAX_IDS_RESTRICAO);
    if (situacao === "nao_resolvidas") return { excluir: ids(null) };
    if (situacao === "erradas") return { incluir: ids(false) };
    return { incluir: ids(true) };
  };

  return { mapa, carregando, resumo, registrar, restricaoPara };
}
