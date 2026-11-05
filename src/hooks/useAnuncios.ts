import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { codigosDoEspaco } from "@/components/ads/posicoes";

export interface AnuncioSite {
  id: string;
  titulo: string;
  imagem_url: string | null;
  link_destino: string | null;
  data_inicio: string;
  data_fim: string;
  posicao: string;
  ativo: boolean | null;
  ordem: number | null;
}

/** Está ativo, dentro do período e tem imagem (sem imagem não há o que mostrar). */
export const anuncioNoAr = (a: Pick<AnuncioSite, "ativo" | "data_inicio" | "data_fim" | "imagem_url">, agora = Date.now()) =>
  a.ativo === true && !!a.imagem_url && new Date(a.data_inicio).getTime() <= agora && new Date(a.data_fim).getTime() >= agora;

/*
 * Cache por posição: uma lista de questões pode ter vários espaços do mesmo
 * anúncio; sem isso cada espaço faria a própria consulta.
 */
const CACHE_MS = 60_000;
const cache = new Map<string, { quando: number; promessa: Promise<AnuncioSite[]> }>();

const buscar = (posicao: string): Promise<AnuncioSite[]> => {
  const salvo = cache.get(posicao);
  if (salvo && Date.now() - salvo.quando < CACHE_MS) return salvo.promessa;
  const promessa = (async () => {
    const { data, error } = await supabase
      .from("anuncios")
      .select("id, titulo, imagem_url, link_destino, data_inicio, data_fim, posicao, ativo, ordem")
      .in("posicao", codigosDoEspaco(posicao))
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    // O RLS já esconde os inativos do público, mas um administrador logado
    // enxerga todos; por isso o filtro também é feito aqui.
    return ((data || []) as AnuncioSite[]).filter((a) => anuncioNoAr(a));
  })();
  promessa.catch(() => cache.delete(posicao));
  cache.set(posicao, { quando: Date.now(), promessa });
  return promessa;
};

/** Limpa o cache (o admin chama depois de salvar). */
export const limparCacheAnuncios = () => cache.clear();

export const useAnuncios = (posicao: string) => {
  const [anuncios, setAnuncios] = useState<AnuncioSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    buscar(posicao)
      .then((lista) => {
        if (!vivo) return;
        setAnuncios(lista);
        setError(null);
      })
      .catch((err) => {
        if (!vivo) return;
        console.error("Erro ao buscar anúncios:", err);
        setError("Falha ao carregar anúncios");
      })
      .finally(() => vivo && setLoading(false));
    return () => {
      vivo = false;
    };
  }, [posicao]);

  return { anuncios, loading, error };
};

/** O anúncio de maior prioridade (menor ordem) da posição. */
export const useAnuncioAtivo = (posicao: string) => {
  const { anuncios, loading, error } = useAnuncios(posicao);
  return { anuncio: anuncios[0] || null, loading, error };
};
