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

      if (simuladosError) {
        console.error("Erro ao buscar simulados:", simuladosError);
        toast.error("Erro ao carregar simulados: " + (simuladosError as Error).message);
        throw simuladosError;
      }

      console.log("Simulados encontrados:", simuladosData);

      // Depois, buscar os cursos relacionados
      const cursoIds = simuladosData.map(s => s.curso_id);
      const { data: cursosData, error: cursosError } = await supabase
        .from("cursos")
        .select("id, titulo")
        .in("id", cursoIds);

      if (cursosError) {
        console.error("Erro ao buscar cursos:", cursosError);
        toast.error("Erro ao carregar cursos: " + (cursosError as Error).message);
        throw cursosError;
      }

      // Criar um mapa de cursos para fácil acesso
      const cursosMap = new Map(cursosData.map(curso => [curso.id, curso]));

      // Formatar os dados para o formato esperado pelo componente
      const formattedSimulados: Simulado[] = simuladosData.map(simulado => {
        console.log(`Simulado ${simulado.titulo}: ${(simulado.questoes_ids || []).length} questões`);
        return {
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
        };
      });

      console.log("Simulados formatados:", formattedSimulados.map(s => ({ titulo: s.titulo, questoes: s.questoesIds.length })));
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
    } catch (error: unknown) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do simulado: " + (error as Error).message);
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
    } catch (error: unknown) {
      console.error("Erro ao excluir simulado:", error);
      toast.error("Erro ao excluir simulado: " + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Simulados</h1>
        <p className="text-sm text-gray-600 mt-1">
          {isLoading ? "Carregando..." : `${simulados.length} simulados encontrados`}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : simulados.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">Nenhum simulado encontrado.</p>
          <p className="text-sm text-gray-400 mt-2">
            Se você espera ver simulados aqui, verifique se as políticas de acesso estão configuradas corretamente.
          </p>
        </div>
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