import React, { useState, useEffect, useMemo } from "react";
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
import { Search } from "lucide-react";

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
  const itemsPerPage = 10; // Alterado de 5 para 10
  const [searchTerm, setSearchTerm] = useState(""); // Adicionado estado para pesquisa

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
      // Resetar paginação e pesquisa ao abrir o modal
      setCurrentPage(1);
      setSearchTerm("");
    }
  }, [isOpen, simuladoId]);

  // Filtrar cursos com base no termo de pesquisa
  const filteredCursos = useMemo(() => {
    if (!searchTerm) return cursos;
    return cursos.filter(curso => 
      curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cursos, searchTerm]);

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
    if (cursosSelecionados.length === filteredCursos.length && filteredCursos.length > 0) {
      // Se todos os cursos filtrados estão selecionados, desmarcar apenas os filtrados
      const filteredCursosIds = filteredCursos.map(c => c.id);
      setCursosSelecionados(prev => prev.filter(id => !filteredCursosIds.includes(id)));
    } else {
      // Selecionar todos os cursos filtrados
      const filteredCursosIds = filteredCursos.map(c => c.id);
      setCursosSelecionados(prev => {
        // Manter os já selecionados que não estão nos filtrados
        const otherSelected = prev.filter(id => !filteredCursosIds.includes(id));
        // Adicionar os filtrados que não estão selecionados
        const newSelected = filteredCursosIds.filter(id => !prev.includes(id));
        return [...otherSelected, ...newSelected];
      });
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

  // Atualizar paginação com base nos cursos filtrados
  const totalPages = Math.ceil(filteredCursos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const cursosPaginados = filteredCursos.slice(startIndex, endIndex);

  // Resetar para a primeira página quando a pesquisa mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
              {/* Input de pesquisa */}
              <div className="mb-4 relative">
                <Input
                  placeholder="Pesquisar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={cursosSelecionados.length > 0 && cursosSelecionados.length === filteredCursos.length}
                    onChange={handleSelectAllCursos}
                    className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                  />
                  <span className="text-sm text-[#67748a]">
                    Selecionar todos ({filteredCursos.length} cursos encontrados)
                  </span>
                </label>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cursosPaginados.length > 0 ? (
                  cursosPaginados.map((curso) => (
                    <label key={curso.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={cursosSelecionados.includes(curso.id)}
                        onChange={() => handleCursoSelect(curso.id)}
                        className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                      />
                      <span className="text-sm text-[#67748a]">{curso.titulo} - {curso.descricao}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-4 text-[#67748a]">
                    {searchTerm ? "Nenhum curso encontrado com o termo pesquisado." : "Nenhum curso disponível."}
                  </div>
                )}
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