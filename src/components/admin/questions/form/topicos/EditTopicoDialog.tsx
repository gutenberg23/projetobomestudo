import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Topico } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeacherData {
  id: string;
  nomeCompleto: string;
  disciplina: string;
}

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
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentTopico) {
      setSelectedProfessorId(currentTopico.professor_id || "");
      fetchTeachers();
    }
  }, [isOpen, currentTopico]);

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

  const handleSelectProfessor = (professorId: string) => {
    setSelectedProfessorId(professorId);
    if (currentTopico) {
      setCurrentTopico({
        ...currentTopico,
        professor_id: professorId
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  setSelectedProfessorId(selected.professor_id || "");
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
                <Label htmlFor="novo-nome-topico">Novo Nome</Label>
                <Input
                  id="novo-nome-topico"
                  value={newTopicoNome}
                  onChange={(e) => setNewTopicoNome(e.target.value)}
                  placeholder="Digite o novo nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professor-select">Professor</Label>
                <Select
                  onValueChange={handleSelectProfessor}
                  value={selectedProfessorId}
                >
                  <SelectTrigger id="professor-select" className="w-full">
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.nomeCompleto} - {teacher.disciplina}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
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
  );
};

export default EditTopicoDialog;
