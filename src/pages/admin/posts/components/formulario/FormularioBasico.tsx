import React, { useLayoutEffect, useRef } from "react";
import { Contador } from "./CardLateral";

interface FormularioBasicoProps {
  titulo: string;
  onChangeTitulo: (value: string) => void;
  resumo: string;
  onChangeResumo: (value: string) => void;
}

/** Título e resumo, no topo da coluna principal, como no post publicado. */
export const FormularioBasico: React.FC<FormularioBasicoProps> = ({ titulo, onChangeTitulo, resumo, onChangeResumo }) => {
  const tudoMinusculo = titulo.length > 10 && titulo === titulo.toLowerCase();
  const tituloRef = useRef<HTMLTextAreaElement>(null);

  // O campo de título cresce com o texto (inclusive ao abrir um post)
  useLayoutEffect(() => {
    const el = tituloRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [titulo]);
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5">
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="titulo" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Título
          </label>
          <Contador atual={titulo.length} ideal={70} max={160} />
        </div>
        <textarea
          id="titulo"
          ref={tituloRef}
          rows={1}
          value={titulo}
          required
          onChange={(e) => onChangeTitulo(e.target.value.replace(/\n/g, " "))}
          placeholder="Ex.: Concurso da Prefeitura de Campinas (SP) abre 120 vagas"
          className="mt-1 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-2xl font-bold leading-tight text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[1.75rem]"
        />
        {tudoMinusculo && (
          <button
            type="button"
            onClick={() => onChangeTitulo(titulo.charAt(0).toUpperCase() + titulo.slice(1))}
            className="mt-1 text-xs text-amber-700 underline-offset-2 hover:underline"
          >
            O título está todo em minúsculas. Corrigir a primeira letra?
          </button>
        )}
      </div>
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <label htmlFor="resumo" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Resumo
          </label>
          <Contador atual={resumo.length} ideal={160} max={300} />
        </div>
        <textarea
          id="resumo"
          rows={2}
          value={resumo}
          required
          onChange={(e) => onChangeResumo(e.target.value)}
          placeholder="Uma ou duas frases com o essencial: órgão, vagas, salário e prazo de inscrição."
          className="mt-1 w-full resize-y border-0 bg-transparent p-0 text-base leading-relaxed text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
};
