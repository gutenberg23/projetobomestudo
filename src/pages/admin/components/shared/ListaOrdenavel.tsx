import React from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ItemOrdenavel {
  id: string;
  titulo: string;
  detalhe?: React.ReactNode;
}

const mover = <T,>(lista: T[], de: number, para: number) => {
  const copia = [...lista];
  const [item] = copia.splice(de, 1);
  copia.splice(para, 0, item);
  return copia;
};

/**
 * Lista numerada que pode ser reordenada arrastando ou com as setas
 * (as setas servem para teclado e celular).
 */
export const ListaOrdenavel: React.FC<{
  id: string;
  itens: ItemOrdenavel[];
  onChange: (itens: ItemOrdenavel[]) => void;
  onRemover?: (id: string) => void;
  desabilitado?: boolean;
  vazio?: React.ReactNode;
}> = ({ id, itens, onChange, onRemover, desabilitado, vazio }) => {
  const aoSoltar = (r: DropResult) => {
    if (!r.destination || r.destination.index === r.source.index) return;
    onChange(mover(itens, r.source.index, r.destination.index));
  };

  if (itens.length === 0) return <>{vazio}</>;

  return (
    <DragDropContext onDragEnd={aoSoltar}>
      <Droppable droppableId={id}>
        {(prov) => (
          <ol ref={prov.innerRef} {...prov.droppableProps} className="space-y-1.5">
            {itens.map((item, i) => (
              <Draggable key={item.id} draggableId={item.id} index={i} isDragDisabled={desabilitado}>
                {(p, snap) => (
                  <li
                    ref={p.innerRef}
                    {...p.draggableProps}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border bg-white px-2 py-2 text-sm",
                      snap.isDragging ? "border-[#5f2ebe]/40 shadow-lg" : "border-slate-200"
                    )}
                  >
                    <span
                      {...p.dragHandleProps}
                      className="cursor-grab rounded p-0.5 text-slate-300 hover:text-slate-500 active:cursor-grabbing"
                      aria-label="Arrastar para reordenar"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-[#5f2ebe]">{i + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-slate-800" title={item.titulo}>
                        {item.titulo}
                      </p>
                      {item.detalhe && <p className="truncate text-xs text-slate-400">{item.detalhe}</p>}
                    </div>
                    <div className="flex shrink-0 items-center">
                      <button
                        type="button"
                        disabled={desabilitado || i === 0}
                        onClick={() => onChange(mover(itens, i, i - 1))}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                        aria-label={`Subir ${item.titulo}`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={desabilitado || i === itens.length - 1}
                        onClick={() => onChange(mover(itens, i, i + 1))}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                        aria-label={`Descer ${item.titulo}`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      {onRemover && (
                        <button
                          type="button"
                          disabled={desabilitado}
                          onClick={() => onRemover(item.id)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                          aria-label={`Remover ${item.titulo}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                )}
              </Draggable>
            ))}
            {prov.placeholder}
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};

/**
 * Busca com lista de resultados embutida (sem popover, para funcionar dentro de
 * modais). Mostra até `limite` itens e marca os já escolhidos.
 */
export const BuscaComLista: React.FC<{
  opcoes: { id: string; titulo: string; detalhe?: string }[];
  escolhidos: string[];
  onEscolher: (id: string) => void;
  placeholder: string;
  limite?: number;
  carregando?: boolean;
}> = ({ opcoes, escolhidos, onEscolher, placeholder, limite = 50, carregando }) => {
  const [termo, setTermo] = React.useState("");
  const norm = (t: string) => (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const filtradas = React.useMemo(() => {
    const t = norm(termo.trim());
    return opcoes.filter((o) => !escolhidos.includes(o.id) && (!t || norm(`${o.titulo} ${o.detalhe || ""} ${o.id}`).includes(t)));
  }, [opcoes, escolhidos, termo]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <input
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-slate-100 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none"
      />
      <ul className="max-h-48 overflow-y-auto">
        {carregando ? (
          <li className="px-3 py-3 text-sm text-slate-400">Carregando...</li>
        ) : filtradas.length === 0 ? (
          <li className="px-3 py-3 text-sm text-slate-400">{termo ? "Nada encontrado." : "Nada para adicionar."}</li>
        ) : (
          filtradas.slice(0, limite).map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onEscolher(o.id)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-[#faf8ff]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-slate-800">{o.titulo}</span>
                  {o.detalhe && <span className="block truncate text-xs text-slate-400">{o.detalhe}</span>}
                </span>
                <span className="shrink-0 text-xs font-medium text-[#5f2ebe]">Adicionar</span>
              </button>
            </li>
          ))
        )}
        {filtradas.length > limite && (
          <li className="px-3 py-2 text-xs text-slate-400">
            Mostrando {limite} de {filtradas.length}. Refine a busca.
          </li>
        )}
      </ul>
    </div>
  );
};
