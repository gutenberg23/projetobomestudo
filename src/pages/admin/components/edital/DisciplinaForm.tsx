
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

  const adicionarTopico = () => {
    setTopicos([...topicos, ""]);
  };
  
  const atualizarTopico = (index: number, valor: string) => {
    const novosTopicos = [...topicos];
    novosTopicos[index] = valor;
    setTopicos(novosTopicos);
  };
  
  const removerTopico = (index: number) => {
    if (topicos.length > 1) {
      const novosTopicos = [...topicos];
      novosTopicos.splice(index, 1);
      setTopicos(novosTopicos);
    }
  };
  
  const limparFormulario = () => {
    setDisciplinaId("");
    setDisciplinaTitulo("");
    setDisciplinaDescricao("");
    setTopicos([""]);
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
    
    // Filtrar tópicos vazios
    const topicosFiltrados = topicos.filter(t => t.trim() !== "");
    
    const novaDisciplina: Disciplina = {
      id: disciplinaId,
      titulo: disciplinaTitulo,
      descricao: disciplinaDescricao,
      topicos: topicosFiltrados,
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
          <Label>Tópicos</Label>
          {topicos.map((topico, index) => (
            <div key={index} className="flex items-center mt-2 gap-2">
              <Input 
                value={topico} 
                onChange={(e) => atualizarTopico(index, e.target.value)}
                placeholder={`Tópico ${index + 1}`}
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
