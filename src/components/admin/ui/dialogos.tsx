import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Confirmação de ação destrutiva (excluir, desvincular...).
 * Mostra o que será afetado e espera a ação terminar antes de fechar.
 */
export const ConfirmarAcao: React.FC<{
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: React.ReactNode;
  /** Lista do que será afetado */
  detalhes?: React.ReactNode[];
  textoConfirmar?: string;
  perigo?: boolean;
  onConfirmar: () => unknown | Promise<unknown>;
}> = ({ aberto, onFechar, titulo, descricao, detalhes, textoConfirmar = "Excluir", perigo = true, onConfirmar }) => {
  const [executando, setExecutando] = useState(false);

  const confirmar = async () => {
    setExecutando(true);
    try {
      await onConfirmar();
      onFechar();
    } finally {
      setExecutando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !executando && onFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                perigo ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="space-y-1.5 text-left">
              <DialogTitle className="text-base text-slate-900">{titulo}</DialogTitle>
              {descricao && <DialogDescription className="text-sm text-slate-500">{descricao}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        {detalhes && detalhes.length > 0 && (
          <ul className="ml-[52px] list-disc space-y-1 pl-4 text-sm text-slate-600">
            {detalhes.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={executando}>
            Cancelar
          </Button>
          <Button
            onClick={confirmar}
            disabled={executando}
            className={perigo ? "bg-red-600 text-white hover:bg-red-700" : "bg-[#5f2ebe] text-white hover:bg-[#4f25a0]"}
          >
            {executando ? "Aguarde..." : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Bloco de formulário com título e descrição (usado em modais e páginas de edição). */
export const SecaoFormulario: React.FC<{
  titulo: string;
  descricao?: React.ReactNode;
  acoes?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ titulo, descricao, acoes, children, className }) => (
  <section className={cn("rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)}>
    <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{titulo}</h2>
        {descricao && <p className="mt-0.5 text-xs text-slate-500">{descricao}</p>}
      </div>
      {acoes}
    </header>
    <div className="space-y-4 px-4 py-4 sm:px-5">{children}</div>
  </section>
);

/** Linha "rótulo + explicação | controle", para interruptores de configuração. */
export const LinhaOpcao: React.FC<{
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  alerta?: boolean;
}> = ({ titulo, descricao, htmlFor, children, alerta }) => (
  <div className="flex items-start justify-between gap-4 py-1">
    <div className="min-w-0">
      <label htmlFor={htmlFor} className={cn("text-sm font-medium", alerta ? "text-amber-800" : "text-slate-800")}>
        {titulo}
      </label>
      {descricao && <p className={cn("mt-0.5 text-xs", alerta ? "text-amber-700" : "text-slate-500")}>{descricao}</p>}
    </div>
    <div className="shrink-0 pt-0.5">{children}</div>
  </div>
);
