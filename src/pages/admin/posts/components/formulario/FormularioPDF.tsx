import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Sparkles } from "lucide-react";
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      const url = await handleFileUpload(file);
      if (url) {
        setUploadedFileUrl(url);
        toast({
          title: "Sucesso",
          description: "PDF enviado com sucesso!",
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
    if (!uploadedFileUrl) {
      toast({
        title: "Nenhum PDF",
        description: "Por favor, faça upload de um PDF primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Chamar a função do Google Gemini através da Edge Function do Supabase
      const systemInstruction = `Você é um assistente de IA especialista em criar conteúdo para o blog 'Bom Estudo', focado em concursos públicos no Brasil. Sua tarefa é analisar EXCLUSIVAMENTE o conteúdo do PDF fornecido e gerar uma postagem de blog completa no formato JSON, seguindo estritamente o schema fornecido. O tom deve ser informativo, claro e encorajador para os concurseiros. Preencha todos os campos do JSON de forma completa e precisa com base APENAS nas informações presentes no PDF. NÃO invente informações.`;

      const blogPostSchema = {
        type: "object",
        properties: {
          titulo: { type: "string", description: "Título atraente e informativo para a postagem do blog, baseado nas informações do PDF." },
          resumo: { type: "string", description: "Resumo conciso da postagem, com no máximo 240 caracteres, baseado nas informações do PDF." },
          categoria: { type: "string", description: "Categoria principal da notícia (ex: 'Concursos'), baseado nas informações do PDF." },
          conteudo: { type: "string", description: "Conteúdo completo da postagem em formato HTML otimizado, baseado nas informações do PDF. Se for sobre um novo concurso, deve terminar com uma tabela HTML com 2 colunas. À esquerda os títulos: 'Website de Inscrição', 'Período de Inscrição', 'Data da Prova', 'Valor da Inscrição', 'Quantidade de Vagas' e 'Banca'." },
          regiao: { type: "string", description: "A região do Brasil do concurso, baseado nas informações do PDF. Escolha entre: 'norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul', 'federal', 'nacional'." },
          estado: { type: "string", description: "O estado brasileiro do concurso em siglas maiúsculas (ex: 'SP', 'BH', 'RJ'), baseado nas informações do PDF. Deixe como uma string vazia se a região for 'federal' ou 'nacional'." },
          tags: { type: "string", description: "Uma lista de 3 a 5 tags relevantes separadas por vírgula, baseado nas informações do PDF." },
          metaDescricao: { type: "string", description: "Uma meta descrição otimizada para SEO, resumindo o conteúdo em até 160 caracteres, baseado nas informações do PDF." },
          palavrasChave: { type: "string", description: "Uma lista de 3 a 5 palavras-chave relevantes para SEO, separadas por vírgula, baseado nas informações do PDF." },
        },
        required: ['titulo', 'resumo', 'categoria', 'conteudo', 'regiao', 'estado', 'tags', 'metaDescricao', 'palavrasChave']
      };

      const prompt = `
        Analise EXCLUSIVAMENTE o PDF anexado e crie uma postagem de blog completa seguindo exatamente o schema abaixo.
        O PDF contém informações sobre um concurso público ou notícia relevante para concursandos.
        
        INSTRUÇÕES CRÍTICAS:
        1. Analise APENAS o conteúdo do PDF fornecido na URL
        2. NÃO invente informações que não estejam claramente no PDF
        3. Se alguma informação não estiver clara ou ausente no PDF, deixe o campo vazio
        4. Baseie-se SOMENTE nas informações presentes no PDF
        5. Retorne APENAS um JSON válido com todos os campos preenchidos conforme o schema
        6. NÃO inclua texto adicional além do JSON solicitado
        7. Certifique-se de que o conteúdo seja extraído fielmente do PDF
        8. Foque especialmente no conteúdo principal do PDF, ignorando cabeçalhos, rodapés e informações secundárias
        9. Extraia as informações mais importantes como título, datas, vagas, salários, requisitos, etc.
        
        Schema JSON obrigatório:
        ${JSON.stringify(blogPostSchema, null, 2)}
        
        URL do PDF para análise: ${uploadedFileUrl}
      `;

      // Fazer a chamada à Edge Function do Supabase para o Google Gemini
      const { data, error } = await supabase.functions.invoke('generate-question-explanation', {
        body: { prompt: `${systemInstruction}\n\n${prompt}` }
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

      if (!data || !data.text) {
        console.error('Resposta inválida da API:', data);
        toast({
          title: "Erro",
          description: "Resposta inválida da API",
          variant: "destructive"
        });
        return;
      }

      // Parsear o JSON retornado
      try {
        // Remover possíveis caracteres de formatação
        const cleanResponse = data.text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        const extractedData = JSON.parse(cleanResponse);
        
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
      } catch (parseError) {
        console.error('Erro ao parsear JSON:', parseError);
        toast({
          title: "Erro",
          description: "Erro ao processar a resposta da IA. Tente novamente.",
          variant: "destructive"
        });
      }
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
                {isUploading ? "Enviando..." : "Selecionar PDF"}
              </Button>
            </div>
            
            <Button
              type="button"
              onClick={handleGerarNoticia}
              disabled={isProcessing || !uploadedFileUrl}
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
          <div className="text-sm text-gray-600">
            <p>Arquivo selecionado: <span className="font-medium">{uploadedFile.name}</span></p>
            {uploadedFileUrl && (
              <p className="mt-1">
                PDF armazenado:{" "}
                <a 
                  href={uploadedFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visualizar PDF
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};