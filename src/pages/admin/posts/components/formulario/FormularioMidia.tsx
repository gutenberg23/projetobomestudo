import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, MapPin, X, ImagePlus, Loader2 } from "lucide-react";
import { useImageUpload } from "../../hooks/useImageUpload";
import { toast } from "@/components/ui/use-toast";
import { SugestaoImagemCidade } from "./SugestaoImagemCidade";
import { aplicarCreditoFoto, removerCreditoFoto, sugerirCidade } from "@/services/cityImageService";
import { CardLateral } from "./CardLateral";

interface FormularioMidiaProps {
  imagemDestaque: string;
  onChangeImagemDestaque: (value: string) => void;
  /** Usados para sugerir a cidade e colocar o crédito da foto no post */
  titulo?: string;
  estado?: string;
  conteudo?: string;
  onChangeConteudo?: (value: string) => void;
}

const ehStorage = (url: string) => url.includes("supabase") && url.includes("storage");

export const FormularioMidia: React.FC<FormularioMidiaProps> = ({
  imagemDestaque,
  onChangeImagemDestaque,
  titulo = "",
  estado,
  conteudo,
  onChangeConteudo,
}) => {
  const { isUploading, downloadAndUploadImage } = useImageUpload();
  const [processando, setProcessando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sugestaoAberta, setSugestaoAberta] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uf = estado && estado !== "none" ? estado : undefined;

  const enviarArquivo = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Escolha uma imagem (JPG, PNG ou WebP).", variant: "destructive" });
      return;
    }
    setEnviando(true);
    try {
      const filePath = `${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("blog-images").upload(filePath, file);
      if (error) throw error;
      onChangeImagemDestaque(supabase.storage.from("blog-images").getPublicUrl(filePath).data.publicUrl);
      // Foto própria não precisa do crédito do Wikimedia
      if (conteudo && onChangeConteudo) {
        const semCredito = removerCreditoFoto(conteudo);
        if (semCredito !== conteudo) onChangeConteudo(semCredito);
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast({
        title: "Erro no upload",
        description: 'Verifique se o bucket "blog-images" existe e tem permissão de upload.',
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  const processarUrl = async () => {
    if (!/^https?:\/\//i.test(imagemDestaque)) {
      toast({ title: "URL inválida", description: "Use um endereço começando com http:// ou https://", variant: "destructive" });
      return;
    }
    setProcessando(true);
    try {
      const nova = await downloadAndUploadImage(imagemDestaque);
      if (nova && nova !== imagemDestaque) {
        onChangeImagemDestaque(nova);
        toast({ title: "Imagem salva no site", description: "A imagem foi copiada para o armazenamento do Bom Estudo." });
      } else {
        toast({
          title: "Mantida a URL original",
          description: "O site de origem não permite copiar a imagem. Ela continuará sendo carregada de lá.",
        });
      }
    } finally {
      setProcessando(false);
    }
  };

  const ocupado = enviando || processando || isUploading;

  return (
    <CardLateral titulo="Imagem destaque" descricao="Aparece no topo do post, nos cards do blog e ao compartilhar.">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) enviarArquivo(file);
        }}
      />

      {imagemDestaque ? (
        <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <img
            src={imagemDestaque}
            alt="Imagem destaque"
            className="aspect-video w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <button
            type="button"
            title="Remover imagem"
            onClick={() => {
              onChangeImagemDestaque("");
              if (conteudo && onChangeConteudo) onChangeConteudo(removerCreditoFoto(conteudo));
            }}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-90 hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
          {ocupado && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-[#5f2ebe]" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            const file = e.dataTransfer.files?.[0];
            if (file) enviarArquivo(file);
          }}
          className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm transition ${
            arrastando ? "border-[#5f2ebe] bg-[#faf8ff] text-[#5f2ebe]" : "border-slate-200 text-slate-500 hover:border-[#5f2ebe]/50 hover:bg-slate-50"
          }`}
        >
          {enviando ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          {enviando ? "Enviando..." : "Clique ou arraste uma imagem"}
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={ocupado}>
          <Upload className="mr-1.5 h-4 w-4" />
          Enviar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSugestaoAberta(true)}
          className="border-[#5f2ebe]/30 text-[#5f2ebe] hover:bg-[#faf8ff] hover:text-[#5f2ebe]"
        >
          <MapPin className="mr-1.5 h-4 w-4" />
          Foto da cidade
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={imagemDestaque}
          onChange={(e) => onChangeImagemDestaque(e.target.value)}
          placeholder="ou cole a URL da imagem"
          className="h-9 text-xs"
        />
        {imagemDestaque && !ehStorage(imagemDestaque) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 px-2"
            title="Copiar a imagem para o armazenamento do site"
            onClick={processarUrl}
            disabled={ocupado}
          >
            {processando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <SugestaoImagemCidade
        aberto={sugestaoAberta}
        onFechar={() => setSugestaoAberta(false)}
        cidadeInicial={sugerirCidade(titulo, uf)}
        ufInicial={uf}
        onEscolher={(img) => {
          onChangeImagemDestaque(img.url);
          if (onChangeConteudo) onChangeConteudo(aplicarCreditoFoto(conteudo || "", img));
          setSugestaoAberta(false);
          toast({ title: "Foto escolhida", description: "O crédito do autor foi adicionado no fim do post." });
        }}
      />
    </CardLateral>
  );
};
