import React, { useMemo } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Facetas, FiltrosQuestoes } from "@/services/questoesAdminService";
import { CampoEscolhaMultipla } from "./CampoEscolha";

type ChaveLista = "disciplinas" | "assuntos" | "topicos" | "bancas" | "orgaos" | "cargos" | "anos" | "niveis" | "dificuldades" | "tipos";

export const ROTULOS_FILTRO: Record<ChaveLista, string> = {
  disciplinas: "Disciplina",
  assuntos: "Assunto",
  topicos: "Tópico",
  bancas: "Banca",
  orgaos: "Órgão",
  cargos: "Cargo",
  anos: "Ano",
  niveis: "Nível",
  dificuldades: "Dificuldade",
  tipos: "Tipo",
};

export const CHAVES_LISTA = Object.keys(ROTULOS_FILTRO) as ChaveLista[];

export function contarFiltros(f: FiltrosQuestoes): number {
  return CHAVES_LISTA.reduce((n, k) => n + f[k].length, 0) + (f.semExplicacaoIA ? 1 : 0) + (f.semComentarioProfessor ? 1 : 0);
}

interface PainelFiltrosProps {
  filtros: FiltrosQuestoes;
  facetas: Facetas;
  onChange: (f: FiltrosQuestoes) => void;
}

/** Campos de filtro (painel que abre abaixo da busca, na página de questões). */
export const PainelFiltros: React.FC<PainelFiltrosProps> = ({ filtros, facetas, onChange }) => {
  const set = <K extends keyof FiltrosQuestoes>(k: K, v: FiltrosQuestoes[K]) => onChange({ ...filtros, [k]: v });

  // Assuntos e tópicos sugeridos a partir do que já foi escolhido
  const assuntosSugeridos = useMemo(
    () => [...new Set(filtros.disciplinas.flatMap((d) => facetas.assuntosPorDisciplina[d] || []))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [filtros.disciplinas, facetas.assuntosPorDisciplina]
  );
  const topicosSugeridos = useMemo(
    () => [...new Set(filtros.assuntos.flatMap((a) => facetas.topicosPorAssunto[a] || []))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [filtros.assuntos, facetas.topicosPorAssunto]
  );

  const campo = (k: ChaveLista, opcoes: string[], extra?: Partial<React.ComponentProps<typeof CampoEscolhaMultipla>>) => (
    <div className="space-y-1.5">
      <Label htmlFor={`filtro-${k}`} className="text-xs font-medium text-slate-600">
        {ROTULOS_FILTRO[k]}
      </Label>
      <CampoEscolhaMultipla
        id={`filtro-${k}`}
        valores={filtros[k]}
        onChange={(v) => set(k, v)}
        opcoes={opcoes}
        permitirNovo={false}
        placeholder="Todos"
        etiquetas={false}
        {...extra}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Switch checked={filtros.semExplicacaoIA} onCheckedChange={(v) => set("semExplicacaoIA", v)} />
          Sem explicação da IA
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Switch checked={filtros.semComentarioProfessor} onCheckedChange={(v) => set("semComentarioProfessor", v)} />
          Sem comentário do professor
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {campo("disciplinas", facetas.disciplinas)}
        {campo("assuntos", facetas.assuntos, { sugeridas: assuntosSugeridos, rotuloSugeridas: "Das disciplinas escolhidas" })}
        {campo("topicos", facetas.topicos, { sugeridas: topicosSugeridos, rotuloSugeridas: "Dos assuntos escolhidos" })}
        {campo("bancas", facetas.bancas)}
        {campo("orgaos", facetas.orgaos)}
        {campo("cargos", facetas.cargos)}
        {campo("anos", facetas.anos)}
        {campo("tipos", facetas.tipos)}
        {campo("niveis", facetas.niveis)}
        {campo("dificuldades", facetas.dificuldades)}
      </div>
    </div>
  );
};

/** Etiquetas dos filtros ativos, com botão para remover cada um. */
export const FiltrosAtivos: React.FC<{ filtros: FiltrosQuestoes; onChange: (f: FiltrosQuestoes) => void; onLimpar: () => void }> = ({
  filtros,
  onChange,
  onLimpar,
}) => {
  const itens: { chave: string; rotulo: string; remover: () => void }[] = [];
  if (filtros.semExplicacaoIA) itens.push({ chave: "ia", rotulo: "Sem explicação da IA", remover: () => onChange({ ...filtros, semExplicacaoIA: false }) });
  if (filtros.semComentarioProfessor)
    itens.push({ chave: "prof", rotulo: "Sem comentário do professor", remover: () => onChange({ ...filtros, semComentarioProfessor: false }) });
  for (const k of CHAVES_LISTA) {
    for (const v of filtros[k]) {
      itens.push({
        chave: `${k}-${v}`,
        rotulo: `${ROTULOS_FILTRO[k]}: ${v}`,
        remover: () => onChange({ ...filtros, [k]: filtros[k].filter((x) => x !== v) }),
      });
    }
  }
  if (!itens.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2 sm:px-4">
      {itens.map((i) => (
        <span key={i.chave} className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#5f2ebe]/[0.07] py-0.5 pl-2.5 pr-1 text-xs text-[#4a2396]">
          <span className="truncate">{i.rotulo}</span>
          <button type="button" onClick={i.remover} className="rounded-full p-0.5 hover:bg-[#5f2ebe]/15" aria-label={`Remover filtro ${i.rotulo}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button type="button" onClick={onLimpar} className="ml-1 text-xs font-medium text-slate-500 hover:text-slate-800">
        Limpar tudo
      </button>
    </div>
  );
};
