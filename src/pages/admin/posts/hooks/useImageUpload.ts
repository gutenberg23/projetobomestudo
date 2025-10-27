import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const downloadAndUploadImage = async (imageUrl: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      // Verificar se a URL é válida
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.warn('URL de imagem inválida:', imageUrl);
        return imageUrl; // Retorna a URL original se for inválida
      }
      
      // Verificar se já é uma URL do Supabase (para evitar download/upload desnecessário)
      if (imageUrl.includes('supabase') && imageUrl.includes('storage')) {
        console.log('Imagem já está no Supabase, usando URL existente');
        return imageUrl;
      }
      
      console.log('Baixando imagem de:', imageUrl);
      
      // Baixar a imagem
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Falha ao baixar imagem: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${blob.type.split('/')[1] || 'jpg'}`;
      const filePath = `blog-images/${fileName}`;
      
      console.log('Fazendo upload para o Supabase:', filePath);
      
      // Fazer upload para o Supabase
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      // Obter a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);
      
      console.log('Upload concluído, URL pública:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    downloadAndUploadImage
  };
}