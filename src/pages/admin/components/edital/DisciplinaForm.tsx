
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
  const [importancias, setImportancias] = useState<number[]>([50]); // Valor padrão 50
  const [isTopicoDialogOpen, setIsTopicoDialogOpen] = useState(false);
  const [topicosBulk, setTopicosBulk] = useState("");

  const adicionarTopico = () => {
    setTopicos([...topicos, ""]);
    setImportancias([...importancias, 50]); // Adiciona valor padrão de importância
  };
  
  const atualizarTopico = (index: number, valor: string) => {
    const novosTopicos = [...topicos];
    novosTopicos[index] = valor;
    setTopicos(novosTopicos);
  };
  
  const atualizarImportancia = (index: number, valor: string) => {
    // Converter valor para número e garantir que esteja entre 1 e 100
    let numeroValor = parseInt(valor, 10);
    
    if (isNaN(numeroValor)) {
      numeroValor = 1;
    } else if (numeroValor < 1) {
      numeroValor = 1;
    } else if (numeroValor > 100) {
      numeroValor = 100;
    }
    
    const novasImportancias = [...importancias];
    novasImportancias[index] = numeroValor;
    setImportancias(novasImportancias);
  };
  
  const removerTopico = (index: number) => {
    if (topicos.length > 1) {
      const novosTopicos = [...topicos];
      const novasImportancias = [...importancias];
      novosTopicos.splice(index, 1);
      novasImportancias.splice(index, 1);
      setTopicos(novosTopicos);
      setImportancias(novasImportancias);
    }
  };
  
  const limparFormulario = () => {
    setDisciplinaId("");
    setDisciplinaTitulo("");
    setDisciplinaDescricao("");
    setTopicos([""]);
    setImportancias([50]); // Resetar para o valor padrão
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
    const importanciasFiltradas: number[] = [];
    
    topicos.forEach((topico, index) => {
      if (topico.trim() !== "") {
        topicosFiltrados.push(topico);
        importanciasFiltradas.push(importancias[index]);
      }
    });
    
    const novaDisciplina: Disciplina = {
      id: disciplinaId,
      titulo: disciplinaTitulo,
      descricao: disciplinaDescricao,
      topicos: topicosFiltrados,
      importancia: importanciasFiltradas,
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

    // Remove quebras de linha extras e espaços desnecessários
    const textoLimpo = topicosBulk.trim();
    
    // Tenta identificar os tópicos numerados
    // Busca por padrões como "1. TÓPICO", "2. TÓPICO", etc.
    const regex = /(\d+\.\s*[^.0-9]+?)(?=\s*\d+\.\s*|$)/g;
    const matches = textoLimpo.match(regex);
    
    if (matches && matches.length > 0) {
      // Limpa os tópicos encontrados
      const topicosTratados = matches.map(topico => topico.trim());
      
      // Atualiza os tópicos e suas importâncias
      setTopicos(topicosTratados);
      setImportancias(Array(topicosTratados.length).fill(50));
      
      toast({
        title: "Concluído",
        description: `${topicosTratados.length} tópicos foram distribuídos com sucesso.`,
      });
      
      // Fecha o diálogo
      setIsTopicoDialogOpen(false);
    } else {
      // Se não conseguir identificar automaticamente, divide por quebras de linha
      const linhas = textoLimpo.split(/\r?\n/).filter(linha => linha.trim() !== "");
      
      if (linhas.length > 0) {
        setTopicos(linhas);
        setImportancias(Array(linhas.length).fill(50));
        
        toast({
          title: "Concluído",
          description: `${linhas.length} linhas foram distribuídas como tópicos.`,
        });
        
        setIsTopicoDialogOpen(false);
      } else {
        toast({
          title: "Atenção",
          description: "Não foi possível identificar tópicos no texto. Tente ajustar o formato.",
          variant: "destructive"
        });
      }
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
              <Label>Importância (1-100)</Label>
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
                  type="number" 
                  min="1" 
                  max="100" 
                  value={importancias[index]} 
                  onChange={(e) => atualizarImportancia(index, e.target.value)}
                  className="w-24"
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
