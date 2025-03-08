
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
      // Esta é uma versão simulada. Quando houver uma tabela real de professores, 
      // substitua este código por uma consulta ao Supabase
      const mockTeachers = [
        {
          id: "1",
          nomeCompleto: "Ana Silva",
          email: "ana.silva@email.com",
          linkYoutube: "https://youtube.com/c/anasilva",
          disciplina: "Português",
          instagram: "https://instagram.com/anasilva",
          twitter: "https://twitter.com/anasilva",
          facebook: "https://facebook.com/anasilva",
          fotoPerfil: "https://i.pravatar.cc/150?img=1",
          status: "aprovado",
          dataCadastro: "12/05/2023",
          ativo: true,
          rating: 4.5
        },
        {
          id: "2",
          nomeCompleto: "Carlos Oliveira",
          email: "carlos.oliveira@email.com",
          linkYoutube: "https://youtube.com/c/carlosoliveira",
          disciplina: "Matemática",
          instagram: "https://instagram.com/carlosoliveira",
          fotoPerfil: "https://i.pravatar.cc/150?img=2",
          status: "pendente",
          dataCadastro: "03/07/2023",
          ativo: false,
          rating: 3.8
        },
        {
          id: "3",
          nomeCompleto: "Juliana Mendes",
          email: "juliana.mendes@email.com",
          linkYoutube: "https://youtube.com/c/julianamendes",
          disciplina: "Direito Constitucional",
          twitter: "https://twitter.com/julianamendes",
          facebook: "https://facebook.com/julianamendes",
          fotoPerfil: "https://i.pravatar.cc/150?img=3",
          status: "rejeitado",
          dataCadastro: "28/09/2023",
          ativo: false,
          rating: 2.5
        },
        {
          id: "4",
          nomeCompleto: "Roberto Almeida",
          email: "roberto.almeida@email.com",
          linkYoutube: "https://youtube.com/c/robertoalmeida",
          disciplina: "Contabilidade",
          instagram: "https://instagram.com/robertoalmeida",
          twitter: "https://twitter.com/robertoalmeida",
          fotoPerfil: "https://i.pravatar.cc/150?img=4",
          status: "aprovado",
          dataCadastro: "15/01/2023",
          ativo: true,
          rating: 5.0
        },
        {
          id: "5",
          nomeCompleto: "Fernanda Costa",
          email: "fernanda.costa@email.com",
          linkYoutube: "https://youtube.com/c/fernandacosta",
          disciplina: "Direito Administrativo",
          facebook: "https://facebook.com/fernandacosta",
          fotoPerfil: "https://i.pravatar.cc/150?img=5",
          status: "pendente",
          dataCadastro: "07/04/2023",
          ativo: true,
          rating: 4.2
        }
      ];

      // Convertendo os dados brutos para o formato TeacherData
      const formattedTeachers: TeacherData[] = mockTeachers.map(teacher => ({
        id: teacher.id,
        nomeCompleto: teacher.nomeCompleto,
        disciplina: teacher.disciplina
      }));

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
