import React, { useEffect, useMemo, useState } from "react";
import { Combine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Disciplina } from "./DisciplinasTypes";

interface Props {
  /** Disciplinas marcadas para unificar (2 ou mais) */
  disciplinas: Disciplina[] | null;
  cursosDaDisciplina: Map<string, { id: string; titulo: string }[]>;
  onFechar: () => void;
  onUnificar: (principalId: string, repetidasIds: string[]) => Promise<boolean>;
}

/**
 * Junta disciplinas repetidas numa só. Mostra o que vai acontecer antes de confirmar.
 * Escolha da principal com botões de opção (sem popover dentro do Dialog).
 */
export const UnificarDisciplinasDialog: React.FC<Props> = ({ disciplinas, cursosDaDisciplina, onFechar, onUnificar }) => {
  const [principal, setPrincipal] = useState("");
  const [executando, setExecutando] = useState(false);

  useEffect(() => {
    if (!disciplinas?.length) return;
    // Sugere a que tem mais aulas (empate: a que está em mais cursos)
    const melhor = [...disciplinas].sort(
      (a, b) => b.aulasIds.length - a.aulasIds.length || (cursosDaDisciplina.get(b.id)?.length || 0) - (cursosDaDisciplina.get(a.id)?.length || 0)
    )[0];
    setPrincipal(melhor.id);
  }, [disciplinas, cursosDaDisciplina]);

  const resumo = useMemo(() => {
    if (!disciplinas) return { aulas: 0, cursos: [] as { id: string; titulo: string }[], titulos: 0 };
    const ordem = [...disciplinas].sort((a, b) => (a.id === principal ? -1 : b.id === principal ? 1 : 0));
    const aulas = new Set(ordem.flatMap((d) => d.aulasIds));
    const cursos = new Map<string, { id: string; titulo: string }>();
    disciplinas.forEach((d) => (cursosDaDisciplina.get(d.id) || []).forEach((c) => cursos.set(c.id, c)));
    const titulos = new Set(disciplinas.map((d) => d.titulo.trim().toLowerCase())).size;
    return { aulas: aulas.size, cursos: Array.from(cursos.values()), titulos };
  }, [disciplinas, principal, cursosDaDisciplina]);

  const confirmar = async () => {
    if (!disciplinas || !principal) return;
    setExecutando(true);
    const ok = await onUnificar(
      principal,
      disciplinas.filter((d) => d.id !== principal).map((d) => d.id)
    );
    setExecutando(false);
    if (ok) onFechar();
  };

  return (
    <Dialog open={!!disciplinas} onOpenChange={(o) => !o && !executando && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Combine className="h-5 w-5 text-[#5f2ebe]" />
            Unificar {disciplinas?.length || 0} disciplinas
          </DialogTitle>
          <DialogDescription>
            Fica uma disciplina só, com todas as aulas. Cada curso continua mostrando exatamente as aulas que mostrava
            antes, e o progresso dos alunos não muda.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-1.5">
          <legend className="mb-1.5 text-sm font-medium text-slate-800">Qual fica como principal?</legend>
          {disciplinas?.map((d) => {
            const cursos = cursosDaDisciplina.get(d.id) || [];
            return (
              <label
                key={d.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5",
                  principal === d.id ? "border-[#5f2ebe] bg-[#5f2ebe]/[0.04]" : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <input
                  type="radio"
                  name="disciplina-principal"
                  checked={principal === d.id}
                  onChange={() => setPrincipal(d.id)}
                  className="mt-1 h-4 w-4 accent-[#5f2ebe]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">{d.titulo}</span>
                  <span className="block text-xs text-slate-500">
                    {[d.banca, `${d.aulasIds.length} aulas`, cursos.length ? `em ${cursos.length} ${cursos.length === 1 ? "curso" : "cursos"}` : "em nenhum curso"]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <ul className="list-disc space-y-1 rounded-lg bg-slate-50 py-3 pl-8 pr-3 text-sm text-slate-600">
          <li>
            A principal passa a ter <strong>{resumo.aulas} aulas</strong> (as dela primeiro, depois as que faltavam, sem
            repetir).
          </li>
          <li>
            {resumo.cursos.length === 0
              ? "Nenhum curso usa essas disciplinas."
              : `${resumo.cursos.length} ${resumo.cursos.length === 1 ? "curso passa" : "cursos passam"} a usar a principal, com as mesmas aulas de antes: ${resumo.cursos
                  .map((c) => c.titulo)
                  .join(", ")}.`}
          </li>
          <li>O ciclo de estudos dos alunos nesses cursos é mantido.</li>
          <li>As outras não são apagadas: somem das listas e o link antigo mostra o conteúdo da principal.</li>
        </ul>
        {resumo.titulos > 1 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            As disciplinas marcadas têm nomes diferentes. Confira se são mesmo a mesma disciplina.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={executando}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={executando || !principal} className="bg-[#5f2ebe] text-white hover:bg-[#4f25a0]">
            {executando ? "Unificando..." : "Unificar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
