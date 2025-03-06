
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Topico } from "../../types";
import { X } from "lucide-react";

interface EditTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  topicosList: Topico[];
  currentTopico: Topico | null;
  setCurrentTopico: (topico: Topico | null) => void;
  newTopicoNome: string;
  setNewTopicoNome: (value: string) => void;
  handleEditTopico: () => void;
}

const EditTopicoDialog: React.FC<EditTopicoDialogProps> = ({
  isOpen,
  setIsOpen,
  topicosList,
  currentTopico,
  setCurrentTopico,
  newTopicoNome,
  setNewTopicoNome,
  handleEditTopico
}) => {
  const [disciplinas, setDisciplinas] = useState<string[]>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [patrocinador, setPatrocinador] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Estados para o novo método de adicionar questões
  const [questaoId, setQuestaoId] = useState<string>("");
  const [selectedQuestoes, setSelectedQuestoes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchDisciplinas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentTopico) {
      setNewTopicoNome(currentTopico.nome);
      setSelectedDisciplina(currentTopico.disciplina);
      setPatrocinador(currentTopico.patrocinador || "");
      setSelectedQuestoes(currentTopico.questoes_ids || []);
    }
  }, [currentTopico]);

  const fetchDisciplinas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questoes')
        .select('discipline');
      
      if (error) throw error;
      
      // Extrair disciplinas únicas usando Set
      const uniqueDisciplinas = [...new Set(data?.map(item => item.discipline) || [])];
      setDisciplinas(uniqueDisciplinas);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestao = () => {
    if (!questaoId.trim()) return;
    
    // Verificar se a questão já foi adicionada
    if (!selectedQuestoes.includes(questaoId)) {
      setSelectedQuestoes([...selectedQuestoes, questaoId]);
    }
    
    // Limpar o input após adicionar
    setQuestaoId("");
  };

  const handleRemoveQuestao = (id: string) => {
    setSelectedQuestoes(selectedQuestoes.filter(q => q !== id));
  };

  const handleSubmit = async () => {
    if (!currentTopico) return;
    
    try {
      const { error } = await supabase
        .from('topicos')
        .update({
          nome: newTopicoNome,
          disciplina: selectedDisciplina,
          patrocinador: patrocinador,
          questoes_ids: selectedQuestoes
        })
        .eq('id', currentTopico.id);
        
      if (error) throw error;
      
      // Atualizar o tópico local
      if (setCurrentTopico) {
        setCurrentTopico({
          ...currentTopico,
          nome: newTopicoNome,
          disciplina: selectedDisciplina,
          patrocinador: patrocinador,
          questoes_ids: selectedQuestoes
        });
      }
      
      // Fechar o modal
      setIsOpen(false);
      
    } catch (error) {
      console.error("Erro ao atualizar tópico:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
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
                  setSelectedDisciplina(selected.disciplina);
                  setPatrocinador(selected.patrocinador || "");
                  setSelectedQuestoes(selected.questoes_ids || []);
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
            <>
              <div className="space-y-2">
                <Label htmlFor="novo-nome-topico">Título</Label>
                <Input
                  id="novo-nome-topico"
                  value={newTopicoNome}
                  onChange={(e) => setNewTopicoNome(e.target.value)}
                  placeholder="Digite o título do tópico"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="disciplina">Disciplina</Label>
                <Select value={selectedDisciplina} onValueChange={setSelectedDisciplina}>
                  <SelectTrigger id="disciplina">
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((disciplina) => (
                      <SelectItem key={disciplina} value={disciplina}>
                        {disciplina}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patrocinador">Patrocinador</Label>
                <Input
                  id="patrocinador"
                  value={patrocinador}
                  onChange={(e) => setPatrocinador(e.target.value)}
                  placeholder="Digite o nome do patrocinador"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Questões</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o ID da questão"
                      value={questaoId}
                      onChange={(e) => setQuestaoId(e.target.value)}
                    />
                    <Button onClick={handleAddQuestao} type="button">
                      Adicionar Questão
                    </Button>
                  </div>
                  
                  {selectedQuestoes.length > 0 && (
                    <div className="border rounded-md p-3 mt-2">
                      <p className="text-sm font-medium mb-2">Questões adicionadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestoes.map((id) => (
                          <div key={id} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <span className="text-sm mr-2">ID: {id}</span>
                            <button 
                              onClick={() => handleRemoveQuestao(id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!currentTopico}
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTopicoDialog;
