import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ClipboardPaste, Layers, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Etiqueta } from "@/components/admin/ui/listagem";
import { lerCsvFlashcards, type FlashcardRascunho } from "@/lib/flashcards";

interface Props {
  idPrefix: string;
  /** undefined enquanto os cartões do tópico carregam */
  value: FlashcardRascunho[] | undefined;
  onChange: (cartoes: FlashcardRascunho[]) => void;
}

/** Campo "Flashcards" do formulário de tópicos: lista de frente/verso. */
export const FlashcardsTopicoField: React.FC<Props> = ({ idPrefix, value, onChange }) => {
  const [colando, setColando] = useState(false);
  const [textoColado, setTextoColado] = useState("");

  if (value === undefined) return <p className="text-sm text-slate-500">Carregando flashcards do tópico...</p>;

  const atualizar = (i: number, campo: "frente" | "verso", v: string) => onChange(value.map((c, j) => (j === i ? { ...c, [campo]: v } : c)));
  const remover = (i: number) => onChange(value.filter((_, j) => j !== i));
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const l = [...value];
    [l[i], l[j]] = [l[j], l[i]];
    onChange(l);
  };

  const adicionarColados = () => {
    const { linhas } = lerCsvFlashcards(textoColado);
    const validas = linhas.filter((l) => !l.erro);
    if (validas.length === 0) {
      toast.error("Nenhum cartão encontrado. Use uma linha por cartão: frente;verso");
      return;
    }
    onChange([...value, ...validas.map((l) => ({ frente: l.frente, verso: l.verso, tags: l.tags }))]);
    const ignoradas = linhas.length - validas.length;
    toast.success(`${validas.length} ${validas.length === 1 ? "cartão adicionado" : "cartões adicionados"}${ignoradas ? ` (${ignoradas} sem frente ou verso ignorados)` : ""}`);
    setTextoColado("");
    setColando(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm text-slate-600">
          <Layers className="h-4 w-4 text-[#5f2ebe]" />
          {value.length === 0 ? "Nenhum flashcard" : `${value.length} ${value.length === 1 ? "flashcard" : "flashcards"}`}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setColando((v) => !v)}>
            <ClipboardPaste className="mr-1.5 h-4 w-4" />
            Colar vários
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { frente: "", verso: "" }])}>
            <Plus className="mr-1.5 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {colando && (
        <div className="space-y-2 rounded-lg border border-dashed border-[#5f2ebe]/30 bg-[#f8f5ff] p-3">
          <Textarea
            id={`${idPrefix}-flash-colar`}
            value={textoColado}
            onChange={(e) => setTextoColado(e.target.value)}
            rows={4}
            placeholder={"Uma linha por cartão, frente e verso separados por ; ou Tab (como no Anki):\nO que é ato vinculado?;Ato sem margem de escolha para o administrador"}
            className="bg-white font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setColando(false)}>
              Cancelar
            </Button>
            <Button type="button" size="sm" className="bg-[#5f2ebe] text-white hover:bg-[#4f25a0]" onClick={adicionarColados}>
              Adicionar à lista
            </Button>
          </div>
        </div>
      )}

      {value.length > 0 && (
        <ol className="space-y-2">
          {value.map((c, i) => (
            <li key={c.id || `novo-${i}`} className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  Cartão {i + 1}
                  {!!c.cursosIds?.length && (
                    <Etiqueta tom="azul" title="Definido na página Flashcards">
                      Só em {c.cursosIds.length} {c.cursosIds.length === 1 ? "curso" : "cursos"}
                    </Etiqueta>
                  )}
                </span>
                <span className="flex items-center gap-0.5">
                  <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Subir">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === value.length - 1}
                    className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    aria-label="Descer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => remover(i)} className="rounded p-1 text-slate-400 hover:text-red-600" aria-label={`Remover cartão ${i + 1}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Textarea
                  aria-label={`Frente do cartão ${i + 1}`}
                  value={c.frente}
                  onChange={(e) => atualizar(i, "frente", e.target.value)}
                  rows={2}
                  placeholder="Frente (pergunta)"
                  className="min-h-[60px] text-sm"
                />
                <Textarea
                  aria-label={`Verso do cartão ${i + 1}`}
                  value={c.verso}
                  onChange={(e) => atualizar(i, "verso", e.target.value)}
                  rows={2}
                  placeholder="Verso (resposta)"
                  className="min-h-[60px] text-sm"
                />
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="text-xs text-[#67748a]">
        Cartões sem frente ou verso são ignorados ao salvar. Novos cartões aparecem em todos os cursos que usam este tópico; para
        restringir a alguns cursos ou importar um arquivo .csv, use a página{" "}
        <Link to="/admin/flashcards" className="font-medium text-[#5f2ebe] hover:underline">
          Flashcards
        </Link>
        .
      </p>
    </div>
  );
};
