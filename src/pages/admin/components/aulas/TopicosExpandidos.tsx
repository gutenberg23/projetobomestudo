import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Topico {
  id: string;
  nome: string;
}

interface TopicosExpandidosProps {
  topicosIds: string[];
  aulaId: string;
  onClose: () => void;
}

export const TopicosExpandidos: React.FC<TopicosExpandidosProps> = ({
  topicosIds,
  aulaId,
  onClose
}) => {
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTopicos = async () => {
      try {
        if (topicosIds.length === 0) {
          setTopicos([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('topicos')
          .select('id, nome')
          .in('id', topicosIds);

        if (error) throw error;

        // Ordenar os tópicos de acordo com a ordem em topicosIds
        const topicosMapeados = topicosIds.map(id => 
          data?.find(topico => topico.id === id)
        ).filter((topico): topico is NonNullable<typeof topico> => topico != null);

        setTopicos(topicosMapeados);
      } catch (error) {
        console.error('Erro ao buscar tópicos:', error);
        toast.error('Erro ao carregar os tópicos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicos();
  }, [topicosIds]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(topicos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTopicos(items);

    try {
      const novaOrdem = items.map(item => item.id);
      
      // Atualizar a ordem na tabela de aulas
      const { error: aulaError } = await supabase
        .from('aulas')
        .update({ topicos_ids: novaOrdem })
        .eq('id', aulaId);

      if (aulaError) throw aulaError;

      // Atualizar a ordem em todos os cursos que contêm esta aula
      const { data: cursosData, error: cursosError } = await supabase
        .from('cursos')
        .select('id, aulas_ids, topicos_ids')
        .contains('aulas_ids', [aulaId]);

      if (cursosError) throw cursosError;

      // Para cada curso que contém esta aula, atualizar a ordem dos tópicos
      for (const curso of (cursosData || [])) {
        const topicosAtuais = curso.topicos_ids || [];
        
        // Remover os tópicos antigos desta aula
        const topicosOutrasAulas = topicosAtuais.filter(id => !topicosIds.includes(id));
        
        // Adicionar os tópicos na nova ordem
        const novoTopicosIds = [...topicosOutrasAulas, ...novaOrdem];

        const { error: updateError } = await supabase
          .from('cursos')
          .update({ topicos_ids: novoTopicosIds })
          .eq('id', curso.id);

        if (updateError) throw updateError;
      }

      toast.success('Ordem dos tópicos atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ordem dos tópicos:', error);
      toast.error('Erro ao salvar a nova ordem. Tente novamente.');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando tópicos...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Tópicos da Aula</h3>
        <Button onClick={onClose} variant="outline">Fechar</Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="topicos">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {topicos.map((topico, index) => (
                <Draggable key={topico.id} draggableId={topico.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span>{topico.nome}</span>
                      </div>
                      <div className="text-sm text-gray-500">ID: {topico.id}</div>
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