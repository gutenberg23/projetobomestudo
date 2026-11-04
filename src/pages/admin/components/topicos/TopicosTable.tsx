import React from "react";
import {
  BookOpenText,
  Copy,
  CopyPlus,
  Edit,
  FileAudio,
  FileQuestion,
  Map as MapIcon,
  Music,
  NotebookPen,
  ScrollText,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CaixaSelecao, MenuAcoes, copiarTexto } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";
import { Topico } from "./TopicosTypes";

const temLista = (v: string | string[]) => (Array.isArray(v) ? v.filter(Boolean).length > 0 : !!v);

/** Materiais de um tópico, na ordem em que aparecem para o aluno. */
export const materiaisDoTopico = (t: Topico) => [
  { id: "video", label: "Videoaula", icone: Video, ok: !!t.videoUrl },
  {
    id: "texto",
    label: t.teoriaId ? "Aula em texto (teoria)" : "Aula em texto (PDF)",
    icone: BookOpenText,
    ok: !!t.teoriaId || !!t.pdfUrl,
  },
  { id: "mapa", label: "Mapa mental", icone: MapIcon, ok: !!t.mapaUrl },
  { id: "resumo", label: "Resumo", icone: ScrollText, ok: !!t.resumoUrl },
  { id: "musica", label: "Música", icone: Music, ok: temLista(t.musicaUrl) },
  { id: "audio", label: "Resumo em áudio", icone: FileAudio, ok: temLista(t.resumoAudioUrl) },
  { id: "caderno", label: "Caderno de questões", icone: NotebookPen, ok: !!t.cadernoQuestoesUrl },
];

interface TopicosTableProps {
  topicos: Topico[];
  todosSelecionados: boolean;
  algunsSelecionados?: boolean;
  handleSelecaoTodos: () => void;
  handleSelecaoTopico: (id: string) => void;
  openEditModal: (topico: Topico) => void;
  openDeleteModal: (topico: Topico) => void;
  onDuplicar?: (topico: Topico) => void;
  vazio?: React.ReactNode;
}

export const TopicosTable: React.FC<TopicosTableProps> = ({
  topicos,
  todosSelecionados,
  algunsSelecionados,
  handleSelecaoTodos,
  handleSelecaoTopico,
  openEditModal,
  openDeleteModal,
  onDuplicar,
  vazio,
}) => {
  if (topicos.length === 0) return <>{vazio}</>;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-500 sm:px-4">
        <CaixaSelecao
          marcado={todosSelecionados ? true : algunsSelecionados ? "indeterminado" : false}
          onChange={handleSelecaoTodos}
          rotulo="Selecionar todos desta página"
        />
        <span className="flex-1">Tópico</span>
        <span className="hidden w-[196px] lg:block">Materiais</span>
        <span className="hidden w-16 text-right md:block">Questões</span>
        <span className="w-[116px] sm:w-[124px]" aria-hidden />
      </div>
      <ul className="divide-y divide-slate-100">
        {topicos.map((topico) => {
          const materiais = materiaisDoTopico(topico);
          const prontos = materiais.filter((m) => m.ok).length;
          return (
            <li
              key={topico.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 transition-colors sm:px-4",
                topico.selecionado ? "bg-[#5f2ebe]/[0.04]" : "hover:bg-[#faf8ff]"
              )}
            >
              <CaixaSelecao
                marcado={!!topico.selecionado}
                onChange={() => handleSelecaoTopico(topico.id)}
                rotulo={`Selecionar ${topico.titulo}`}
              />

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => openEditModal(topico)}
                  className="line-clamp-2 text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
                >
                  {topico.titulo || <span className="italic text-slate-400">Sem título</span>}
                </button>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-600">{topico.disciplina || "Sem disciplina"}</span>
                  <span aria-hidden>·</span>
                  <span className={topico.professor_nome ? "" : "italic text-slate-400"}>
                    {topico.professor_nome || "sem professor"}
                  </span>
                  {topico.patrocinador && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="truncate">patrocínio {topico.patrocinador}</span>
                    </>
                  )}
                  {/* No celular os materiais viram um resumo */}
                  <span className="lg:hidden" aria-hidden>
                    ·
                  </span>
                  <span className="lg:hidden">
                    {prontos}/{materiais.length} materiais
                  </span>
                </div>
              </div>

              <div className="hidden w-[196px] items-center gap-1 lg:flex" aria-label={`${prontos} de ${materiais.length} materiais`}>
                {materiais.map((m) => {
                  const Icone = m.icone;
                  return (
                    <span
                      key={m.id}
                      title={`${m.label}: ${m.ok ? "cadastrado" : "falta"}`}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md",
                        m.ok ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-300"
                      )}
                    >
                      <Icone className="h-3.5 w-3.5" />
                    </span>
                  );
                })}
              </div>

              <span
                className={cn(
                  "hidden w-16 items-center justify-end gap-1 text-xs tabular-nums md:flex",
                  topico.questoesIds.length ? "text-slate-700" : "text-slate-300"
                )}
                title="Questões vinculadas"
              >
                <FileQuestion className="h-3.5 w-3.5" />
                {topico.questoesIds.length}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(topico)} className="hidden text-slate-600 sm:inline-flex">
                  <Edit className="mr-1.5 h-4 w-4" />
                  Editar
                </Button>
                <MenuAcoes
                  acoes={[
                    { label: "Editar", icone: Edit, onClick: () => openEditModal(topico), soCelular: true },
                    {
                      label: "Copiar ID",
                      icone: Copy,
                      onClick: async () =>
                        (await copiarTexto(topico.id)) ? toast.success("ID copiado") : toast.error("Não foi possível copiar"),
                    },
                    { label: "Duplicar", icone: CopyPlus, onClick: () => onDuplicar?.(topico), oculto: !onDuplicar },
                    { label: "Excluir", icone: Trash2, onClick: () => openDeleteModal(topico), perigo: true, separadorAntes: true },
                  ]}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
