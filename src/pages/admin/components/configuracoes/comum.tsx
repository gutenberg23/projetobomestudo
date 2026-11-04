import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Etiqueta } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";

export type SiteConfig = ReturnType<typeof useSiteConfig>["config"];

/** Props comuns a cada seção: avisa a página se há alterações não salvas. */
export interface SecaoProps {
  onSujo: (sujo: boolean) => void;
}

/**
 * Cópia editável de um pedaço da configuração.
 * `sujo` indica se a cópia difere do que está salvo.
 */
export function useRascunho<T>(origem: T, carregando: boolean, onSujo: (s: boolean) => void) {
  const [valor, setValor] = useState<T>(origem);
  const base = useRef(JSON.stringify(origem));

  useEffect(() => {
    if (carregando) return;
    base.current = JSON.stringify(origem);
    setValor(origem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregando, JSON.stringify(origem)]);

  const sujo = useMemo(() => JSON.stringify(valor) !== base.current, [valor]);

  useEffect(() => {
    onSujo(sujo);
  }, [sujo, onSujo]);

  useEffect(() => () => onSujo(false), [onSujo]);

  const mudar = useCallback(<K extends keyof T>(k: K, v: T[K]) => setValor((x) => ({ ...x, [k]: v })), []);
  const descartar = useCallback(() => setValor(JSON.parse(base.current)), []);

  return { valor, setValor, mudar, sujo, descartar };
}

/** Barra fixa no fim da seção com o estado e os botões de salvar. */
export const BarraSalvar: React.FC<{ sujo: boolean; salvando: boolean; onSalvar: () => void; onDescartar: () => void; bloqueado?: string }> = ({
  sujo,
  salvando,
  onSalvar,
  onDescartar,
  bloqueado,
}) => (
  <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:-mx-0 md:rounded-xl md:border md:shadow-[0_-4px_16px_rgba(16,24,40,0.06)]">
    <div className="flex items-center justify-between gap-3">
      <p className={cn("flex items-center gap-1.5 text-sm", bloqueado ? "text-red-600" : sujo ? "text-amber-700" : "text-slate-500")}>
        {bloqueado ? (
          <AlertCircle className="h-4 w-4 shrink-0" />
        ) : sujo ? (
          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
        ) : (
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
        )}
        <span className="truncate">{bloqueado || (sujo ? "Alterações não salvas" : "Tudo salvo")}</span>
      </p>
      <div className="flex shrink-0 gap-2">
        {sujo && (
          <Button variant="ghost" size="sm" onClick={onDescartar} disabled={salvando}>
            Descartar
          </Button>
        )}
        <Button size="sm" onClick={onSalvar} disabled={!sujo || salvando || !!bloqueado} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  </div>
);

/** Marca opções que ficam salvas mas ainda não mudam nada no site. */
export const NaoAplicado: React.FC = () => (
  <Etiqueta tom="cinza" className="ml-1.5 align-middle" title="A opção fica salva, mas o site ainda não usa esse valor.">
    ainda sem efeito no site
  </Etiqueta>
);

/** Aviso quando a tabela configuracoes_site não existe. */
export const AvisoTabela: React.FC = () => {
  const { hasTableError } = useSiteConfig();
  if (!hasTableError) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        A tabela <code className="rounded bg-red-100 px-1">configuracoes_site</code> não foi encontrada, então as mudanças valem só até recarregar a página.
        Rode o script <code className="rounded bg-red-100 px-1">scripts/create_configuracoes_site_table.sql</code> no SQL Editor do Supabase.
      </p>
    </div>
  );
};

/** Envia uma imagem para o bucket lovable-uploads e devolve a URL pública. */
export const enviarImagem = async (arquivo: File, pasta: string) => {
  const ext = arquivo.name.split(".").pop() || "png";
  const caminho = `${pasta}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("lovable-uploads").upload(caminho, arquivo);
  if (error) throw error;
  return supabase.storage.from("lovable-uploads").getPublicUrl(caminho).data.publicUrl;
};

/** Campo de imagem com prévia: envia na hora e guarda a URL. */
export const CampoImagem: React.FC<{
  id: string;
  url: string;
  pasta: string;
  onChange: (url: string) => void;
  dica?: string;
  formato?: "quadrado" | "largo";
}> = ({ id, url, pasta, onChange, dica, formato = "quadrado" }) => {
  const [enviando, setEnviando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const escolher = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/") && !arquivo.name.endsWith(".ico")) {
      toast.error("Escolha um arquivo de imagem");
      return;
    }
    setEnviando(true);
    try {
      onChange(await enviarImagem(arquivo, pasta));
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Não foi possível enviar a imagem. " + ((error as Error)?.message || ""));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]",
          formato === "largo" ? "h-16 w-28" : "h-16 w-16"
        )}
      >
        {enviando ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : url ? (
          <img src={url} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <ImagePlus className="h-5 w-5 text-slate-400" />
        )}
      </div>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={enviando}>
            {url ? "Trocar" : "Enviar imagem"}
          </Button>
          {url && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="text-slate-500 hover:text-red-600" aria-label="Remover imagem">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {dica && <p className="text-[11px] text-slate-400">{dica}</p>}
      </div>
      <input id={id} ref={input} type="file" accept="image/*,.ico" onChange={escolher} className="hidden" />
    </div>
  );
};

/** Salva com tratamento de erro e devolve se deu certo. */
export const salvarCom = async (fn: () => Promise<unknown>, ok: string) => {
  try {
    await fn();
    toast.success(ok);
    return true;
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    toast.error("Não foi possível salvar. Tente de novo.");
    return false;
  }
};
