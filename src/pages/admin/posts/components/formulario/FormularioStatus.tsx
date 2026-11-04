import React from "react";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardLateral } from "./CardLateral";

interface FormularioStatusProps {
  isDraft: boolean;
  onChangeIsDraft: (value: boolean) => void;
  destacado: boolean;
  onChangeDestacado: (value: boolean) => void;
  children?: React.ReactNode;
}

/** Status (rascunho/publicado) e destaque na página inicial. */
export const FormularioStatus: React.FC<FormularioStatusProps> = ({
  isDraft,
  onChangeIsDraft,
  destacado,
  onChangeDestacado,
  children,
}) => (
  <CardLateral titulo="Publicação">
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="radiogroup" aria-label="Status do post">
      {[
        { valor: true, label: "Rascunho" },
        { valor: false, label: "Publicado" },
      ].map((op) => (
        <button
          key={op.label}
          type="button"
          role="radio"
          aria-checked={isDraft === op.valor}
          onClick={() => onChangeIsDraft(op.valor)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition",
            isDraft === op.valor
              ? op.valor
                ? "bg-white text-amber-700 shadow-sm"
                : "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {op.label}
        </button>
      ))}
    </div>
    <p className="text-xs text-slate-500">
      {isDraft ? "Só a equipe vê o post até ele ser publicado." : "Fica visível para todos assim que você salvar."}
    </p>
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-slate-700">
        <Star className={cn("h-4 w-4", destacado ? "fill-amber-400 text-amber-400" : "text-slate-400")} />
        Destacar no blog
      </span>
      <Switch checked={destacado} onCheckedChange={(v) => onChangeDestacado(!!v)} />
    </label>
    {children}
  </CardLateral>
);
