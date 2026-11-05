import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popup } from "@/types/popup";
import { PAGINA_TODAS } from "@/components/popups/paginas";

const CHAVE_DISPENSADOS = "dismissedPopups"; // "não mostrar novamente" (para sempre neste navegador)
const CHAVE_SESSAO = "popupsFechadosSessao"; // fechados nesta visita

const ler = (armazenamento: Storage | undefined, chave: string): string[] => {
  try {
    const v = JSON.parse(armazenamento?.getItem(chave) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const gravar = (armazenamento: Storage | undefined, chave: string, id: string) => {
  try {
    const lista = ler(armazenamento, chave);
    if (!lista.includes(id)) armazenamento?.setItem(chave, JSON.stringify([...lista, id]));
  } catch {
    /* navegação privada etc. */
  }
};

const local = () => (typeof window !== "undefined" ? window.localStorage : undefined);
const sessao = () => (typeof window !== "undefined" ? window.sessionStorage : undefined);

/** Está ativo e dentro do período. */
export const popupNoAr = (p: Pick<Popup, "ativo" | "data_inicio" | "data_fim">, agora = Date.now()) =>
  p.ativo === true && new Date(p.data_inicio).getTime() <= agora && new Date(p.data_fim).getTime() >= agora;

/**
 * Popup a mostrar na página atual: o de menor ordem entre os que estão no ar
 * para esta página ou para "Todas as páginas" e que o visitante ainda não fechou.
 * Fechar esconde o popup até o fim da visita; "Não mostrar novamente" esconde de vez.
 */
export const usePopups = (pagina: string | null) => {
  const [popup, setPopup] = useState<Popup | null>(null);

  useEffect(() => {
    let vivo = true;
    setPopup(null);
    if (!pagina) return;
    (async () => {
      const agora = new Date().toISOString();
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .in("pagina", [pagina, PAGINA_TODAS])
        .eq("ativo", true)
        .lte("data_inicio", agora)
        .gte("data_fim", agora)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });
      if (!vivo) return;
      if (error) {
        console.error("Erro ao buscar popup:", error);
        return;
      }
      const escondidos = new Set([...ler(local(), CHAVE_DISPENSADOS), ...ler(sessao(), CHAVE_SESSAO)]);
      const lista = (data || []) as Popup[];
      // Popup específico da página vem antes do "todas" de mesma ordem
      lista.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || Number(a.pagina === PAGINA_TODAS) - Number(b.pagina === PAGINA_TODAS));
      setPopup(lista.find((p) => p.id && !escondidos.has(p.id)) || null);
    })();
    return () => {
      vivo = false;
    };
  }, [pagina]);

  const fechar = useCallback((id: string, paraSempre: boolean) => {
    gravar(sessao(), CHAVE_SESSAO, id);
    if (paraSempre) gravar(local(), CHAVE_DISPENSADOS, id);
    setPopup(null);
  }, []);

  return { popup, fechar };
};
