import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VincularCursoModalProps } from "./SimuladosTypes";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

interface SimuladoData {
  titulo: string;
  curso_id: string;
  data_inicio: string | null;
  data_fim: string | null;
  cursos_vinculados: string[];
}

export const VincularCursoModal: React.FC<VincularCursoModalProps> = ({
  isOpen,
  onClose,
  simuladoId
}) => {
  const [simuladoData, setSimuladoData] = useState<SimuladoData>({
    titulo: "",
    curso_id: "",
    data_inicio: null,
    data_fim: null,
    cursos_vinculados: []
  });

  const [cursoIdInput, setCursoIdInput] = useState("");

  // Carregar dados do simulado
  useEffect(() => {
    const fetchSimuladoData = async () => {
      try {
        const { data, error } = await supabase
          .from("simulados")
          .select("titulo, curso_id, data_inicio, data_fim")
          .eq("id", simuladoId)
          .single();

        if (error) throw error;

        // Buscar simulados vinculados com o mesmo título
        const { data: simuladosVinculados, error: errorVinculados } = await supabase
          .from("simulados")
          .select("curso_id")
          .eq("titulo", data.titulo)
          .neq("id", simuladoId);

        if (errorVinculados) throw errorVinculados;

        const cursosVinculados = simuladosVinculados?.map(s => s.curso_id) || [];

        setSimuladoData({
          titulo: data.titulo || "",
          curso_id: data.curso_id || "",
          data_inicio: data.data_inicio ? new Date(data.data_inicio).toISOString().split('T')[0] : "",
          data_fim: data.data_fim ? new Date(data.data_fim).toISOString().split('T')[0] : "",
          cursos_vinculados: cursosVinculados
        });
      } catch (error) {
        console.error("Erro ao carregar dados do simulado:", error);
        toast.error("Erro ao carregar dados do simulado");
      }
    };

    if (isOpen && simuladoId) {
      fetchSimuladoData();
    }
  }, [isOpen, simuladoId]);

  const handleAddCursoId = () => {
    if (!cursoIdInput.trim()) {
      toast.error("Por favor, insira um ID de curso válido");
      return;
    }

    // Verificar se o ID já existe na lista
    if (simuladoData.cursos_vinculados.includes(cursoIdInput) || cursoIdInput === simuladoData.curso_id) {
      toast.error("Este ID de curso já foi adicionado");
      return;
    }

    setSimuladoData(prev => ({
      ...prev,
      cursos_vinculados: [...prev.cursos_vinculados, cursoIdInput]
    }));
    setCursoIdInput("");
  };

  const handleRemoveCursoId = (cursoId: string) => {
    setSimuladoData(prev => ({
      ...prev,
      cursos_vinculados: prev.cursos_vinculados.filter(id => id !== cursoId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Atualizar o simulado principal
      const { error: updateError } = await supabase
        .from("simulados")
        .update({
          titulo: simuladoData.titulo,
          curso_id: simuladoData.curso_id,
          data_inicio: simuladoData.data_inicio,
          data_fim: simuladoData.data_fim
        })
        .eq("id", simuladoId);

      if (updateError) throw updateError;

      // Buscar dados completos do simulado atual
      const { data: simuladoAtual, error: errorSimulado } = await supabase
        .from("simulados")
        .select("*")
        .eq("id", simuladoId)
        .single();

      if (errorSimulado) throw errorSimulado;

      // Criar novos simulados vinculados
      const novosSimulados = simuladoData.cursos_vinculados.map(cursoId => ({
        titulo: simuladoData.titulo,
        curso_id: cursoId,
        data_inicio: simuladoData.data_inicio,
        data_fim: simuladoData.data_fim,
        questoes_ids: simuladoAtual.questoes_ids,
        quantidade_questoes: simuladoAtual.quantidade_questoes,
        ativo: simuladoAtual.ativo
      }));

      if (novosSimulados.length > 0) {
        const { error: insertError } = await supabase
          .from("simulados")
          .insert(novosSimulados);

        if (insertError) throw insertError;
      }

      toast.success("Simulado atualizado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar simulado:", error);
      toast.error("Erro ao atualizar simulado");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vincular Simulado ao Curso</DialogTitle>
          <DialogDescription>
            Informe o ID do curso para vincular este simulado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={simuladoData.titulo}
              onChange={(e) => setSimuladoData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Título do simulado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="curso_id">ID do Curso Principal</Label>
            <Input
              id="curso_id"
              value={simuladoData.curso_id}
              onChange={(e) => setSimuladoData(prev => ({ ...prev, curso_id: e.target.value }))}
              placeholder="ID do curso principal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="curso_vinculado">Vincular a Outros Cursos</Label>
            <div className="flex gap-2">
              <Input
                id="curso_vinculado"
                value={cursoIdInput}
                onChange={(e) => setCursoIdInput(e.target.value)}
                placeholder="ID do curso para vincular"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCursoId}
              >
                Adicionar
              </Button>
            </div>
            {simuladoData.cursos_vinculados.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {simuladoData.cursos_vinculados.map((cursoId) => (
                  <div
                    key={cursoId}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
                  >
                    <span className="text-sm">{cursoId}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCursoId(cursoId)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_inicio">Data Início</Label>
            <Input
              id="data_inicio"
              type="date"
              value={simuladoData.data_inicio || ""}
              onChange={(e) => setSimuladoData(prev => ({ ...prev, data_inicio: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_fim">Data Fim</Label>
            <Input
              id="data_fim"
              type="date"
              value={simuladoData.data_fim || ""}
              onChange={(e) => setSimuladoData(prev => ({ ...prev, data_fim: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Atualizar dados
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
