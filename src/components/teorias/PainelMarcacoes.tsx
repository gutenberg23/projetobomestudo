import { useEffect, useState } from "react";
import { Highlighter, LocateFixed, MessageSquareText, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Marcacao } from "./marcacoes";

interface Props {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  marcacoes: Marcacao[];
  naoEncontradas: Set<string>;
  /** Marcação cuja nota deve abrir em edição */
  editandoId: string | null;
  onEditandoId: (id: string | null) => void;
  onIr: (id: string) => void;
  onNota: (id: string, nota: string) => void;
  onRemover: (id: string) => void;
  onLimpar: () => void;
}

const ItemMarcacao = ({
  m,
  perdida,
  editando,
  onEditar,
  onFecharEdicao,
  onIr,
  onNota,
  onRemover,
}: {
  m: Marcacao;
  perdida: boolean;
  editando: boolean;
  onEditar: () => void;
  onFecharEdicao: () => void;
  onIr: () => void;
  onNota: (nota: string) => void;
  onRemover: () => void;
}) => {
  const [nota, setNota] = useState(m.nota || "");
  useEffect(() => setNota(m.nota || ""), [m.nota, editando]);

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3">
      <button
        type="button"
        onClick={onIr}
        disabled={perdida}
        className="block w-full text-left disabled:cursor-default"
        title={perdida ? undefined : "Ir até o trecho"}
      >
        <span
          className="line-clamp-4 rounded px-1 text-sm leading-relaxed text-slate-800 [box-decoration-break:clone]"
          style={{ backgroundColor: m.cor }}
        >
          {m.texto}
        </span>
      </button>
      {perdida && (
        <p className="mt-1.5 text-[11px] text-amber-700">O texto da aula mudou e este trecho não foi encontrado.</p>
      )}

      {editando ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            autoFocus
            rows={3}
            maxLength={1000}
            placeholder="Sua anotação sobre este trecho"
            className="w-full resize-y rounded-lg border border-slate-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                onNota(nota.trim());
                onFecharEdicao();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onFecharEdicao}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#5f2ebe] text-white hover:bg-[#4f25a0]"
              onClick={() => {
                onNota(nota.trim());
                onFecharEdicao();
              }}
            >
              Salvar nota
            </Button>
          </div>
        </div>
      ) : (
        m.nota && (
          <p className="mt-2 whitespace-pre-wrap border-l-2 border-slate-200 pl-2.5 text-xs leading-relaxed text-slate-600">{m.nota}</p>
        )
      )}

      {!editando && (
        <div className="mt-2 flex items-center justify-end gap-1 text-slate-400">
          {!perdida && (
            <button type="button" onClick={onIr} className="rounded-md p-1.5 hover:bg-slate-100 hover:text-slate-700" aria-label="Ir até o trecho">
              <LocateFixed className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onEditar}
            className="rounded-md p-1.5 hover:bg-slate-100 hover:text-slate-700"
            aria-label={m.nota ? "Editar nota" : "Adicionar nota"}
          >
            <MessageSquareText className="h-4 w-4" />
          </button>
          <button type="button" onClick={onRemover} className="rounded-md p-1.5 hover:bg-red-50 hover:text-red-600" aria-label="Remover grifo">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  );
};

/** Lista lateral com os grifos e as notas do aluno nesta teoria. */
export const PainelMarcacoes = ({
  aberto,
  onOpenChange,
  marcacoes,
  naoEncontradas,
  editandoId,
  onEditandoId,
  onIr,
  onNota,
  onRemover,
  onLimpar,
}: Props) => (
  <Sheet open={aberto} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="flex w-full flex-col gap-0 bg-slate-50 p-0 sm:max-w-md">
      <SheetHeader className="border-b border-slate-200 bg-white px-5 py-4 text-left">
        <SheetTitle className="flex items-center gap-2 text-base">
          <Highlighter className="h-4 w-4 text-[#5f2ebe]" />
          Meus grifos
          {marcacoes.length > 0 && (
            <span className="rounded-full bg-[#5f2ebe]/10 px-2 py-0.5 text-xs font-medium tabular-nums text-[#5f2ebe]">{marcacoes.length}</span>
          )}
        </SheetTitle>
        <SheetDescription className="text-xs">Ficam salvos neste navegador. Só você vê.</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {marcacoes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <span className="rounded-full bg-white p-3 text-slate-400 ring-1 ring-slate-200">
              <Highlighter className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-slate-700">Nenhum grifo ainda</p>
            <p className="text-sm text-slate-500">Selecione um trecho da aula e escolha uma cor para grifar.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {marcacoes.map((m) => (
              <ItemMarcacao
                key={m.id}
                m={m}
                perdida={naoEncontradas.has(m.id)}
                editando={editandoId === m.id}
                onEditar={() => onEditandoId(m.id)}
                onFecharEdicao={() => onEditandoId(null)}
                onIr={() => onIr(m.id)}
                onNota={(n) => onNota(m.id, n)}
                onRemover={() => onRemover(m.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {marcacoes.length > 0 && (
        <div className="border-t border-slate-200 bg-white px-5 py-3">
          <button
            type="button"
            onClick={() => window.confirm("Apagar todos os grifos e notas desta teoria?") && onLimpar()}
            className={cn("text-xs text-slate-400 hover:text-red-600")}
          >
            Apagar todos
          </button>
        </div>
      )}
    </SheetContent>
  </Sheet>
);
