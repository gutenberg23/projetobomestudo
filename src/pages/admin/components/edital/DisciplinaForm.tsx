import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, ClipboardPaste } from "lucide-react";
import { Disciplina } from "@/types/edital";
import { useToast } from "@/hooks/use-toast";
import { ColarTopicosModal } from "./ColarTopicosModal";

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
  const [novoTopico, setNovoTopico] = useState("");
  const [novoLink, setNovoLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (disciplinaParaEditar) {
      setTitulo(disciplinaParaEditar.titulo);
      setDescricao(disciplinaParaEditar.descricao);
      setTopicos(disciplinaParaEditar.topicos);
      setLinks(disciplinaParaEditar.links);
    }
  }, [disciplinaParaEditar]);

  const handleAddTopico = () => {
    if (novoTopico.trim()) {
      setTopicos([...topicos, novoTopico.trim()]);
      setLinks([...links, novoLink.trim()]);
      setNovoTopico("");
      setNovoLink("");
    }
  };

  const handleRemoveTopico = (index: number) => {
    setTopicos(topicos.filter((_, i) => i !== index));
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleEditTopico = (index: number, novoTopico: string) => {
    const novosTopicos = [...topicos];
    novosTopicos[index] = novoTopico;
    setTopicos(novosTopicos);
  };

  const handleEditLink = (index: number, novoLink: string) => {
    const novosLinks = [...links];
    novosLinks[index] = novoLink;
    setLinks(novosLinks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      toast({
        title: "Atenção",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (topicos.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos um tópico.",
        variant: "destructive"
      });
      return;
    }

    if (topicos.some(t => !t.trim())) {
      toast({
        title: "Atenção",
        description: "Todos os tópicos devem ser preenchidos.",
        variant: "destructive"
      });
      return;
    }

    const disciplina = {
      titulo,
      descricao,
      topicos: topicos.map(t => t.trim()),
      links: links.map(l => l.trim()),
      importancia: topicos.map(() => 0) // Mantém o array de importância vazio
    };

    if (disciplinaParaEditar) {
      console.log('📝 Editando disciplina:', {
        ...disciplina,
        id: disciplinaParaEditar.id,
        selecionada: disciplinaParaEditar.selecionada
      });
      onEditDisciplina?.({
        ...disciplina,
        id: disciplinaParaEditar.id,
        selecionada: disciplinaParaEditar.selecionada
      });
    } else {
      console.log('➕ Adicionando nova disciplina:', disciplina);
      onAddDisciplina(disciplina);
    }

    // Limpar formulário
    setTitulo("");
    setDescricao("");
    setTopicos([]);
    setLinks([]);
  };

  const handleDistribuirTopicos = (novosTopicos: string[]) => {
    setTopicos(novosTopicos);
    setLinks(Array(novosTopicos.length).fill(""));
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
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título da disciplina"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite a descrição da disciplina"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Tópicos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <ClipboardPaste className="h-4 w-4" />
                Colar Tópicos
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={novoTopico}
                onChange={(e) => setNovoTopico(e.target.value)}
                placeholder="Digite um tópico"
                className="flex-1"
              />
              <Input
                value={novoLink}
                onChange={(e) => setNovoLink(e.target.value)}
                placeholder="Link (opcional)"
                className="w-48"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTopico}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {topicos.length > 0 && (
              <div className="mt-4 space-y-2">
                {topicos.map((topico, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <Input
                      value={topico}
                      onChange={(e) => handleEditTopico(index, e.target.value)}
                      placeholder="Nome do tópico"
                      className="flex-1"
                    />
                    <Input
                      value={links[index] || ""}
                      onChange={(e) => handleEditLink(index, e.target.value)}
                      placeholder="Link (opcional)"
                      className="w-48"
                    />
                    {links[index] && (
                      <a
                        href={links[index]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm px-2"
                      >
                        Abrir
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTopico(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit}>
          {disciplinaParaEditar ? "Salvar Alterações" : "Adicionar Disciplina"}
        </Button>
      </CardFooter>

      <ColarTopicosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDistribuirTopicos={handleDistribuirTopicos}
      />
    </Card>
  );
};

export default DisciplinaForm;
