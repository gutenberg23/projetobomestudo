import React, { useState } from "react";
import {
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  Copy,
  Edit,
  Eraser,
  GraduationCap,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuestionStats } from "@/components/new/question/QuestionStats";
import { QuestaoAdmin } from "@/services/questoesAdminService";
import { prepareHtmlContent } from "@/utils/text-utils";
import { cn } from "@/lib/utils";
import { gabarito, letraAlternativa, temConteudo, textoPuro, TIPO_CERTO_ERRADO } from "./utils";

interface ListagemQuestoesProps {
  questoes: QuestaoAdmin[];
  selecionadas: Set<string>;
  onSelecionar: (id: string) => void;
  onSelecionarPagina: (marcar: boolean) => void;
  onEditar: (q: QuestaoAdmin) => void;
  onExcluir: (q: QuestaoAdmin) => void;
  onLimparEstatisticas: (q: QuestaoAdmin) => void;
  onCopiarId: (id: string) => void;
  /** Termo buscado, para destacar no resumo. */
  busca?: string;
}

const Indicador: React.FC<{ ok: boolean; icone: React.ReactNode; rotulo: string }> = ({ ok, icone, rotulo }) => (
  <span
    title={`${rotulo}: ${ok ? "sim" : "não"}`}
    className={cn(
      "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]",
      ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400 line-through decoration-slate-300"
    )}
  >
    {icone}
    {rotulo}
  </span>
);

function Destaque({ texto, termo }: { texto: string; termo?: string }) {
  const t = (termo || "").trim();
  if (!t || t.length < 2) return <>{texto}</>;
  const i = texto.toLowerCase().indexOf(t.toLowerCase());
  if (i < 0) return <>{texto}</>;
  // Mostra o trecho em volta do termo encontrado
  const inicio = Math.max(0, i - 60);
  return (
    <>
      {inicio > 0 && "…"}
      {texto.slice(inicio, i)}
      <mark className="rounded bg-amber-100 px-0.5 text-slate-900">{texto.slice(i, i + t.length)}</mark>
      {texto.slice(i + t.length)}
    </>
  );
}

const Detalhe: React.FC<{ q: QuestaoAdmin }> = ({ q }) => (
  <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm">
    {temConteudo(q.expandableContent) && (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-3">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Texto de apoio</p>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: prepareHtmlContent(q.expandableContent) }} />
      </div>
    )}
    <div className="prose prose-sm max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: prepareHtmlContent(q.content) }} />
    {q.options.length > 0 && (
      <ol className="space-y-1.5">
        {q.options.map((o, i) => (
          <li
            key={o.id}
            className={cn(
              "flex items-start gap-2 rounded-md px-2 py-1.5",
              o.isCorrect ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "bg-white text-slate-700"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                o.isCorrect ? "bg-emerald-500 text-white" : "border border-slate-200 text-[#5f2ebe]"
              )}
            >
              {o.isCorrect ? <Check className="h-3.5 w-3.5" /> : letraAlternativa(q.questionType, i)}
            </span>
            <span className="pt-0.5" dangerouslySetInnerHTML={{ __html: prepareHtmlContent(o.text) }} />
          </li>
        ))}
      </ol>
    )}
  </div>
);

const ListagemQuestoes: React.FC<ListagemQuestoesProps> = ({
  questoes,
  selecionadas,
  onSelecionar,
  onSelecionarPagina,
  onEditar,
  onExcluir,
  onLimparEstatisticas,
  onCopiarId,
  busca,
}) => {
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const alternarAberta = (id: string) =>
    setAbertas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const todasMarcadas = questoes.length > 0 && questoes.every((q) => selecionadas.has(q.id));
  const algumaMarcada = questoes.some((q) => selecionadas.has(q.id));

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-3 py-2 text-xs text-slate-500 sm:px-4">
        <input
          type="checkbox"
          checked={todasMarcadas}
          ref={(el) => {
            if (el) el.indeterminate = algumaMarcada && !todasMarcadas;
          }}
          onChange={() => onSelecionarPagina(!todasMarcadas)}
          className="h-4 w-4 rounded border-slate-300 accent-[#5f2ebe]"
          aria-label="Selecionar todas desta página"
        />
        <span>Selecionar página</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {questoes.map((q) => {
          const marcada = selecionadas.has(q.id);
          const aberta = abertas.has(q.id);
          const gab = gabarito(q.questionType, q.options);
          const texto = textoPuro(q.content);
          const meta = [q.institution, q.organization, q.year].filter(Boolean);
          return (
            <li key={q.id} className={cn("group px-3 py-3.5 transition-colors sm:px-4", marcada ? "bg-[#faf8ff]" : "hover:bg-slate-50/70")}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={marcada}
                  onChange={() => onSelecionar(q.id)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#5f2ebe]"
                  aria-label="Selecionar questão"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    {q.discipline && <span className="font-semibold text-[#5f2ebe]">{q.discipline}</span>}
                    {meta.length > 0 && <span className="text-slate-500">{meta.join(" · ")}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditar(q)}
                    className="line-clamp-2 text-left text-sm leading-relaxed text-slate-800 hover:text-[#5f2ebe]"
                    title="Editar questão"
                  >
                    {texto ? <Destaque texto={texto} termo={busca} /> : <span className="italic text-slate-400">Sem enunciado</span>}
                  </button>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                      {q.questionType === TIPO_CERTO_ERRADO ? "Certo/Errado" : q.questionType || "Sem tipo"}
                    </span>
                    {q.difficulty && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{q.difficulty}</span>}
                    {q.assuntos.slice(0, 2).map((a) => (
                      <span key={a} className="max-w-[14rem] truncate rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600" title={a}>
                        {a}
                      </span>
                    ))}
                    {q.assuntos.length > 2 && (
                      <span className="text-[11px] text-slate-400" title={q.assuntos.join(", ")}>
                        +{q.assuntos.length - 2}
                      </span>
                    )}
                    <span className="mx-0.5 hidden h-3 w-px bg-slate-200 sm:inline-block" aria-hidden />
                    <Indicador ok={temConteudo(q.teacherExplanation)} icone={<GraduationCap className="h-3 w-3" />} rotulo="Professor" />
                    <Indicador ok={temConteudo(q.aiExplanation)} icone={<Bot className="h-3 w-3" />} rotulo="IA" />
                    <button
                      type="button"
                      onClick={() => alternarAberta(q.id)}
                      className="ml-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-[#5f2ebe]"
                      aria-expanded={aberta}
                    >
                      {aberta ? "Fechar" : "Ver questão"}
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", aberta && "rotate-180")} />
                    </button>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <span
                    className={cn(
                      "hidden h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-bold sm:flex",
                      gab ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-600 ring-1 ring-red-200"
                    )}
                    title={gab ? `Gabarito: ${gab}` : "Sem gabarito marcado"}
                  >
                    {gab || "?"}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={() => onEditar(q)} className="hidden h-8 md:inline-flex">
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="hidden h-8 w-8 p-0 text-slate-500 sm:inline-flex" aria-label="Estatísticas">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0" align="end">
                      <QuestionStats questionId={q.id} />
                    </PopoverContent>
                  </Popover>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Mais ações">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => onEditar(q)} className="md:hidden">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCopiarId(q.id)}>
                        <Copy className="mr-2 h-4 w-4" /> Copiar ID
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onLimparEstatisticas(q)}>
                        <Eraser className="mr-2 h-4 w-4" /> Zerar estatísticas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onExcluir(q)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {aberta && (
                <div className="pl-7">
                  <Detalhe q={q} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ListagemQuestoes;
