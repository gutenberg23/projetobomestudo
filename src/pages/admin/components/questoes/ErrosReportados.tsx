import React, { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle2, Edit, EyeOff, Flag, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { atualizarStatusErro, ErroReportado, listarErrosReportados } from "@/services/questoesAdminService";
import { textoPuro } from "./utils";

type Status = "pendente" | "resolvido" | "ignorado";

interface ErrosReportadosProps {
  onEditarQuestao: (questaoId: string) => void;
  /** Avisa a página para atualizar o contador de pendentes. */
  onMudou?: () => void;
}

const ABAS: { id: Status; label: string }[] = [
  { id: "pendente", label: "Pendentes" },
  { id: "resolvido", label: "Resolvidos" },
  { id: "ignorado", label: "Ignorados" },
];

function quando(iso: string): string {
  const d = new Date(iso);
  const dias = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  return d.toLocaleDateString("pt-BR");
}

const ErrosReportados: React.FC<ErrosReportadosProps> = ({ onEditarQuestao, onMudou }) => {
  const [status, setStatus] = useState<Status>("pendente");
  const [erros, setErros] = useState<ErroReportado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setErros(await listarErrosReportados(status));
    } catch (e) {
      toast({ title: "Erro ao carregar os erros reportados", description: (e as Error).message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }, [status]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const mudarStatus = async (erro: ErroReportado, novo: Status) => {
    setOcupado(erro.id);
    try {
      await atualizarStatusErro(erro.id, novo);
      setErros((l) => l.filter((e) => e.id !== erro.id));
      onMudou?.();
      toast({
        title: novo === "resolvido" ? "Marcado como resolvido" : novo === "ignorado" ? "Erro ignorado" : "Voltou para pendentes",
      });
    } catch (e) {
      toast({ title: "Não foi possível atualizar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-100 px-3 py-2 sm:px-4" role="tablist">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={status === a.id}
            onClick={() => setStatus(a.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              status === a.id ? "bg-[#5f2ebe] text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-14 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : erros.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
          <span className="rounded-full bg-emerald-50 p-3 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="font-medium text-slate-700">
            {status === "pendente" ? "Nenhum erro pendente" : status === "resolvido" ? "Nenhum erro resolvido ainda" : "Nenhum erro ignorado"}
          </p>
          {status === "pendente" && <p className="text-sm text-slate-500">Quando um aluno reportar um problema numa questão, ele aparece aqui.</p>}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {erros.map((e) => {
            const enunciado = textoPuro(e.questao?.content || "");
            return (
              <li key={e.id} className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-start sm:px-4">
                <span className="hidden rounded-full bg-amber-50 p-2 text-amber-600 sm:block">
                  <Flag className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="whitespace-pre-line text-sm font-medium text-slate-900">“{e.descricao}”</p>
                  <p className="text-xs text-slate-500">
                    {e.autor} · {quando(e.createdAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onEditarQuestao(e.questaoId)}
                    className="block w-full rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2 text-left text-xs text-slate-600 hover:border-[#5f2ebe]/30 hover:bg-[#faf8ff]"
                  >
                    <span className="mb-0.5 block font-medium text-slate-500">
                      {[e.questao?.discipline, e.questao?.institution, e.questao?.year].filter(Boolean).join(" · ") || "Questão"}
                    </span>
                    <span className="line-clamp-2">{enunciado || (e.questao ? "Sem enunciado" : "A questão foi excluída")}</span>
                  </button>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5 sm:flex-col sm:items-stretch">
                  {e.questao && (
                    <Button type="button" size="sm" variant="outline" onClick={() => onEditarQuestao(e.questaoId)} className="h-8">
                      <Edit className="mr-1.5 h-3.5 w-3.5" /> Corrigir questão
                    </Button>
                  )}
                  {status === "pendente" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="flat"
                        onClick={() => mudarStatus(e, "resolvido")}
                        disabled={ocupado === e.id}
                        className="h-8 bg-emerald-600 text-sm tracking-normal text-white hover:bg-emerald-700"
                      >
                        <Check className="mr-1.5 h-3.5 w-3.5" /> Resolvido
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => mudarStatus(e, "ignorado")} disabled={ocupado === e.id} className="h-8 text-slate-500">
                        <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Ignorar
                      </Button>
                    </>
                  ) : (
                    <Button type="button" size="sm" variant="ghost" onClick={() => mudarStatus(e, "pendente")} disabled={ocupado === e.id} className="h-8 text-slate-500">
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reabrir
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ErrosReportados;
