import React, { useEffect, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, CheckCircle2, ListChecks, Target, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { BarraProgresso, Metrica, tomAproveitamento } from "../ui";
import { cn } from "@/lib/utils";

interface ResumoEditalProps {
  concluidos: number;
  totalTopicos: number;
  tentativas: number;
  acertos: number;
  erros: number;
  meta: number;
  onMeta: (valor: number) => void;
  dataProva?: Date;
  onDataProva: (data: Date | undefined) => void;
  podeEditar: boolean;
}

export const ResumoEdital: React.FC<ResumoEditalProps> = ({
  concluidos,
  totalTopicos,
  tentativas,
  acertos,
  erros,
  meta,
  onMeta,
  dataProva,
  onDataProva,
  podeEditar,
}) => {
  const progresso = totalTopicos > 0 ? Math.round((concluidos / totalTopicos) * 100) : 0;
  const aproveitamento = tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 0;
  const tom = tomAproveitamento(aproveitamento, meta, tentativas);
  const dias = dataProva ? differenceInCalendarDays(dataProva, new Date()) : null;
  const restantes = totalTopicos - concluidos;

  // Campo da meta com valor local, para não salvar a cada tecla
  const [metaTexto, setMetaTexto] = useState(String(meta));
  useEffect(() => setMetaTexto(String(meta)), [meta]);
  const confirmarMeta = () => {
    const n = Math.max(1, Math.min(100, parseInt(metaTexto) || meta));
    setMetaTexto(String(n));
    if (n !== meta) onMeta(n);
  };

  const [calendarioAberto, setCalendarioAberto] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
      <Metrica
        rotulo="Progresso do edital"
        valor={`${progresso}%`}
        icone={ListChecks}
        detalhe={`${concluidos} de ${totalTopicos} tópicos concluídos`}
      >
        <BarraProgresso valor={progresso} corClasse="bg-gradient-to-r from-[#5f2ebe] to-[#ea2be2]" />
      </Metrica>

      <Metrica
        rotulo="Questões resolvidas"
        valor={tentativas.toLocaleString("pt-BR")}
        icone={CheckCircle2}
        tom="azul"
        detalhe={
          <span className="flex gap-3">
            <span>
              <b className="font-semibold text-emerald-600">{acertos.toLocaleString("pt-BR")}</b> acertos
            </span>
            <span>
              <b className="font-semibold text-red-500">{erros.toLocaleString("pt-BR")}</b> erros
            </span>
          </span>
        }
      >
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
          {tentativas > 0 && (
            <>
              <div className="h-full bg-emerald-500" style={{ width: `${(acertos / tentativas) * 100}%` }} />
              <div className="h-full bg-red-400" style={{ width: `${(erros / tentativas) * 100}%` }} />
            </>
          )}
        </div>
      </Metrica>

      <Metrica
        rotulo="Aproveitamento"
        valor={<span className={tentativas > 0 ? tom.texto : "text-slate-400"}>{tentativas > 0 ? `${aproveitamento}%` : "—"}</span>}
        icone={Target}
        tom={tentativas === 0 ? "cinza" : aproveitamento >= meta ? "verde" : "laranja"}
        detalhe={
          <span className="flex items-center gap-1.5">
            Meta:
            {podeEditar ? (
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-white pr-1.5 focus-within:border-[#5f2ebe]/60">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={metaTexto}
                  onChange={(e) => setMetaTexto(e.target.value)}
                  onBlur={confirmarMeta}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  className="w-10 bg-transparent py-0.5 text-center text-xs font-semibold text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Meta de aproveitamento"
                />
                %
              </span>
            ) : (
              <b className="font-semibold text-slate-700">{meta}%</b>
            )}
            {tentativas > 0 && (
              <span className={cn("ml-auto", tom.texto)}>
                {aproveitamento >= meta ? "Meta atingida" : `Faltam ${meta - aproveitamento} p.p.`}
              </span>
            )}
          </span>
        }
      >
        <BarraProgresso valor={aproveitamento} corClasse={tom.barra} marca={meta} />
      </Metrica>

      <Metrica
        rotulo="Data da prova"
        valor={
          dias === null ? (
            <span className="text-slate-400">—</span>
          ) : dias > 0 ? (
            <>
              {dias} <span className="text-base font-medium text-slate-500">{dias === 1 ? "dia" : "dias"}</span>
            </>
          ) : dias === 0 ? (
            "É hoje!"
          ) : (
            <span className="text-slate-400">Já passou</span>
          )
        }
        icone={CalendarDays}
        tom="rosa"
        detalhe={
          dias !== null && dias > 0 && restantes > 0
            ? `${restantes} ${restantes === 1 ? "tópico restante" : "tópicos restantes"} · ~${Math.max(1, Math.ceil(restantes / Math.max(1, Math.ceil(dias / 7))))} por semana`
            : dataProva
              ? format(dataProva, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              : "Defina a data para ver a contagem regressiva"
        }
      >
        {podeEditar && (
          <div className="flex items-center gap-1">
            <Popover open={calendarioAberto} onOpenChange={setCalendarioAberto}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
                >
                  {dataProva ? `Prova em ${format(dataProva, "dd/MM/yyyy")}` : "Definir data"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataProva}
                  defaultMonth={dataProva}
                  onSelect={(d) => {
                    onDataProva(d);
                    setCalendarioAberto(false);
                  }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {dataProva && (
              <button
                type="button"
                onClick={() => onDataProva(undefined)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Remover data"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </Metrica>
    </div>
  );
};
