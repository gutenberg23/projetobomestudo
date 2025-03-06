
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";

interface AddTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  newTopicoNome: string;
  setNewTopicoNome: (value: string) => void;
  handleAddTopico: () => void;
}

const AddTopicoDialog: React.FC<AddTopicoDialogProps> = ({
  isOpen,
  setIsOpen,
  newTopicoNome,
  setNewTopicoNome,
  handleAddTopico
}) => {
  const [disciplinas, setDisciplinas] = useState<string[]>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [patrocinador, setPatrocinador] = useState<string>("");
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [selectedQuestoes, setSelectedQuestoes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchDisciplinas();
      fetchQuestoes();
    }
  }, [isOpen]);

  const fetchDisciplinas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questoes')
        .select('discipline')
        .distinct();
      
      if (error) throw error;
      
      const uniqueDisciplinas = data?.map(item => item.discipline) || [];
      setDisciplinas(uniqueDisciplinas);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questoes')
        .select('id, content')
        .limit(20);
      
      if (error) throw error;
      
      setQuestoes(data || []);
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestoesChange = (questaoId: string) => {
    if (selectedQuestoes.includes(questaoId)) {
      setSelectedQuestoes(selectedQuestoes.filter(id => id !== questaoId));
    } else {
      setSelectedQuestoes([...selectedQuestoes, questaoId]);
    }
  };

  const handleSubmit = () => {
    // Aqui nós chamamos a função original handleAddTopico, mas com os dados adicionais
    // Você precisará modificar a função original para receber esses dados adicionais
    console.log({
      nome: newTopicoNome,
      disciplina: selectedDisciplina,
      patrocinador,
      questoesIds: selectedQuestoes
    });
    
    // Reset do estado
    setNewTopicoNome("");
    setSelectedDisciplina("");
    setPatrocinador("");
    setSelectedQuestoes([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Tópico</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="topico-nome">Título</Label>
            <Input
              id="topico-nome"
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
            {loading ? (
              <div className="text-sm text-[#67748a] p-4 border rounded flex items-center justify-center">
                Carregando questões...
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded p-2">
                <CheckboxGroup
                  title=""
                  options={questoes.map(q => `${q.id} - ${q.content.substring(0, 50)}...`)}
                  selectedValues={selectedQuestoes}
                  onChange={handleQuestoesChange}
                  placeholder="Selecione as questões"
                />
              </div>
            )}
          </div>
          
          <Button onClick={handleSubmit} className="w-full">Cadastrar Tópico</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopicoDialog;
