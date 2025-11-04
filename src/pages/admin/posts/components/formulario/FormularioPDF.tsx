import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Sparkles, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { BlogPost, Region } from "@/components/blog/types";

interface FormularioPDFProps {
  onPreencherCampos: (dados: Partial<BlogPost>) => void;
}

export const FormularioPDF: React.FC<FormularioPDFProps> = ({
  onPreencherCampos
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Configuração do Supabase não encontrada. Por favor, configure o arquivo .env com suas credenciais.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `pdf-${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `blog-pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-pdfs')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        toast({
          title: "Erro",
          description: "Erro ao fazer upload do PDF. Verifique se o bucket 'blog-pdfs' existe e se as permissões estão configuradas corretamente.",
          variant: "destructive"
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-pdfs')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao fazer upload do PDF',
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const convertPDFToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setIsUploading(true);
      
      // Fazer upload permanente
      const url = await handleFileUpload(file);
      setIsUploading(false);
      
      if (url) {
        setUploadedFileUrl(url);
        toast({
          title: "Sucesso",
          description: "PDF carregado com sucesso! Clique em 'Gerar Notícia' para criar o conteúdo.",
          variant: "default"
        });
      }
    } else if (file) {
      toast({
        title: "Tipo inválido",
        description: "Por favor, selecione um arquivo PDF.",
        variant: "destructive"
      });
    }
  };

  const handleGerarNoticia = async () => {
    if (!uploadedFile) {
      toast({
        title: "Nenhum PDF",
        description: "Por favor, faça upload de um PDF primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      toast({
        title: "Processando",
        description: "Enviando PDF para o Google Gemini...",
        variant: "default"
      });

      // Converter PDF para base64
      const pdfBase64 = await convertPDFToBase64(uploadedFile);

      // Chamar a edge function que envia o PDF diretamente ao Gemini
      const { data, error } = await supabase.functions.invoke('generate-blog-from-pdf', {
        body: { 
          pdfBase64,
          mimeType: uploadedFile.type
        }
      });

      if (error) {
        console.error('Erro ao chamar Edge Function:', error);
        toast({
          title: "Erro",
          description: `Erro ao chamar IA: ${error.message || 'Erro ao gerar resposta da IA'}`,
          variant: "destructive"
        });
        return;
      }

      if (!data || !data.data) {
        console.error('Resposta inválida da API:', data);
        toast({
          title: "Erro",
          description: "Resposta inválida da API",
          variant: "destructive"
        });
        return;
      }

      const extractedData = data.data;
      
      // Converter os dados para o formato esperado pelo formulário
      const dadosConvertidos: Partial<BlogPost> = {
        title: extractedData.titulo || '',
        summary: extractedData.resumo || '',
        category: extractedData.categoria || '',
        content: extractedData.conteudo || '',
        region: (extractedData.regiao as Region) || 'nacional',
        state: extractedData.estado || '',
        tags: Array.isArray(extractedData.tags) ? extractedData.tags : 
              typeof extractedData.tags === 'string' ? extractedData.tags.split(',').map((tag: string) => tag.trim()) : [],
        metaDescription: extractedData.metaDescricao || '',
        metaKeywords: Array.isArray(extractedData.palavrasChave) ? extractedData.palavrasChave : 
                     typeof extractedData.palavrasChave === 'string' ? extractedData.palavrasChave.split(',').map((kw: string) => kw.trim()) : []
      };
      
      // Preencher os campos do formulário
      onPreencherCampos(dadosConvertidos);
      
      toast({
        title: "Sucesso",
        description: "Notícia gerada com sucesso! Os campos foram preenchidos automaticamente.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao gerar notícia:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao gerar notícia',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Gerar Notícia via PDF</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdfUpload">Upload de PDF</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('pdf-upload')?.click()}
                disabled={isUploading}
                className="w-full justify-start"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Processando..." : "Selecionar PDF"}
              </Button>
            </div>
            
            <Button
              type="button"
              onClick={handleGerarNoticia}
              disabled={isProcessing || !uploadedFile}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isProcessing ? "Gerando..." : "Gerar Notícia"}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Faça upload de um PDF com informações sobre concursos públicos para gerar automaticamente uma notícia.
          </p>
        </div>
        
        {uploadedFile && (
          <div className="text-sm text-gray-600 space-y-2">
            <div className="p-3 bg-green-50 rounded-md border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <FileText className="h-4 w-4" />
                <span className="font-medium">PDF carregado: {uploadedFile.name}</span>
              </div>
              {uploadedFileUrl && (
                <a 
                  href={uploadedFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                >
                  Visualizar PDF
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};