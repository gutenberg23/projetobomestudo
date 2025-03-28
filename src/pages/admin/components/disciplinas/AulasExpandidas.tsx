import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AulasExpandidasProps {
  disciplinaId: string;
  aulasIds: string[];
}

interface Aula {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  created_at: string;
  topicos_ids: string[];
  questoes_ids: string[];
}

export const AulasExpandidas: React.FC<AulasExpandidasProps> = ({
  disciplinaId,
  aulasIds
}) => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAulas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('aulas')
          .select('*')
          .in('id', aulasIds);

        if (error) throw error;

        // Ordenar as aulas de acordo com a ordem em aulasIds
        const aulasMapeadas = aulasIds
          .map(id => data?.find(aula => aula.id === id))
          .filter((aula): aula is Aula => aula !== undefined);

        setAulas(aulasMapeadas);
      } catch (error) {
        console.error('Erro ao carregar aulas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as aulas.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (aulasIds.length > 0) {
      fetchAulas();
    }
  }, [aulasIds, toast]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(aulas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAulas(items);

    // Criar nova ordem de IDs
    const novaOrdemIds = items.map(aula => aula.id);

    try {
      // Atualizar a ordem no banco de dados
      const { error } = await supabase
        .from('disciplinas')
        .update({ aulas_ids: novaOrdemIds })
        .eq('id', disciplinaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ordem das aulas atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a ordem das aulas.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando aulas...</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg mt-2">
      <h3 className="text-sm font-medium mb-4">Aulas da Disciplina</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="aulas">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {aulas.map((aula, index) => (
                <Draggable key={aula.id} draggableId={aula.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2 bg-white p-3 mb-2 rounded-md shadow-sm"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{aula.titulo}</span>
                        {aula.descricao && (
                          <p className="text-sm text-gray-500">{aula.descricao}</p>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {aula.topicos_ids?.length || 0} tópicos
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}; 