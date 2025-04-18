import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CriarSimuladoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuestions: string[];
}

interface Curso {
  id: string;
  titulo: string;
  descricao: string;
}

const CriarSimuladoModal: React.FC<CriarSimuladoModalProps> = ({
  isOpen,
  onClose,
  selectedQuestions
}) => {
  const [titulo, setTitulo] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosSelecionados, setCursosSelecionados] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        console.log("Iniciando busca de cursos...");
        
        const { data, error } = await supabase
          .from("cursos")
          .select("id, titulo, descricao")
          .order("titulo", { ascending: true });

        console.log("Resposta do Supabase:", { data, error });

        if (error) {
          console.error("Erro detalhado ao buscar cursos:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        if (!data) {
          console.warn("Nenhum curso encontrado na resposta");
          return;
        }

        console.log("Cursos encontrados:", data);
        setCursos(data);
      } catch (error) {
        console.error("Erro completo ao buscar cursos:", error);
        toast.error("Erro ao carregar cursos. Por favor, tente novamente.");
      }
    };

    if (isOpen) {
      console.log("Modal aberto, buscando cursos...");
      fetchCursos();
    }
  }, [isOpen]);

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

  const handleCreateSimulado = async () => {
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
      console.log("Iniciando criação do simulado com os dados:", {
        titulo,
        cursosSelecionados,
        questoesSelecionadas: selectedQuestions,
        dataFim
      });

      // Criar o primeiro registro principal de simulado
      const { data, error } = await supabase.from("simulados").insert({
        titulo,
        curso_id: cursosSelecionados[0], // O primeiro curso será o principal
        data_fim: dataFim ? new Date(dataFim).toISOString() : null,
        questoes_ids: selectedQuestions,
        quantidade_questoes: selectedQuestions.length,
        ativo: true
      }).select();

      console.log("Resposta da criação do primeiro simulado:", { data, error });

      if (error) {
        console.error("Erro detalhado ao criar primeiro simulado:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      // Se há mais de um curso, criar registros adicionais
      if (cursosSelecionados.length > 1) {
        console.log("Criando simulados adicionais para os outros cursos");
        const restanteCursos = cursosSelecionados.slice(1);
        const batchInserts = restanteCursos.map(cursoId => ({
          titulo,
          curso_id: cursoId,
          data_fim: dataFim ? new Date(dataFim).toISOString() : null,
          questoes_ids: selectedQuestions,
          quantidade_questoes: selectedQuestions.length,
          ativo: true
        }));

        console.log("Dados para inserção em lote:", batchInserts);

        const { error: batchError } = await supabase.from("simulados").insert(batchInserts);
        if (batchError) {
          console.error("Erro detalhado ao criar simulados adicionais:", {
            code: batchError.code,
            message: batchError.message,
            details: batchError.details,
            hint: batchError.hint
          });
          throw batchError;
        }
      }

      toast.success("Simulado criado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro completo ao criar simulado:", error);
      toast.error("Erro ao criar simulado. Por favor, tente novamente.");
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
          <DialogTitle>Criar Simulado</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo simulado.
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
            onClick={handleCreateSimulado}
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Criar Simulado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CriarSimuladoModal;
