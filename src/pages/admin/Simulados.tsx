import React, { useState, useEffect } from "react";
import { SimuladosTable } from "./components/simulados";
import { Simulado } from "./components/simulados/SimuladosTypes";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQuestionSelectionActions } from "@/components/admin/questions/hooks/actions/useQuestionSelectionActions";
import { useQuestionsState } from "@/components/admin/questions/hooks/useQuestionsState";
import { VincularCursoModal } from "./components/simulados/VincularCursoModal";

const Simulados = () => {
  const questionsState = useQuestionsState();
  const { handleCreateSimulado } = useQuestionSelectionActions(questionsState);
  
  // Estado para os simulados
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVincularModalOpen, setIsVincularModalOpen] = useState(false);
  const [selectedSimuladoId, setSelectedSimuladoId] = useState<string | null>(null);
  
  // Buscar simulados do banco de dados ao carregar a página
  useEffect(() => {
    const fetchSimulados = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("simulados")
          .select("*");
        
        if (error) throw error;
        
        // Formatar os dados para o formato utilizado no componente
        const formattedSimulados: Simulado[] = data.map(simulado => ({
          id: simulado.id,
          titulo: simulado.titulo,
          descricao: `Disponível de: ${simulado.data_inicio ? new Date(simulado.data_inicio).toLocaleDateString('pt-BR') : 'Indefinido'} até ${simulado.data_fim ? new Date(simulado.data_fim).toLocaleDateString('pt-BR') : 'Indefinido'}`,
          questoesIds: simulado.questoes_ids || [],
          cursosIds: [simulado.curso_id], // Inicia com o curso principal
          ativo: simulado.ativo
        }));
        
        setSimulados(formattedSimulados);
      } catch (error) {
        console.error("Erro ao buscar simulados:", error);
        toast.error("Erro ao carregar simulados. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSimulados();
  }, [isVincularModalOpen]); // Recarrega quando o modal é fechado

  // Vincular simulado a um curso
  const handleVincularCurso = (simuladoId: string) => {
    setSelectedSimuladoId(simuladoId);
    setIsVincularModalOpen(true);
  };

  // Ativar/desativar simulado
  const handleToggleAtivo = async (simuladoId: string) => {
    try {
      // Encontrar o simulado atual
      const simuladoAtual = simulados.find(s => s.id === simuladoId);
      if (!simuladoAtual) return;
      
      const novoStatus = !simuladoAtual.ativo;
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from("simulados")
        .update({ ativo: novoStatus })
        .eq("id", simuladoId);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setSimulados(prevSimulados => 
        prevSimulados.map(simulado => {
          if (simulado.id === simuladoId) {
            return {...simulado, ativo: novoStatus};
          }
          return simulado;
        })
      );
      
      toast.success(`Simulado ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar simulado:", error);
      toast.error("Erro ao atualizar simulado. Tente novamente.");
    }
  };

  // Excluir simulado
  const handleExcluir = async (simuladoId: string) => {
    try {
      // Confirmar exclusão
      if (!window.confirm("Tem certeza que deseja excluir este simulado?")) {
        return;
      }
      
      // Excluir do banco de dados
      const { error } = await supabase
        .from("simulados")
        .delete()
        .eq("id", simuladoId);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setSimulados(prevSimulados => 
        prevSimulados.filter(simulado => simulado.id !== simuladoId)
      );
      
      toast.success('Simulado excluído com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir simulado:", error);
      toast.error("Erro ao excluir simulado. Tente novamente.");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#272f3c]">Simulados</h1>
      <p className="text-[#67748a]">Gerenciamento de simulados</p>
      
      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-[#67748a]">Carregando simulados...</p>
        </div>
      ) : (
        <>
          <SimuladosTable 
            simulados={simulados}
            handleVincularCurso={handleVincularCurso}
            handleToggleAtivo={handleToggleAtivo}
            handleExcluir={handleExcluir}
          />

          {selectedSimuladoId && (
            <VincularCursoModal
              isOpen={isVincularModalOpen}
              onClose={() => {
                setIsVincularModalOpen(false);
                setSelectedSimuladoId(null);
              }}
              simuladoId={selectedSimuladoId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Simulados;
