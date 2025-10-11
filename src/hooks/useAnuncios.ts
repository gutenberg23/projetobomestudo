import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Anuncio {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  titulo: string;
  imagem_url: string | null;
  link_destino: string | null;
  data_inicio: string;
  data_fim: string;
  posicao: string;
  ativo: boolean | null;
  ordem: number | null;
}

export const useAnuncios = (posicao: string) => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnuncios();
  }, [posicao]);

  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Deixar o RLS cuidar da filtragem de data e status ativo
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("posicao", posicao)
        .order("ordem", { ascending: true });

      if (error) throw error;
      
      setAnuncios(data || []);
    } catch (err) {
      console.error("Erro ao buscar anúncios:", err);
      setError("Falha ao carregar anúncios");
    } finally {
      setLoading(false);
    }
  };

  return { anuncios, loading, error, refetch: fetchAnuncios };
};

export const useAnuncioAtivo = (posicao: string) => {
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnuncioAtivo();
  }, [posicao]);

  const fetchAnuncioAtivo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Deixar o RLS cuidar da filtragem de data e status ativo
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("posicao", posicao)
        .order("ordem", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 é o código para "nenhum registro encontrado"
        throw error;
      }
      
      setAnuncio(data || null);
    } catch (err) {
      console.error("Erro ao buscar anúncio ativo:", err);
      setError("Falha ao carregar anúncio");
    } finally {
      setLoading(false);
    }
  };

  return { anuncio, loading, error, refetch: fetchAnuncioAtivo };
};