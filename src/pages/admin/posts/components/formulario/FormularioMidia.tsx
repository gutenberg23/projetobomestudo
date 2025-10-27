import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download } from "lucide-react";
import { useImageUpload } from "../../hooks/useImageUpload";
import { toast } from "@/components/ui/use-toast";

interface FormularioMidiaProps {
  imagemDestaque: string;
  onChangeImagemDestaque: (value: string) => void;
}

export const FormularioMidia: React.FC<FormularioMidiaProps> = ({
  imagemDestaque,
  onChangeImagemDestaque
}) => {
  const { isUploading, downloadAndUploadImage } = useImageUpload();
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Configuração do Supabase não encontrada. Por favor, configure o arquivo .env com suas credenciais.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        alert('Erro ao fazer upload da imagem. Verifique se o bucket "blog-images" existe e se as permissões estão configuradas corretamente.');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload da imagem');
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await handleImageUpload(file);
      if (url) {
        onChangeImagemDestaque(url);
      }
    }
  };

  const handleProcessImageUrl = async () => {
    if (!imagemDestaque) {
      toast({
        title: "URL vazia",
        description: "Por favor, insira uma URL de imagem antes de processar.",
        variant: "destructive"
      });
      return;
    }

    if (!imagemDestaque.startsWith('http')) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida começando com http:// ou https://",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já é uma URL do Supabase
    if (imagemDestaque.includes('supabase') && imagemDestaque.includes('storage')) {
      toast({
        title: "Imagem já processada",
        description: "Esta imagem já está armazenada no Supabase.",
        variant: "default"
      });
      return;
    }

    setIsProcessingUrl(true);
    try {
      const processedUrl = await downloadAndUploadImage(imagemDestaque);
      if (processedUrl) {
        onChangeImagemDestaque(processedUrl);
        toast({
          title: "Imagem processada",
          description: "A imagem foi baixada e salva no Supabase com sucesso.",
          variant: "default"
        });
      } else {
        toast({
          title: "Erro ao processar",
          description: "Não foi possível processar a imagem. Verifique a URL e tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingUrl(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Mídia</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imagemDestaque">Imagem Destaque</Label>
          <div className="flex gap-2">
            <Input 
              id="imagemDestaque" 
              value={imagemDestaque} 
              onChange={(e) => onChangeImagemDestaque(e.target.value)} 
              placeholder="URL da imagem destaque do post"
              className="flex-1"
            />
            <div className="flex gap-2">
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="upload-imagem"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('upload-imagem')?.click()}
                  className="h-10"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleProcessImageUrl}
                disabled={isProcessingUrl || isUploading || !imagemDestaque}
                className="h-10"
              >
                <Download className="h-4 w-4 mr-2" />
                {isProcessingUrl ? "Processando..." : "Processar URL"}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Insira uma URL de imagem ou faça upload. Clique em "Processar URL" para baixar e salvar a imagem no Supabase.
          </p>
        </div>
        
        {imagemDestaque && (
          <div className="border rounded-md overflow-hidden h-40 w-full md:w-1/2 bg-gray-100">
            <img 
              src={imagemDestaque} 
              alt="Imagem Destaque" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};