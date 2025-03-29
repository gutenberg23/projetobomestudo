import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Aula {
  id: string;
  titulo: string;
}

interface AulasExpandidasProps {
  disciplinaId: string;
  aulasIds: string[];
  onClose: () => void;
}

export const AulasExpandidas: React.FC<AulasExpandidasProps> = ({
  disciplinaId,
  aulasIds,
  onClose
}) => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAulas();
  }, [disciplinaId]);

  const fetchAulas = async () => {
    try {
      const { data: aulasData, error } = await supabase
        .from('aulas')
        .select('id, titulo')
        .in('id', aulasIds);

      if (error) throw error;

      // Ordenar as aulas de acordo com a ordem em aulasIds
      const aulasOrdenadas = aulasIds
        .map(id => aulasData?.find(aula => aula.id === id))
        .filter((aula): aula is Aula => aula !== undefined);

      setAulas(aulasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      toast.error('Erro ao carregar aulas');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(aulas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualiza a ordem localmente
    setAulas(items);

    try {
      // Atualiza a ordem na tabela de disciplinas
      const novaOrdem = items.map(item => item.id);
      
      const { error } = await supabase
        .from('disciplinas')
        .update({ aulas_ids: novaOrdem })
        .eq('id', disciplinaId);

      if (error) throw error;

      toast.success('Ordem das aulas atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar ordem das aulas:', error);
      toast.error('Erro ao atualizar ordem das aulas');
      // Reverte as mudanças em caso de erro
      fetchAulas();
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50">
        <p>Carregando aulas...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Ordenar Aulas</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="aulas">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {aulas.map((aula, index) => (
                <Draggable key={aula.id} draggableId={aula.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white p-3 rounded-md shadow-sm border flex items-center justify-between"
                    >
                      <span>{aula.titulo}</span>
                      <span className="text-gray-500 text-sm">#{index + 1}</span>
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