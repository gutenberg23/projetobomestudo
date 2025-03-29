import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ClipboardPaste } from "lucide-react";
import { Disciplina } from "./types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface DisciplinaFormProps {
  onAddDisciplina: (disciplina: Disciplina) => void;
}

const DisciplinaForm: React.FC<DisciplinaFormProps> = ({ onAddDisciplina }) => {
  const { toast } = useToast();
  const [disciplinaId, setDisciplinaId] = useState("");
  const [disciplinaTitulo, setDisciplinaTitulo] = useState("");
  const [disciplinaDescricao, setDisciplinaDescricao] = useState("");
  const [topicos, setTopicos] = useState<string[]>([""]);
  const [links, setLinks] = useState<string[]>([""]);
  const [isTopicoDialogOpen, setIsTopicoDialogOpen] = useState(false);
  const [topicosBulk, setTopicosBulk] = useState("");

  const adicionarTopico = () => {
    setTopicos([...topicos, ""]);
    setLinks([...links, ""]);
  };
  
  const atualizarTopico = (index: number, valor: string) => {
    const novosTopicos = [...topicos];
    novosTopicos[index] = valor;
    setTopicos(novosTopicos);
  };
  
  const atualizarLink = (index: number, valor: string) => {
    const novosLinks = [...links];
    novosLinks[index] = valor;
    setLinks(novosLinks);
  };
  
  const removerTopico = (index: number) => {
    if (topicos.length > 1) {
      const novosTopicos = [...topicos];
      const novosLinks = [...links];
      novosTopicos.splice(index, 1);
      novosLinks.splice(index, 1);
      setTopicos(novosTopicos);
      setLinks(novosLinks);
    }
  };
  
  const limparFormulario = () => {
    setDisciplinaId("");
    setDisciplinaTitulo("");
    setDisciplinaDescricao("");
    setTopicos([""]);
    setLinks([""]);
  };

  const adicionarDisciplina = () => {
    if (!disciplinaId || !disciplinaTitulo) {
      toast({
        title: "Erro",
        description: "ID e Disciplina são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Filtrar tópicos vazios e suas respectivas importâncias
    const topicosFiltrados: string[] = [];
    const linksFiltrados: string[] = [];
    
    topicos.forEach((topico, index) => {
      if (topico.trim() !== "") {
        topicosFiltrados.push(topico.trim());
        linksFiltrados.push(links[index]);
      }
    });
    
    const novaDisciplina: Disciplina = {
      id: disciplinaId || crypto.randomUUID?.() || Date.now().toString(),
      titulo: disciplinaTitulo,
      descricao: disciplinaDescricao,
      topicos: topicosFiltrados,
      links: linksFiltrados,
      importancia: Array(topicosFiltrados.length).fill(50), // Mantemos o campo importancia com valor padrão 50
      selecionada: false
    };
    
    onAddDisciplina(novaDisciplina);
    limparFormulario();
    
    toast({
      title: "Sucesso",
      description: "Disciplina adicionada com sucesso!",
    });
  };

  // Função para distribuir os tópicos do texto colado
  const distribuirTopicos = () => {
    if (!topicosBulk.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, cole algum texto com tópicos para distribuir.",
      });
      return;
    }

    try {
      // Remove quebras de linha extras e espaços desnecessários
      const textoLimpo = topicosBulk.trim();
      
      // Primeiro, vamos tentar dividir por números no início de cada linha
      // Exemplo: "1 Tópico", "2 Tópico", "4.1 Tópico", etc.
      const regexNumeros = /(\d+(?:\.\d+)*)\s+([^\d].*?)(?=\s+\d+(?:\.\d+)*\s+|$)/g;
      let match;
      const topicosEncontrados = [];
      
      // Cria uma cópia do texto para manipular
      let textoRestante = textoLimpo;
      
      // Procura por padrões como "1 Texto", "2.1 Texto", etc.
      while ((match = regexNumeros.exec(textoLimpo)) !== null) {
        if (match[0]) {
          topicosEncontrados.push(match[0].trim());
        }
      }
      
      // Se encontrou tópicos com o padrão de numeração
      if (topicosEncontrados.length > 0) {
        setTopicos(topicosEncontrados);
        setLinks(Array(topicosEncontrados.length).fill(""));
        
        toast({
          title: "Concluído",
          description: `${topicosEncontrados.length} tópicos foram distribuídos com sucesso.`,
        });
        
        setIsTopicoDialogOpen(false);
        return;
      }
      
      // Se não conseguiu com regex, tenta uma abordagem mais simples
      // Divide o texto nos pontos onde há um número no início
      const topicosSeparados = [];
      const linhas = textoLimpo.split(/\s+(?=\d+(?:\.\d+)*\s+)/);
      
      for (const linha of linhas) {
        if (linha.trim()) {
          topicosSeparados.push(linha.trim());
        }
      }
      
      if (topicosSeparados.length > 0) {
        setTopicos(topicosSeparados);
        setLinks(Array(topicosSeparados.length).fill(""));
        
        toast({
          title: "Concluído",
          description: `${topicosSeparados.length} tópicos foram distribuídos com sucesso.`,
        });
        
        setIsTopicoDialogOpen(false);
        return;
      }
      
      // Se ainda não conseguiu, tenta um método mais simples
      // Divide por espaços seguidos de números
      const partes = textoLimpo.split(/\s+(?=\d+)/);
      if (partes.length > 1) {
        const topicosFiltrados = partes.filter(parte => parte.trim());
        setTopicos(topicosFiltrados);
        setLinks(Array(topicosFiltrados.length).fill(""));
        
        toast({
          title: "Concluído",
          description: `${topicosFiltrados.length} tópicos foram distribuídos com sucesso.`,
        });
        
        setIsTopicoDialogOpen(false);
        return;
      }
      
      // Última tentativa: divide por quebras de linha
      const linhasPorQuebraDeLinha = textoLimpo.split(/\r?\n/).filter(linha => linha.trim() !== "");
      
      if (linhasPorQuebraDeLinha.length > 0) {
        setTopicos(linhasPorQuebraDeLinha);
        setLinks(Array(linhasPorQuebraDeLinha.length).fill(""));
        
        toast({
          title: "Concluído",
          description: `${linhasPorQuebraDeLinha.length} linhas foram distribuídas como tópicos.`,
        });
        
        setIsTopicoDialogOpen(false);
      } else {
        toast({
          title: "Atenção",
          description: "Não foi possível identificar tópicos no texto. Tente ajustar o formato.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao distribuir tópicos:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar os tópicos. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Disciplina</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="disciplina-id">ID</Label>
              <Input 
                id="disciplina-id" 
                value={disciplinaId} 
                onChange={(e) => setDisciplinaId(e.target.value)}
                placeholder="Digite o ID da disciplina"
              />
            </div>
            <div>
              <Label htmlFor="disciplina-titulo">Disciplina</Label>
              <Input 
                id="disciplina-titulo" 
                value={disciplinaTitulo} 
                onChange={(e) => setDisciplinaTitulo(e.target.value)}
                placeholder="Digite o nome da disciplina"
              />
            </div>
            <div>
              <Label htmlFor="disciplina-descricao">Descrição</Label>
              <Input 
                id="disciplina-descricao" 
                value={disciplinaDescricao} 
                onChange={(e) => setDisciplinaDescricao(e.target.value)}
                placeholder="Digite a descrição da disciplina"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between">
              <Label>Tópicos</Label>
              <Label>Links</Label>
            </div>
            {topicos.map((topico, index) => (
              <div key={index} className="flex items-center mt-2 gap-2">
                <Input 
                  value={topico} 
                  onChange={(e) => atualizarTopico(index, e.target.value)}
                  placeholder={`Tópico ${index + 1}`}
                  className="flex-1"
                />
                <Input 
                  value={links[index]} 
                  onChange={(e) => atualizarLink(index, e.target.value)}
                  placeholder="Link"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => removerTopico(index)}
                  title="Remover tópico"
                  disabled={topicos.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                {index === topicos.length - 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={adicionarTopico}
                    title="Adicionar novo tópico"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setIsTopicoDialogOpen(true)}
            className="gap-2"
          >
            <ClipboardPaste className="h-4 w-4" />
            Colar Tópicos
          </Button>
          <Button 
            onClick={adicionarDisciplina}
            className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 text-white"
          >
            Adicionar Disciplina
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog para colar múltiplos tópicos */}
      <Dialog open={isTopicoDialogOpen} onOpenChange={setIsTopicoDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Colar Tópicos</DialogTitle>
            <DialogDescription>
              Cole abaixo os tópicos do edital. O sistema tentará identificar automaticamente cada tópico.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea 
            value={topicosBulk}
            onChange={(e) => setTopicosBulk(e.target.value)}
            placeholder="Cole aqui os tópicos do edital, por exemplo:&#10;1. DIREITO PENAL: Código Penal - artigos 293 a 305...&#10;2. DIREITO PROCESSUAL PENAL: Código de Processo Penal..."
            className="min-h-[200px]"
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTopicoDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={distribuirTopicos}
              className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 text-white"
            >
              Distribuir Tópicos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DisciplinaForm;
