
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, PlusCircle, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ptBR } from 'date-fns/locale';

interface CriarSimuladoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuestions: string[];
}

const CriarSimuladoModal: React.FC<CriarSimuladoModalProps> = ({
  isOpen,
  onClose,
  selectedQuestions,
}) => {
  const [titulo, setTitulo] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [cursosIds, setCursosIds] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCurso = () => {
    if (!cursoId.trim()) {
      toast.error("Por favor, insira um ID de curso válido");
      return;
    }

    if (cursosIds.includes(cursoId)) {
      toast.error("Este curso já foi adicionado");
      return;
    }

    setCursosIds([...cursosIds, cursoId]);
    setCursoId("");
  };

  const handleRemoveCurso = (id: string) => {
    setCursosIds(cursosIds.filter(curso => curso !== id));
  };

  const handleCadastrarSimulado = async () => {
    if (!titulo.trim()) {
      toast.error("Por favor, insira um título para o simulado");
      return;
    }

    if (cursosIds.length === 0) {
      toast.error("Por favor, adicione pelo menos um curso");
      return;
    }

    try {
      setIsLoading(true);

      // Criar o primeiro registro principal de simulado
      const { data, error } = await supabase.from("simulados").insert({
        titulo,
        curso_id: cursosIds[0], // O primeiro curso será o principal
        data_inicio: dataInicio ? dataInicio.toISOString() : null,
        data_fim: dataFim ? dataFim.toISOString() : null,
        questoes_ids: selectedQuestions,
        quantidade_questoes: selectedQuestions.length
      }).select();

      if (error) {
        throw error;
      }

      // Se há mais de um curso, criar registros adicionais
      if (cursosIds.length > 1) {
        const restanteCursos = cursosIds.slice(1);
        const batchInserts = restanteCursos.map(cursoId => ({
          titulo,
          curso_id: cursoId,
          data_inicio: dataInicio ? dataInicio.toISOString() : null,
          data_fim: dataFim ? dataFim.toISOString() : null,
          questoes_ids: selectedQuestions,
          quantidade_questoes: selectedQuestions.length
        }));

        const { error: batchError } = await supabase.from("simulados").insert(batchInserts);
        if (batchError) {
          throw batchError;
        }
      }

      toast.success("Simulado cadastrado com sucesso!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar simulado:", error);
      toast.error("Erro ao cadastrar simulado. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitulo("");
    setCursoId("");
    setCursosIds([]);
    setDataInicio(undefined);
    setDataFim(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
            <Label htmlFor="cursoId" className="text-right text-[#67748a]">
              ID do Curso
            </Label>
            <div className="col-span-3 flex space-x-2">
              <Input
                id="cursoId"
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="flex-grow border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
                placeholder="Digite o ID do curso"
              />
              <Button 
                type="button" 
                onClick={handleAddCurso}
                variant="secondary"
                size="icon"
                className="h-10 w-10"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {cursosIds.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="col-start-2 col-span-3">
                <div className="flex flex-wrap gap-2">
                  {cursosIds.map(id => (
                    <div key={id} className="flex items-center bg-slate-100 px-3 py-1 rounded-md">
                      <span className="text-sm text-[#67748a] mr-2">{id}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0"
                        onClick={() => handleRemoveCurso(id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-[#67748a]">
              Data Início
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-[#5f2ebe] focus-visible:ring-[#5f2ebe]",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data de início</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-[#67748a]">
              Data Fim
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-[#5f2ebe] focus-visible:ring-[#5f2ebe]",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data de fim</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4 text-[#67748a] text-sm">
              {selectedQuestions.length} questões serão incluídas neste simulado.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCadastrarSimulado} 
            disabled={isLoading || !titulo.trim() || cursosIds.length === 0}
            className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar Simulado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CriarSimuladoModal;
