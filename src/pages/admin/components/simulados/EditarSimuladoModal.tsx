import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Curso {
  id: string;
  titulo: string;
  descricao: string;
}

interface EditarSimuladoModalProps {
  isOpen: boolean;
  onClose: () => void;
  simuladoId: string;
}

const EditarSimuladoModal: React.FC<EditarSimuladoModalProps> = ({
  isOpen,
  onClose,
  simuladoId
}) => {
  const [titulo, setTitulo] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosSelecionados, setCursosSelecionados] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados do simulado
        const { data: simuladoData, error: simuladoError } = await supabase
          .from("simulados")
          .select("*")
          .eq("id", simuladoId)
          .single();

        if (simuladoError) throw simuladoError;

        // Buscar todos os simulados com o mesmo título para pegar os cursos vinculados
        const { data: simuladosVinculados, error: vinculadosError } = await supabase
          .from("simulados")
          .select("curso_id")
          .eq("titulo", simuladoData.titulo)
          .neq("id", simuladoId);

        if (vinculadosError) throw vinculadosError;

        // Buscar todos os cursos
        const { data: cursosData, error: cursosError } = await supabase
          .from("cursos")
          .select("id, titulo, descricao")
          .order("titulo", { ascending: true });

        if (cursosError) throw cursosError;

        setTitulo(simuladoData.titulo);
        setDataFim(simuladoData.data_fim ? new Date(simuladoData.data_fim).toISOString().split('T')[0] : "");
        setCursos(cursosData);
        
        // Combinar o curso principal com os cursos vinculados
        const todosCursos = [simuladoData.curso_id, ...(simuladosVinculados?.map(s => s.curso_id) || [])];
        setCursosSelecionados(todosCursos);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados do simulado");
      }
    };

    if (isOpen && simuladoId) {
      fetchData();
    }
  }, [isOpen, simuladoId]);

  const handleCursoSelect = (cursoId: string) => {
    setCursosSelecionados(prev => {
      if (prev.includes(cursoId)) {
        return prev.filter(id => id !== cursoId);
      } else {
        return [...prev, cursoId];
      }
    });
  };

  const handleSelectAllCursos = () => {
    if (cursosSelecionados.length === cursos.length) {
      setCursosSelecionados([]);
    } else {
      setCursosSelecionados(cursos.map(c => c.id));
    }
  };

  const handleSaveChanges = async () => {
    if (!titulo.trim()) {
      toast.error("Por favor, insira um título para o simulado");
      return;
    }

    if (cursosSelecionados.length === 0) {
      toast.error("Por favor, selecione pelo menos um curso");
      return;
    }

    try {
      setIsLoading(true);

      // Atualizar o simulado principal
      const { error: updateError } = await supabase
        .from("simulados")
        .update({
          titulo,
          curso_id: cursosSelecionados[0],
          data_fim: dataFim ? new Date(dataFim).toISOString() : null
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
      const novosSimulados = cursosSelecionados.slice(1).map(cursoId => ({
        titulo,
        curso_id: cursoId,
        data_fim: dataFim ? new Date(dataFim).toISOString() : null,
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
      toast.error("Erro ao atualizar simulado. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(cursos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const cursosPaginados = cursos.slice(startIndex, endIndex);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Simulado</DialogTitle>
          <DialogDescription>
            Edite os dados do simulado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="titulo" className="text-right">
              Título
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data_fim" className="text-right">
              Data Fim
            </Label>
            <Input
              id="data_fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="mt-4">
            <Label className="text-[#67748a] mb-2 block">Cursos</Label>
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={cursosSelecionados.length === cursos.length}
                    onChange={handleSelectAllCursos}
                    className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                  />
                  <span className="text-sm text-[#67748a]">Selecionar todos</span>
                </label>
              </div>
              
              <div className="space-y-2">
                {cursosPaginados.map((curso) => (
                  <label key={curso.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={cursosSelecionados.includes(curso.id)}
                      onChange={() => handleCursoSelect(curso.id)}
                      className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                    />
                    <span className="text-sm text-[#67748a]">{curso.titulo} - {curso.descricao}</span>
                  </label>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-[#67748a]">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditarSimuladoModal; 