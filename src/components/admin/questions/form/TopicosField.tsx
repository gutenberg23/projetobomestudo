
import React, { useState, useEffect } from "react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { supabase } from "@/integrations/supabase/client";
import { Topico } from "../types";
import { toast } from "sonner";

interface TopicosFieldProps {
  disciplina: string;
  topicos: string[];
  setTopicos: (topicos: string[]) => void;
}

const TopicosField: React.FC<TopicosFieldProps> = ({
  disciplina,
  topicos,
  setTopicos
}) => {
  const [topicosList, setTopicosList] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopicos = async () => {
      if (!disciplina) {
        setTopicosList([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('topicos')
          .select('*')
          .eq('disciplina', disciplina);

        if (error) {
          throw error;
        }

        setTopicosList(data || []);
      } catch (error) {
        console.error("Erro ao buscar tópicos:", error);
        toast.error("Erro ao carregar tópicos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicos();
  }, [disciplina]);

  const handleTopicosChange = (topico: string) => {
    if (topicos.includes(topico)) {
      setTopicos(topicos.filter(t => t !== topico));
    } else {
      setTopicos([...topicos, topico]);
    }
  };

  if (!disciplina) {
    return null;
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[#272f3c] mb-1">
        Tópicos
      </label>
      {loading ? (
        <div className="text-sm text-gray-500">Carregando tópicos...</div>
      ) : topicosList.length > 0 ? (
        <CheckboxGroup
          title="Selecione os tópicos"
          options={topicosList.map(t => t.nome)}
          selectedValues={topicos}
          onChange={handleTopicosChange}
        />
      ) : (
        <div className="text-sm text-gray-500">
          Nenhum tópico disponível para esta disciplina
        </div>
      )}
    </div>
  );
};

export default TopicosField;
