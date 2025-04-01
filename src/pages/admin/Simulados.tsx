import React, { useState, useEffect } from "react";
import { SimuladosTable } from "./components/simulados/SimuladosTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Simulado } from "./components/simulados/SimuladosTypes";

const Simulados: React.FC = () => {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSimulados = async () => {
    try {
      // Primeiro, buscar os simulados
      const { data: simuladosData, error: simuladosError } = await supabase
        .from("simulados")
        .select("*")
        .order("created_at", { ascending: false });

      if (simuladosError) throw simuladosError;

      // Depois, buscar os cursos relacionados
      const cursoIds = simuladosData.map(s => s.curso_id);
      const { data: cursosData, error: cursosError } = await supabase
        .from("cursos")
        .select("id, titulo")
        .in("id", cursoIds);

      if (cursosError) throw cursosError;

      // Criar um mapa de cursos para fácil acesso
      const cursosMap = new Map(cursosData.map(curso => [curso.id, curso]));

      // Formatar os dados para o formato esperado pelo componente
      const formattedSimulados: Simulado[] = simuladosData.map(simulado => ({
        id: simulado.id,
        titulo: simulado.titulo,
        descricao: simulado.descricao,
        questoes_ids: simulado.questoes_ids || [],
        curso_id: simulado.curso_id,
        data_fim: simulado.data_fim,
        ativo: simulado.ativo,
        curso: {
          titulo: cursosMap.get(simulado.curso_id)?.titulo || ""
        },
        questoesIds: simulado.questoes_ids || [],
        cursosIds: [simulado.curso_id]
      }));

      setSimulados(formattedSimulados);
    } catch (error) {
      console.error("Erro ao buscar simulados:", error);
      toast.error("Erro ao carregar simulados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulados();
  }, []);

  const handleToggleAtivo = async (id: string) => {
    try {
      const simulado = simulados.find(s => s.id === id);
      if (!simulado) return;

      const { error } = await supabase
        .from("simulados")
        .update({ ativo: !simulado.ativo })
        .eq("id", id);

      if (error) throw error;

      fetchSimulados();
      toast.success(`Simulado ${simulado.ativo ? "desativado" : "ativado"} com sucesso!`);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do simulado");
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este simulado?")) return;

    try {
      const { error } = await supabase
        .from("simulados")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchSimulados();
      toast.success("Simulado excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir simulado:", error);
      toast.error("Erro ao excluir simulado");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Simulados</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <SimuladosTable
          simulados={simulados}
          onRefresh={fetchSimulados}
          handleToggleAtivo={handleToggleAtivo}
          handleExcluir={handleExcluir}
        />
      )}
    </div>
  );
};

export default Simulados;
