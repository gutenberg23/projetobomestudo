import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Upload } from "lucide-react";

interface FormularioMidiaProps {
  imagemDestaque: string;
  onChangeImagemDestaque: (value: string) => void;
}

export const FormularioMidia: React.FC<FormularioMidiaProps> = ({
  imagemDestaque,
  onChangeImagemDestaque
}) => {
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
          </div>
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
