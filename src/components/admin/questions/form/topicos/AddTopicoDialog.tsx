import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { toast } from "sonner";

interface AddTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  newTopicoNome: string;
  setNewTopicoNome: (value: string) => void;
  handleAddTopico: () => void;
}

interface TeacherData {
  id: string;
  nomeCompleto: string;
  disciplina: string;
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
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchDisciplinas();
      fetchQuestoes();
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchDisciplinas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questoes')
        .select('discipline');
      
      if (error) throw error;
      
      const uniqueDisciplinas = [...new Set(data?.map(item => item.discipline) || [])];
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

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome_completo, disciplina')
        .order('nome_completo');
        
      if (error) throw error;
      
      const formattedTeachers: TeacherData[] = data?.map(teacher => ({
        id: teacher.id,
        nomeCompleto: teacher.nome_completo,
        disciplina: teacher.disciplina
      })) || [];

      setTeachers(formattedTeachers);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      toast.error("Erro ao carregar professores. Tente novamente.");
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
    if (!newTopicoNome.trim()) {
      toast.error("O título do tópico é obrigatório");
      return;
    }

    if (!selectedDisciplina) {
      toast.error("A disciplina é obrigatória");
      return;
    }

    console.log({
      nome: newTopicoNome,
      disciplina: selectedDisciplina,
      patrocinador,
      questoesIds: selectedQuestoes,
      professor_id: selectedProfessorId
    });
    
    handleAddTopico();
    
    setNewTopicoNome("");
    setSelectedDisciplina("");
    setPatrocinador("");
    setSelectedQuestoes([]);
    setSelectedProfessorId("");
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
            <Label htmlFor="professor">Professor</Label>
            <Select value={selectedProfessorId} onValueChange={setSelectedProfessorId}>
              <SelectTrigger id="professor">
                <SelectValue placeholder="Selecione um professor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.nomeCompleto} - {teacher.disciplina}
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
