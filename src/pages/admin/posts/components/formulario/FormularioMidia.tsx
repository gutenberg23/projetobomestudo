import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FormularioMidiaProps {
  imagemDestaque: string;
  onChangeImagemDestaque: (value: string) => void;
}

export const FormularioMidia: React.FC<FormularioMidiaProps> = ({
  imagemDestaque,
  onChangeImagemDestaque
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(imagemDestaque);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      onChangeImagemDestaque(publicUrl);
      setPreviewUrl(publicUrl);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Mídia</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imagemDestaque">Imagem Destaque</Label>
          <div className="flex flex-col gap-4">
            {previewUrl && (
              <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => document.getElementById('imageUpload')?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {previewUrl ? 'Trocar Imagem' : 'Selecionar Imagem'}
                  </>
                )}
              </Button>
              {previewUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onChangeImagemDestaque('');
                    setPreviewUrl('');
                  }}
                >
                  Remover
                </Button>
              )}
            </div>
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
