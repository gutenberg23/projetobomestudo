import React, { useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FotoProfessorProps {
  url: string;
  onChange: (url: string) => void;
}

/** Foto de perfil do professor, enviada para o bucket "images". */
export const FotoProfessor: React.FC<FotoProfessorProps> = ({ url, onChange }) => {
  const [enviando, setEnviando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const escolher = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem");
      return;
    }
    if (arquivo.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2 MB");
      return;
    }
    setEnviando(true);
    try {
      const ext = arquivo.name.split(".").pop() || "jpg";
      const caminho = `professor-photos/${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("images").upload(caminho, arquivo, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      onChange(supabase.storage.from("images").getPublicUrl(caminho).data.publicUrl);
    } catch (error) {
      console.error("Erro no upload da foto:", error);
      toast.error("Não foi possível enviar a foto. " + ((error as Error)?.message || ""));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#5f2ebe]/10 ring-1 ring-[#5f2ebe]/20">
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-[#5f2ebe]" />}
      </div>
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={enviando}>
            <Upload className="mr-1.5 h-4 w-4" />
            {enviando ? "Enviando..." : url ? "Trocar foto" : "Enviar foto"}
          </Button>
          {url && !enviando && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="text-slate-500 hover:text-red-600">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
        <p className="text-[11px] text-slate-400">JPG ou PNG, até 2 MB. Aparece nas teorias e tópicos do professor.</p>
      </div>
      <input ref={input} type="file" accept="image/*" onChange={escolher} className="hidden" />
    </div>
  );
};
