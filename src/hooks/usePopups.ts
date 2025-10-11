import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popup } from "@/types/popup";

interface PopupDB {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  titulo: string;
  conteudo: string | null;
  imagem_url: string | null;
  link_destino: string | null;
  data_inicio: string;
  data_fim: string;
  pagina: string;
  ativo: boolean | null;
  ordem: number | null;
}

export const usePopups = (currentPage: string) => {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivePopup();
  }, [currentPage]);

  const fetchActivePopup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se o usuário já optou por não mostrar novamente
      const dismissedPopups = JSON.parse(localStorage.getItem('dismissedPopups') || '[]');
      
      const now = new Date().toISOString();
      
      // Buscar popups ativos para a página atual
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .eq("pagina", currentPage)
        .eq("ativo", true)
        .lte("data_inicio", now)
        .gte("data_fim", now)
        .order("ordem", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 é o código para "nenhum registro encontrado"
        throw error;
      }
      
      // Verificar se o popup já foi dispensado
      if (data && !dismissedPopups.includes(data.id)) {
        // Converter o tipo do popup para corresponder à interface esperada
        const convertedPopup: Popup = {
          id: data.id,
          titulo: data.titulo,
          conteudo: data.conteudo !== null ? data.conteudo : undefined,
          imagem_url: data.imagem_url !== null ? data.imagem_url : undefined,
          link_destino: data.link_destino !== null ? data.link_destino : undefined,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          pagina: data.pagina,
          ativo: data.ativo !== null ? data.ativo : undefined,
          ordem: data.ordem !== null ? data.ordem : undefined,
          created_at: data.created_at !== null ? data.created_at : undefined,
          updated_at: data.updated_at !== null ? data.updated_at : undefined
        };
        
        setPopup(convertedPopup);
      } else {
        setPopup(null);
      }
    } catch (err) {
      console.error("Erro ao buscar popup ativo:", err);
      setError("Falha ao carregar popup");
    } finally {
      setLoading(false);
    }
  };

  const dismissPopup = (popupId: string) => {
    // Adicionar o ID do popup à lista de popups dispensados
    const dismissedPopups = JSON.parse(localStorage.getItem('dismissedPopups') || '[]');
    dismissedPopups.push(popupId);
    localStorage.setItem('dismissedPopups', JSON.stringify(dismissedPopups));
    
    setPopup(null);
  };

  return { popup, loading, error, dismissPopup, refetch: fetchActivePopup };
};