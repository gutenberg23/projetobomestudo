import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { processarEditalPDF, processarLinks } from "@/services/openaiService";
import { usePostsState } from "../hooks/usePostsState";
import { Region } from "@/components/blog/types";

// Tipos de posts que podem ser criados com IA
const TIPOS_POST_IA = [
  { id: "edital", label: "Novo concurso com edital" },
  { id: "autorizado", label: "Concurso autorizado ou previsto" },
];

interface CriarPostIAProps {
  // Funções para preencher os campos do formulário de post - não serão usadas diretamente
  setTitulo: (value: string) => void;
  setResumo: (value: string) => void;
  setConteudo: (value: string) => void;
  setAutor: (value: string) => void;
  setCategoria: (value: string) => void;
  setTags: (value: string) => void;
  setMetaDescricao: (value: string) => void;
  setMetaKeywords: (value: string) => void;
  setTempoLeitura: (value: string) => void;
  setRegiao: (value: any) => void;
  setEstado: (value: string) => void;
  iniciarCriacaoPost: () => void;
}

export const CriarPostIA: React.FC<CriarPostIAProps> = ({
  // Mantemos as props por compatibilidade com o componente pai
}) => {
  const { toast } = useToast();
  const [tipoPost, setTipoPost] = useState<string>("");
  const [editalFile, setEditalFile] = useState<File | null>(null);
  const [promptText, setPromptText] = useState<string>("");
  const [links, setLinks] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Obter a função preencherFormulario do contexto global para definir todos os campos de uma vez
  const { preencherFormulario } = usePostsState();

  // Adicionar um novo campo de input para link
  const adicionarLink = () => {
    setLinks([...links, ""]);
  };

  // Atualizar um link específico
  const atualizarLink = (index: number, valor: string) => {
    const novosLinks = [...links];
    novosLinks[index] = valor;
    setLinks(novosLinks);
  };

  // Remover um link específico
  const removerLink = (index: number) => {
    if (links.length > 1) {
      const novosLinks = [...links];
      novosLinks.splice(index, 1);
      setLinks(novosLinks);
    }
  };

  // Manipular o upload de arquivo de edital
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditalFile(e.target.files[0]);
    }
  };

  // Processar a criação do post com IA
  const processarPostComIA = async () => {
    if (!tipoPost) {
      toast({
        title: "Erro",
        description: "Selecione um tipo de post",
        variant: "destructive",
      });
      return;
    }

    if (tipoPost === "edital" && !editalFile) {
      toast({
        title: "Erro",
        description: "Faça o upload do edital",
        variant: "destructive",
      });
      return;
    }

    if (tipoPost === "autorizado" && (!links[0] || links[0].trim() === "")) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um link de referência",
        variant: "destructive",
      });
      return;
    }

    if (!promptText || promptText.trim() === "") {
      toast({
        title: "Erro",
        description: "Adicione um prompt para a IA",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Iniciando processamento com IA...");

    try {
      let resultado;

      // Processar baseado no tipo de post
      if (tipoPost === "edital" && editalFile) {
        // Processar edital PDF com a OpenAI
        toast({
          title: "Processando",
          description: "Enviando edital para processamento com IA...",
        });
        
        console.log("Processando edital:", editalFile.name);
        resultado = await processarEditalPDF(editalFile, promptText);
      } else if (tipoPost === "autorizado") {
        // Processar links de notícias com a OpenAI
        toast({
          title: "Processando",
          description: "Analisando links e gerando conteúdo com IA...",
        });
        
        // Filtrar links vazios
        const linksValidos = links.filter(link => link.trim() !== "");
        console.log("Processando links:", linksValidos);
        resultado = await processarLinks(linksValidos, promptText);
      }

      console.log("Resultado recebido:", resultado);

      if (!resultado || !resultado.success) {
        throw new Error(resultado?.error || "Erro ao processar dados com a IA");
      }

      const dadosGerados = resultado.data;
      console.log("Dados gerados para preencher o formulário:", dadosGerados);
      
      // Preparar região
      let regiaoProcessada: Region | "none" = "none";
      if (dadosGerados.regiao) {
        const regiaoLowerCase = dadosGerados.regiao.toLowerCase();
        if (
          regiaoLowerCase === "norte" || 
          regiaoLowerCase === "nordeste" || 
          regiaoLowerCase === "sul" || 
          regiaoLowerCase === "sudeste" || 
          regiaoLowerCase === "centro-oeste"
        ) {
          regiaoProcessada = regiaoLowerCase as Region;
        }
      }
      
      // Utilizar a função que define todos os campos de uma vez e muda para o modo de criação
      console.log("Chamando preencherFormulario com os dados processados");
      preencherFormulario({
        titulo: dadosGerados.titulo || "",
        resumo: dadosGerados.resumo || "",
        conteudo: dadosGerados.conteudo || "",
        autor: "Sistema IA", // Autor padrão
        categoria: "Concursos", // Categoria padrão
        tags: dadosGerados.tags || "",
        metaDescricao: dadosGerados.metaDescricao || "",
        metaKeywords: dadosGerados.metaKeywords || "",
        tempoLeitura: dadosGerados.tempoLeitura || "5 min",
        regiao: regiaoProcessada,
        estado: dadosGerados.estado || ""
      });
      
      toast({
        title: "Sucesso",
        description: "Dados gerados com sucesso! Verificando o formulário de criação.",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Erro ao processar com IA:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Ocorreu um erro ao processar os dados com IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-[#272f3c]">
          <Sparkles className="mr-2 h-5 w-5 text-[#ea2be2]" />
          Criar Post com IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tipo-post">Tipo de Post</Label>
            <Select value={tipoPost} onValueChange={setTipoPost}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo de post" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_POST_IA.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tipoPost === "edital" && (
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-gray-50">
                <Label htmlFor="edital-upload" className="block mb-2">
                  Upload do Edital (PDF)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edital-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditalFile(null)}
                    disabled={!editalFile}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {editalFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Arquivo selecionado: {editalFile.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="prompt-edital" className="block mb-2">
                  Prompt para a IA
                </Label>
                <Textarea
                  id="prompt-edital"
                  placeholder="Descreva o que a IA deve extrair do edital. Ex: Extraia informações sobre vagas, salários e datas importantes."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          {tipoPost === "autorizado" && (
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-gray-50">
                <Label className="block mb-2">Links de Referência</Label>
                {links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/noticia"
                      value={link}
                      onChange={(e) => atualizarLink(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removerLink(index)}
                      disabled={links.length === 1 && index === 0}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={adicionarLink}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Link
                </Button>
              </div>

              <div>
                <Label htmlFor="prompt-links" className="block mb-2">
                  Prompt para a IA
                </Label>
                <Textarea
                  id="prompt-links"
                  placeholder="Descreva o que a IA deve extrair dos links. Ex: Extraia informações sobre o concurso, órgão, vagas previstas e previsão de edital."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          {tipoPost && (
            <Button
              className="w-full bg-[#ea2be2] hover:bg-[#d029d5]"
              onClick={processarPostComIA}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Criar post com IA
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 