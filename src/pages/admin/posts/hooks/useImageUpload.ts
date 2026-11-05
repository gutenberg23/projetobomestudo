import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const downloadAndUploadImage = async (imageUrl: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      // Verificar se a URL é válida
      if (!imageUrl || !imageUrl.startsWith('http')) {
        return imageUrl; // Retorna a URL original se for inválida
      }
      
      // Verificar se já é uma URL do Supabase (para evitar download/upload desnecessário)
      if (imageUrl.includes('supabase') && imageUrl.includes('storage')) {
        return imageUrl;
      }
      
      
      // Tentar baixar a imagem com tratamento de CORS
      let response: Response;
      try {
        // Primeira tentativa: fetch direto
        response = await fetch(imageUrl);
      } catch (fetchError) {
        // Segunda tentativa: usar proxy CORS do Next.js
        try {
          response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
        } catch (proxyError) {
          console.error('Falha ao usar proxy:', proxyError);
          // Se ambos falharem, retornar a URL original
          return imageUrl;
        }
      }
      
      // Se ainda tivermos problemas de CORS, tentar novamente com o proxy
      if (!response.ok && response.status === 0) {
        try {
          response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
        } catch (proxyError) {
          console.error('Falha ao usar proxy:', proxyError);
          // Se o proxy falhar, retornar a URL original
          return imageUrl;
        }
      }
      
      if (!response.ok) {
        throw new Error(`Falha ao baixar imagem: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${blob.type.split('/')[1] || 'jpg'}`;
      const filePath = `blog-images/${fileName}`;
      
      
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
      
      return publicUrl;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      // Em caso de erro, retornar a URL original em vez de null
      return imageUrl;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    downloadAndUploadImage
  };
}