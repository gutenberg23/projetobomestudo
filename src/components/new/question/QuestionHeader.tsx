import React, { useState } from "react";
import { BarChart, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionStats } from "./QuestionStats";
import { QuestionHeaderProps } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from '@/integrations/supabase/types';
import { Label } from "@/components/ui/label";

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  questionNumber,
  year,
  institution,
  organization,
  role,
  educationLevel,
  discipline,
  topics,
  questionId
}) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReportSubmit = async () => {
    if (!reportDescription.trim()) {
      toast.error("Por favor, descreva o erro encontrado.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('questoes_erros_reportados')
        .insert({
          questao_id: questionId,
          descricao: reportDescription.trim(),
          status: 'pendente'
        });

      if (error) throw error;

      toast.success("Erro reportado com sucesso!");
      setReportDialogOpen(false);
      setReportDescription("");
    } catch (error) {
      console.error("Erro ao reportar:", error);
      toast.error("Erro ao enviar o reporte. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="flex overflow-hidden flex-wrap justify-between items-center px-3 md:px-5 py-2.5 w-full rounded-t-xl rounded-b-none border border-gray-200 border-solid min-h-[74px] text-slate-800 bg-[#272f3c]">
      <div className="flex overflow-hidden flex-wrap flex-1 shrink gap-2.5 justify-center items-center self-stretch p-2.5 my-auto text-xl font-semibold rounded-md basis-0 min-w-60">
        <img 
          src="/lovable-uploads/interroga.svg" 
          alt="Question Icon" 
          className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" 
        />
        <p className="flex-1 shrink self-stretch my-auto basis-0 text-white">
          {questionNumber && (
            <>
              <span className="text-sm text-white">Questão: </span>
              <span className="font-normal text-sm text-white">{questionNumber}</span>
            </>
          )}
          <span className="text-sm text-white">{questionNumber ? ' | ' : ''}Ano: </span>
          <span className="font-normal text-sm text-white">{year}</span>
          <span className="text-sm text-white"> | Banca: </span>
          <span className="font-normal text-sm text-white">{institution}</span>
          <span className="text-sm text-white"> | Órgão: </span>
          <span className="font-normal text-sm text-white">{organization}</span>
          <span className="text-sm text-white"> | Prova: </span>
          <span className="font-normal text-sm text-white">{role}</span>
          <span className="text-sm text-white"> | Nível: </span>
          <span className="font-normal text-sm text-white">{educationLevel}</span>
          <span className="text-sm text-white"> | Disciplina: </span>
          <span className="font-normal text-sm text-white">{discipline}</span>
        </p>
      </div>

      <div className="flex overflow-hidden gap-2 justify-center items-center self-stretch p-2.5 my-auto text-xs text-center whitespace-nowrap rounded-md max-sm:mx-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Popover open={statsOpen} onOpenChange={setStatsOpen}>
                  <PopoverTrigger asChild>
                    <button className="p-1 hover:bg-[#3a4253] rounded-full focus:outline-none transition-colors">
                      <BarChart className="h-4 w-4 text-white" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[45vw] md:w-[700px] p-0">
                    <QuestionStats questionId={questionId} />
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Estatísticas da Questão</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="p-1 hover:bg-[#3a4253] rounded-full focus:outline-none transition-colors"
                onClick={() => setReportDialogOpen(true)}
              >
                <AlertTriangle className="h-4 w-4 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reportar erro na questão</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Erro</DialogTitle>
            <DialogDescription>
              Descreva o erro encontrado na questão para que possamos corrigi-lo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="report-description">Descrição do Erro</Label>
              <Textarea
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Descreva o erro encontrado..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReportSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};
