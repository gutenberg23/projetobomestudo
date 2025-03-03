
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { Disciplina } from "./types";
import { useToast } from "@/hooks/use-toast";

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

  return (
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
      <CardFooter>
        <Button 
          onClick={adicionarDisciplina}
          className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white"
        >
          Adicionar Disciplina
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DisciplinaForm;
