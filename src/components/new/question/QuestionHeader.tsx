import React, { useState } from "react";
import { BarChart, AlertTriangle, Info, MoveRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionStats } from "./QuestionStats";
import { QuestionHeaderProps } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  year,
  institution,
  organization,
  role,
  discipline,
  topics = [],
  assunto = "",
  questionId,
  hideInfo = false,
  aparencia = "padrao",
  numero,
  situacaoAnterior
}) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para reportar erros.");
        return;
      }

      const { error } = await supabase
        .from('questoes_erros_reportados')
        .insert({
          questao_id: questionId,
          user_id: user.id,
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

  const acoes = (
    <>
      {!hideInfo && (
        <div className="flex gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Popover open={infoOpen} onOpenChange={setInfoOpen}>
                    <PopoverTrigger asChild>
                      <button className="p-1 hover:bg-[#3a4253] rounded-full focus:outline-none transition-colors">
                        <Info className="h-4 w-4 text-white" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Informações da Questão</h4>
                        <div className="text-xs space-y-1.5">
                          <div className="sm:hidden">
                            <span className="font-medium">Assunto:</span> {assunto || "Não informado"}
                          </div>
                          <div>
                            <span className="font-medium">Tópicos:</span> {Array.isArray(topics) && topics.length > 0 ? topics.join(", ") : "Não informado"}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span> {questionId || "Não informado"}
                          </div>
                          <div>
                            <span className="font-medium">Ano:</span> {year || "Não informado"}
                          </div>
                          <div>
                            <span className="font-medium">Banca:</span> {institution || "Não informado"}
                          </div>
                          <div>
                            <span className="font-medium">Órgão:</span> {organization || "Não informado"}
                          </div>
                          <div>
                            <span className="font-medium">Prova:</span> {role || "Não informado"}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Informações da Questão</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                    <PopoverContent className="w-[300px] p-0">
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
      )}

    </>
  );

  const dialogo = (
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
  );

  if (aparencia === "moderna") {
    const meta = [institution, organization, year, role].filter(Boolean);
    return (
      <header className="border-b border-slate-100 px-4 py-3 md:px-5">
        <div className="flex items-start gap-3">
          {numero !== undefined && (
            <span className="mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-[#5f2ebe]/10 px-1.5 text-xs font-bold tabular-nums text-[#5f2ebe]">
              {numero}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-slate-900">
              {discipline || "Disciplina não informada"}
              {assunto && (
                <>
                  <span className="mx-1.5 font-normal text-slate-300">›</span>
                  <span className="font-medium text-slate-600">{assunto}</span>
                </>
              )}
            </p>
            {!hideInfo && meta.length > 0 && <p className="mt-0.5 text-xs text-slate-500">{meta.join(" · ")}</p>}
          </div>
          {situacaoAnterior && (
            <span
              className={
                "hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-block " +
                (situacaoAnterior === "acertou" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")
              }
            >
              {situacaoAnterior === "acertou" ? "Você acertou" : "Você errou"}
            </span>
          )}
          <div className="-mr-1 shrink-0 [&_button:hover]:bg-slate-100 [&_svg]:text-slate-400">{acoes}</div>
        </div>
        {dialogo}
      </header>
    );
  }

  return (
    <header className="flex flex-row justify-between items-center px-5 py-2 w-full rounded-t-xl rounded-b-none border border-gray-200 border-solid min-h-[60px] text-slate-800 bg-[#5f2ebe]">
      <div className="flex items-center text-white">
        <div className="flex items-center">
          <span className="text-sm max-sm:hidden">Disciplina:&nbsp;</span>
          <span className="font-normal text-sm max-sm:text-xs">{discipline || "Não informado"}</span>
          {assunto && (
            <>
              <MoveRight className="h-3 w-3 mx-1.5 text-gray-300 max-sm:hidden" />
              <span className="font-normal text-sm max-sm:hidden text-white font-medium">{assunto}</span>
            </>
          )}
        </div>
      </div>

      {acoes}

      {dialogo}
    </header>
  );
};
