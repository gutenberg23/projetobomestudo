
import React, { useState, useEffect } from "react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { supabase } from "@/integrations/supabase/client";
import { Topico } from "../types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TopicosFieldProps {
  disciplina: string;
  topicos: string[];
  setTopicos: (topicos: string[]) => void;
}

const TopicosField: React.FC<TopicosFieldProps> = ({
  disciplina,
  topicos,
  setTopicos
}) => {
  const { user } = useAuth();
  const [topicosList, setTopicosList] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTopico, setCurrentTopico] = useState<Topico | null>(null);
  const [newTopicoNome, setNewTopicoNome] = useState("");

  // Carregar os tópicos quando a disciplina mudar
  useEffect(() => {
    const fetchTopicos = async () => {
      if (!disciplina) {
        setTopicosList([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('topicos')
          .select('*')
          .eq('disciplina', disciplina);

        if (error) {
          throw error;
        }

        setTopicosList(data || []);
      } catch (error) {
        console.error("Erro ao buscar tópicos:", error);
        toast.error("Erro ao carregar tópicos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicos();
  }, [disciplina]);

  const handleTopicosChange = (topico: string) => {
    if (topicos.includes(topico)) {
      setTopicos(topicos.filter(t => t !== topico));
    } else {
      setTopicos([...topicos, topico]);
    }
  };

  const handleAddTopico = async () => {
    if (!newTopicoNome.trim()) {
      toast.error("O nome do tópico não pode estar vazio");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para adicionar tópicos");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('topicos')
        .insert([{ 
          nome: newTopicoNome, 
          disciplina,
          user_id: user.id
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setTopicosList([...topicosList, data[0]]);
        toast.success("Tópico adicionado com sucesso!");
        setNewTopicoNome("");
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      toast.error("Erro ao adicionar tópico. Tente novamente.");
    }
  };

  const handleEditTopico = async () => {
    if (!currentTopico || !newTopicoNome.trim()) {
      toast.error("O nome do tópico não pode estar vazio");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para editar tópicos");
      return;
    }

    try {
      const { error } = await supabase
        .from('topicos')
        .update({ 
          nome: newTopicoNome,
          user_id: user.id
        })
        .eq('id', currentTopico.id);

      if (error) {
        throw error;
      }

      setTopicosList(topicosList.map(t => 
        t.id === currentTopico.id ? { ...t, nome: newTopicoNome } : t
      ));
      
      // Atualizar também no array de tópicos selecionados
      if (topicos.includes(currentTopico.nome)) {
        const newTopicos = topicos.filter(t => t !== currentTopico.nome);
        newTopicos.push(newTopicoNome);
        setTopicos(newTopicos);
      }

      toast.success("Tópico atualizado com sucesso!");
      setNewTopicoNome("");
      setCurrentTopico(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erro ao editar tópico:", error);
      toast.error("Erro ao editar tópico. Tente novamente.");
    }
  };

  const handleDeleteTopico = async () => {
    if (!currentTopico) return;

    if (!user) {
      toast.error("Você precisa estar logado para excluir tópicos");
      return;
    }

    try {
      const { error } = await supabase
        .from('topicos')
        .delete()
        .eq('id', currentTopico.id);

      if (error) {
        throw error;
      }

      setTopicosList(topicosList.filter(t => t.id !== currentTopico.id));
      
      // Remover do array de tópicos selecionados
      if (topicos.includes(currentTopico.nome)) {
        setTopicos(topicos.filter(t => t !== currentTopico.nome));
      }

      toast.success("Tópico removido com sucesso!");
      setCurrentTopico(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      toast.error("Erro ao excluir tópico. Tente novamente.");
    }
  };

  if (!disciplina) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-[#272f3c]">
          Tópicos
        </label>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                title="Adicionar novo tópico"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Adicionar</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Tópico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="topico-nome">Nome do Tópico</Label>
                  <Input
                    id="topico-nome"
                    value={newTopicoNome}
                    onChange={(e) => setNewTopicoNome(e.target.value)}
                    placeholder="Digite o nome do tópico"
                  />
                </div>
                <Button onClick={handleAddTopico} className="w-full">Adicionar Tópico</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                disabled={!topicosList.length}
                title="Editar tópico"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Tópico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="topico-select">Selecione o Tópico</Label>
                  <Select
                    onValueChange={(value) => {
                      const selected = topicosList.find(t => t.id === value);
                      if (selected) {
                        setCurrentTopico(selected);
                        setNewTopicoNome(selected.nome);
                      }
                    }}
                    value={currentTopico?.id || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um tópico" />
                    </SelectTrigger>
                    <SelectContent>
                      {topicosList.map(topico => (
                        <SelectItem key={topico.id} value={topico.id}>
                          {topico.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {currentTopico && (
                  <div className="space-y-2">
                    <Label htmlFor="novo-nome-topico">Novo Nome</Label>
                    <Input
                      id="novo-nome-topico"
                      value={newTopicoNome}
                      onChange={(e) => setNewTopicoNome(e.target.value)}
                      placeholder="Digite o novo nome"
                    />
                  </div>
                )}
                <Button 
                  onClick={handleEditTopico} 
                  className="w-full"
                  disabled={!currentTopico}
                >
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-red-500"
                disabled={!topicosList.length}
                title="Excluir tópico"
              >
                <Trash className="h-4 w-4" />
                <span>Excluir</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Tópico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="topico-delete-select">Selecione o Tópico para Excluir</Label>
                  <Select
                    onValueChange={(value) => {
                      const selected = topicosList.find(t => t.id === value);
                      if (selected) {
                        setCurrentTopico(selected);
                      }
                    }}
                    value={currentTopico?.id || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um tópico" />
                    </SelectTrigger>
                    <SelectContent>
                      {topicosList.map(topico => (
                        <SelectItem key={topico.id} value={topico.id}>
                          {topico.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {currentTopico && (
                  <p className="text-red-500">
                    Tem certeza que deseja excluir o tópico "{currentTopico.nome}"?
                    Esta ação não pode ser desfeita.
                  </p>
                )}
                <Button 
                  onClick={handleDeleteTopico} 
                  className="w-full bg-red-500 hover:bg-red-600"
                  disabled={!currentTopico}
                >
                  Confirmar Exclusão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 p-4 border rounded flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#ea2be2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando tópicos...
        </div>
      ) : (
        <CheckboxGroup
          title=""
          options={topicosList.map(t => t.nome)}
          selectedValues={topicos}
          onChange={handleTopicosChange}
          placeholder="Selecione os tópicos"
        />
      )}
    </div>
  );
};

export default TopicosField;
