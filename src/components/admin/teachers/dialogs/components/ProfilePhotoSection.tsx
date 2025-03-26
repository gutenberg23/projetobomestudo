import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfilePhotoSectionProps {
  fotoPreview: string | null;
  handleFileSelect: (url: string) => void;
}

export const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  fotoPreview,
  handleFileSelect
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error("O arquivo deve ser uma imagem");
      return;
    }

    setIsUploading(true);

    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não está autenticado");
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `professor-photos/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('images')  // Usando o bucket 'images'
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Erro detalhado do upload:", JSON.stringify(uploadError, null, 2));
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      handleFileSelect(publicUrl);
      toast.success("Foto atualizada com sucesso");
    } catch (error) {
      console.error("Erro completo:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao fazer upload";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-2">
      <Label className="text-[#272f3c]">Foto de Perfil</Label>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-20 h-20 bg-[#f6f8fa] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#5f2ebe]/30">
          {fotoPreview ? (
            <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-[#5f2ebe]" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <Button 
              type="button"
              variant="outline" 
              className="w-full border-[#5f2ebe]/30 text-[#272f3c] hover:bg-[#5f2ebe]/10"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Carregando..." : "Selecionar foto"}
            </Button>
            <span className="text-xs text-[#67748a]">
              Formatos suportados: JPG, PNG. Tamanho máximo: 2MB
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
