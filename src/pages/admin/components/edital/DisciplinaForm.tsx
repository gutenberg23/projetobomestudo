import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ClipboardPaste } from "lucide-react";
import { Disciplina } from "@/types/edital";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface DisciplinaFormProps {
  onAddDisciplina: (disciplina: Omit<Disciplina, 'id' | 'selecionada'>) => void;
  onEditDisciplina?: (disciplina: Disciplina) => void;
  disciplinaParaEditar?: Disciplina;
}

const DisciplinaForm: React.FC<DisciplinaFormProps> = ({
  onAddDisciplina,
  onEditDisciplina,
  disciplinaParaEditar
}) => {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [topicos, setTopicos] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [importancia, setImportancia] = useState<number[]>([]);
  const [novoTopico, setNovoTopico] = useState("");
  const [novoLink, setNovoLink] = useState("");
  const [isTopicoDialogOpen, setIsTopicoDialogOpen] = useState(false);
  const [topicosBulk, setTopicosBulk] = useState("");

  useEffect(() => {
    if (disciplinaParaEditar) {
      setTitulo(disciplinaParaEditar.titulo);
      setDescricao(disciplinaParaEditar.descricao);
      setTopicos(disciplinaParaEditar.topicos);
      setLinks(disciplinaParaEditar.links);
      setImportancia(disciplinaParaEditar.importancia);
    }
  }, [disciplinaParaEditar]);

  const handleAddTopico = () => {
    if (novoTopico.trim()) {
      setTopicos([...topicos, novoTopico.trim()]);
      setLinks([...links, novoLink.trim()]);
      setImportancia([...importancia, 50]);
      setNovoTopico("");
      setNovoLink("");
    }
  };

  const handleRemoveTopico = (index: number) => {
    setTopicos(topicos.filter((_, i) => i !== index));
    setLinks(links.filter((_, i) => i !== index));
    setImportancia(importancia.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const disciplinaData = {
      titulo,
      descricao,
      topicos,
      links,
      importancia
    };

    if (disciplinaParaEditar && onEditDisciplina) {
      onEditDisciplina({
        ...disciplinaParaEditar,
        ...disciplinaData
      });
      toast({
        title: "Sucesso",
        description: "Disciplina atualizada com sucesso!",
      });
    } else {
      onAddDisciplina(disciplinaData);
      toast({
        title: "Sucesso",
        description: "Disciplina adicionada com sucesso!",
      });
    }

    // Limpar o formulário apenas se não estiver editando
    if (!disciplinaParaEditar) {
      setTitulo("");
      setDescricao("");
      setTopicos([]);
      setLinks([]);
      setImportancia([]);
      setNovoTopico("");
      setNovoLink("");
    }
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
    <Card>
      <CardHeader>
        <CardTitle>
          {disciplinaParaEditar ? "Editar Disciplina" : "Adicionar Disciplina"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Órgão-Cargo</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Tópicos</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={novoTopico}
                onChange={(e) => setNovoTopico(e.target.value)}
                placeholder="Adicionar tópico"
              />
              <Input
                value={novoLink}
                onChange={(e) => setNovoLink(e.target.value)}
                placeholder="Link (opcional)"
              />
              <Button
                type="button"
                onClick={handleAddTopico}
                disabled={!novoTopico.trim()}
              >
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {topicos.map((topico, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                  <div className="flex-1">
                    <div>{topico}</div>
                    {links[index] && (
                      <div className="text-sm text-gray-500">
                        Link: {links[index]}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTopico(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            {disciplinaParaEditar ? "Salvar Modificações" : "Adicionar Disciplina"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DisciplinaForm;
