import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
          .select("id, titulo")
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Criar Novo Simulado</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="titulo" className="text-right text-[#67748a]">
              Título
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="col-span-3 border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
              placeholder="Digite o título do simulado"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataFim" className="text-right text-[#67748a]">
              Disponível até
            </Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="col-span-3 border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
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
                    <span className="text-sm text-[#67748a]">{curso.titulo}</span>
                  </label>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center text-sm text-[#67748a]">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-[#67748a] hover:text-[#272f3c]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateSimulado}
            disabled={isLoading}
            className="bg-[#5f2ebe] hover:bg-[#4a1f9c] text-white"
          >
            {isLoading ? "Criando..." : "Criar Simulado"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CriarSimuladoModal;
