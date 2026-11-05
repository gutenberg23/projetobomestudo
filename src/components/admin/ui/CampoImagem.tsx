import React, { useRef, useState } from "react";
import { ImageIcon, Link2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface CampoImagemProps {
  url: string;
  onChange: (url: string) => void;
  /** Pasta dentro do bucket "images" */
  pasta: string;
  dica?: React.ReactNode;
  /** Proporção da área de prévia (classe aspect-*) */
  proporcao?: string;
  id?: string;
}

/** Imagem por envio de arquivo (bucket "images") ou por endereço colado. */
export const CampoImagem: React.FC<CampoImagemProps> = ({ url, onChange, pasta, dica, proporcao = "aspect-[8/1]", id }) => {
  const [enviando, setEnviando] = useState(false);
  const [porLink, setPorLink] = useState(false);
  const [quebrada, setQuebrada] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const escolher = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem");
      return;
    }
    if (arquivo.size > 3 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 3 MB");
      return;
    }
    setEnviando(true);
    try {
      const ext = (arquivo.name.split(".").pop() || "jpg").toLowerCase();
      const caminho = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("images").upload(caminho, arquivo, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      setQuebrada(false);
      onChange(supabase.storage.from("images").getPublicUrl(caminho).data.publicUrl);
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      toast.error("Não foi possível enviar a imagem. Cole o endereço dela em \"Usar link\". " + ((error as Error)?.message || ""));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-lg border bg-slate-50",
          url && !quebrada ? "border-slate-200" : "border-dashed border-slate-300",
          url ? "min-h-[72px]" : proporcao
        )}
      >
        {url && !quebrada ? (
          <img src={url} alt="Prévia" className="max-h-64 w-full object-contain" onError={() => setQuebrada(true)} />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={enviando}
            className="flex h-full min-h-[72px] w-full flex-col items-center justify-center gap-1 py-4 text-xs text-slate-500 hover:bg-slate-100"
          >
            <ImageIcon className="h-5 w-5 text-slate-400" />
            {quebrada ? "Não foi possível abrir essa imagem. Envie outra ou confira o link." : enviando ? "Enviando..." : "Clique para enviar uma imagem"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={enviando}>
          <Upload className="mr-1.5 h-4 w-4" />
          {enviando ? "Enviando..." : url ? "Trocar imagem" : "Enviar imagem"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setPorLink((v) => !v)} className="text-slate-600">
          <Link2 className="mr-1.5 h-4 w-4" />
          Usar link
        </Button>
        {url && !enviando && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("");
              setQuebrada(false);
            }}
            className="text-slate-500 hover:text-red-600"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Remover
          </Button>
        )}
      </div>
      {porLink && (
        <Input
          id={id}
          type="url"
          value={url}
          onChange={(e) => {
            setQuebrada(false);
            onChange(e.target.value.trim());
          }}
          placeholder="https://exemplo.com/imagem.jpg"
          className="h-9"
        />
      )}
      {dica && <p className="text-[11px] text-slate-400">{dica}</p>}
      <input ref={input} type="file" accept="image/*" onChange={escolher} className="hidden" />
    </div>
  );
};
