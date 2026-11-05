import React, { useEffect, useState } from "react";
import { fetchDisciplinasQuestoes } from "@/services/disciplinasQuestoesService";
import { cn } from "@/lib/utils";

let cache: string[] | null = null;

/** Nomes das disciplinas cadastradas para as questões (carregados uma vez). */
function useNomesDisciplinasQuestoes() {
  const [nomes, setNomes] = useState<string[]>(cache || []);
  useEffect(() => {
    if (cache) return;
    fetchDisciplinasQuestoes().then((lista) => {
      cache = Array.from(new Set(lista.map((d) => (d.nome || "").trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      );
      setNomes(cache);
    });
  }, []);
  return nomes;
}

interface Props {
  id: string;
  valor: string;
  onChange: (valor: string) => void;
  className?: string;
}

/**
 * Escolha da disciplina das questões (questoes.discipline) usada na aba
 * Estatísticas. É um <select> nativo de propósito: Popover/Command dentro de
 * Dialog não recebem cliques neste projeto.
 */
export const CampoDisciplinaQuestoes: React.FC<Props> = ({ id, valor, onChange, className }) => {
  const nomes = useNomesDisciplinasQuestoes();
  // Valor salvo que não está mais na lista continua aparecendo
  const opcoes = valor && !nomes.includes(valor) ? [valor, ...nomes] : nomes;
  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !valor && "text-muted-foreground",
        className
      )}
    >
      <option value="">Automático (descobrir pelas questões)</option>
      {opcoes.map((n) => (
        <option key={n} value={n} className="text-foreground">
          {n}
        </option>
      ))}
    </select>
  );
};

/** Erro de coluna inexistente (migration ainda não rodada). */
export const faltaColunaDisciplinaQuestoes = (erro: { code?: string; message?: string } | null) =>
  !!erro && (erro.code === "PGRST204" || erro.code === "42703") && /disciplina_questoes/.test(erro.message || "");
