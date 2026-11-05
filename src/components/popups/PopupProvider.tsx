import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePopups } from "@/hooks/usePopups";
import Popup from "@/components/popups/Popup";
import { paginaDaRota } from "@/components/popups/paginas";
import type { Popup as PopupType } from "@/types/popup";

/** Espera um instante antes de abrir, para não cobrir a página ainda carregando. */
const ATRASO_MS = 1200;

/** ?previa_popup=<id> abre aquele popup na hora, mesmo pausado ou fora do período (usado pelo admin). */
const usePrevia = (search: string) => {
  const id = new URLSearchParams(search).get("previa_popup");
  const [previa, setPrevia] = useState<PopupType | null>(null);
  useEffect(() => {
    setPrevia(null);
    if (!id) return;
    let vivo = true;
    supabase
      .from("popups")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => vivo && setPrevia((data as PopupType) || null));
    return () => {
      vivo = false;
    };
  }, [id]);
  return { previa, fecharPrevia: () => setPrevia(null) };
};

/**
 * Mostra o popup configurado em /admin/popups para a página atual.
 * Fica uma vez só no App (dentro do BrowserRouter), valendo para todas as rotas.
 */
const PopupsDoSite = () => {
  const { pathname, search } = useLocation();
  const pagina = paginaDaRota(pathname);
  const { popup, fechar } = usePopups(pagina);
  const { previa, fecharPrevia } = usePrevia(search);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setPronto(false);
    if (!popup) return;
    const t = window.setTimeout(() => setPronto(true), ATRASO_MS);
    return () => window.clearTimeout(t);
  }, [popup]);

  if (previa) return <Popup key={`previa-${previa.id}`} popup={previa} onFechar={fecharPrevia} />;
  if (!popup?.id || !pronto) return null;
  return <Popup key={popup.id} popup={popup} onFechar={(paraSempre) => fechar(popup.id!, paraSempre)} />;
};

export default PopupsDoSite;
