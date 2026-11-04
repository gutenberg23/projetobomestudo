import React, { useLayoutEffect, useRef, useState } from "react";
import { Check, ClipboardPaste, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionOption } from "@/components/admin/questions/types";
import { novoIdAlternativa } from "@/services/questoesAdminService";
import { cn } from "@/lib/utils";
import {
  letraAlternativa,
  MAX_ALTERNATIVAS,
  MIN_ALTERNATIVAS,
  separarAlternativasColadas,
  TIPO_CERTO_ERRADO,
} from "./utils";

interface EditorAlternativasProps {
  tipo: string;
  opcoes: QuestionOption[];
  onChange: (opcoes: QuestionOption[]) => void;
  mostrarErros?: boolean;
}

/** Textarea que cresce com o texto. */
const TextoAlternativa: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [props.value]);
  return <Textarea ref={ref} rows={1} {...props} className={cn("min-h-[38px] resize-none py-2 leading-snug", props.className)} />;
};

export const EditorAlternativas: React.FC<EditorAlternativasProps> = ({ tipo, opcoes, onChange, mostrarErros }) => {
  const [colando, setColando] = useState(false);
  const [textoColado, setTextoColado] = useState("");

  const marcarCorreta = (id: string) => onChange(opcoes.map((o) => ({ ...o, isCorrect: o.id === id })));

  if (tipo === TIPO_CERTO_ERRADO) {
    const certo = opcoes[0];
    const errado = opcoes[1];
    const semGabarito = mostrarErros && !opcoes.some((o) => o.isCorrect);
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">Qual é o gabarito do item?</p>
        <div className={cn("grid grid-cols-2 gap-3", semGabarito && "rounded-lg ring-2 ring-red-200 ring-offset-2")}>
          {[
            { opcao: certo, rotulo: "Certo", cor: "emerald" },
            { opcao: errado, rotulo: "Errado", cor: "rose" },
          ].map(({ opcao, rotulo, cor }) => {
            const ativo = Boolean(opcao?.isCorrect);
            return (
              <button
                key={rotulo}
                type="button"
                disabled={!opcao}
                onClick={() => opcao && marcarCorreta(opcao.id)}
                aria-pressed={ativo}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-base font-semibold transition-colors",
                  ativo
                    ? cor === "emerald"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                )}
              >
                {ativo ? <Check className="h-5 w-5" /> : <span className="h-5 w-5 rounded-full border-2 border-current opacity-40" />}
                {rotulo}
              </button>
            );
          })}
        </div>
        {semGabarito && <p className="text-xs text-red-600">Marque se o item está certo ou errado.</p>}
      </div>
    );
  }

  const atualizarTexto = (id: string, text: string) => onChange(opcoes.map((o) => (o.id === id ? { ...o, text } : o)));
  const remover = (id: string) => onChange(opcoes.filter((o) => o.id !== id));
  const adicionar = () => onChange([...opcoes, { id: novoIdAlternativa(), text: "", isCorrect: false }]);

  const aplicarColagem = () => {
    const partes = separarAlternativasColadas(textoColado).slice(0, MAX_ALTERNATIVAS);
    if (partes.length < MIN_ALTERNATIVAS) return;
    const correta = opcoes.findIndex((o) => o.isCorrect);
    onChange(
      partes.map((text, i) => ({
        id: opcoes[i]?.id || novoIdAlternativa(),
        text,
        isCorrect: i === correta,
      }))
    );
    setColando(false);
    setTextoColado("");
  };

  const previaColagem = colando ? separarAlternativasColadas(textoColado).slice(0, MAX_ALTERNATIVAS) : [];
  const semGabarito = mostrarErros && !opcoes.some((o) => o.isCorrect);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          Clique na letra para marcar o <strong className="font-semibold text-slate-800">gabarito</strong>.
        </p>
        <Button type="button" variant="ghost" size="sm" className="h-8 text-[#5f2ebe]" onClick={() => setColando(!colando)}>
          <ClipboardPaste className="mr-1.5 h-4 w-4" />
          Colar todas
        </Button>
      </div>

      {colando && (
        <div className="space-y-2 rounded-lg border border-dashed border-[#5f2ebe]/40 bg-[#faf8ff] p-3">
          <Textarea
            autoFocus
            value={textoColado}
            onChange={(e) => setTextoColado(e.target.value)}
            placeholder={"Cole as alternativas da prova, por exemplo:\nA) primeira opção\nB) segunda opção\nC) ..."}
            className="min-h-[110px] bg-white text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              {previaColagem.length >= MIN_ALTERNATIVAS
                ? `${previaColagem.length} alternativas encontradas (${previaColagem.map((_, i) => letraAlternativa(tipo, i)).join(", ")})`
                : "Uma alternativa por linha, ou com as letras A), B), C)..."}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setColando(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={previaColagem.length < MIN_ALTERNATIVAS}
                onClick={aplicarColagem}
                className="bg-[#5f2ebe] text-white hover:bg-[#4a1f9c]"
              >
                Substituir alternativas
              </Button>
            </div>
          </div>
        </div>
      )}

      <ol className={cn("space-y-2", semGabarito && "rounded-lg ring-2 ring-red-200 ring-offset-2")}>
        {opcoes.map((o, i) => {
          const letra = letraAlternativa(tipo, i);
          const vazia = mostrarErros && !o.text.trim();
          return (
            <li
              key={o.id}
              className={cn(
                "group flex items-start gap-2 rounded-lg border p-1.5 pr-2 transition-colors",
                o.isCorrect ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white"
              )}
            >
              <button
                type="button"
                onClick={() => marcarCorreta(o.id)}
                title={o.isCorrect ? "Gabarito" : `Marcar ${letra} como gabarito`}
                aria-label={o.isCorrect ? `Alternativa ${letra}, gabarito` : `Marcar alternativa ${letra} como gabarito`}
                aria-pressed={o.isCorrect}
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  o.isCorrect
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-200 text-[#5f2ebe] hover:border-emerald-400 hover:text-emerald-600"
                )}
              >
                {o.isCorrect ? <Check className="h-4 w-4" /> : letra}
              </button>
              <TextoAlternativa
                value={o.text}
                onChange={(e) => atualizarTexto(o.id, e.target.value)}
                placeholder={`Texto da alternativa ${letra}`}
                aria-label={`Texto da alternativa ${letra}`}
                className={cn("border-transparent bg-transparent shadow-none focus-visible:bg-white", vazia && "border-red-300 bg-white")}
              />
              {opcoes.length > MIN_ALTERNATIVAS && (
                <button
                  type="button"
                  onClick={() => remover(o.id)}
                  className="mt-1.5 rounded p-1 text-slate-300 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                  aria-label={`Remover alternativa ${letra}`}
                  title="Remover alternativa"
                >
                  {i === opcoes.length - 1 ? <Trash2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {opcoes.length < MAX_ALTERNATIVAS ? (
          <Button type="button" variant="outline" size="sm" onClick={adicionar}>
            <Plus className="mr-1.5 h-4 w-4" />
            Alternativa {letraAlternativa(tipo, opcoes.length)}
          </Button>
        ) : (
          <span />
        )}
        {semGabarito && <p className="text-xs text-red-600">Marque a alternativa correta.</p>}
      </div>
    </div>
  );
};

/** Alternativas iniciais para cada tipo de questão. */
export function alternativasPara(tipo: string, atuais: QuestionOption[]): QuestionOption[] {
  if (tipo === TIPO_CERTO_ERRADO) {
    const eraCE = atuais.length === 2 && /^cert/i.test(atuais[0]?.text || "") && /^errad/i.test(atuais[1]?.text || "");
    return [
      { id: (eraCE && atuais[0].id) || novoIdAlternativa(), text: "Certo", isCorrect: eraCE && Boolean(atuais[0].isCorrect) },
      { id: (eraCE && atuais[1].id) || novoIdAlternativa(), text: "Errado", isCorrect: eraCE && Boolean(atuais[1].isCorrect) },
    ];
  }
  // Vindo de Certo/Errado ou vazia: 5 alternativas em branco
  const eraCE = atuais.length === 2 && /^cert/i.test(atuais[0]?.text || "") && /^errad/i.test(atuais[1]?.text || "");
  if (eraCE || atuais.length === 0) {
    return Array.from({ length: 5 }, () => ({ id: novoIdAlternativa(), text: "", isCorrect: false }));
  }
  return atuais;
}
