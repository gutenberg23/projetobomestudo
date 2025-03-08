
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Topico } from "../../types";
import { TeacherData, TeacherStatus } from "../../../teachers/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  topicosList: Topico[];
  currentTopico: Topico | null;
  setCurrentTopico: (topico: Topico | null) => void;
  newTopicoNome: string;
  setNewTopicoNome: (value: string) => void;
  handleEditTopico: (professorId?: string) => void;
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
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [loadingTeachers, setLoadingTeachers] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      if (currentTopico?.professor_id) {
        setSelectedTeacher(currentTopico.professor_id);
      } else {
        setSelectedTeacher("");
      }
    }
  }, [isOpen, currentTopico]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      // Em uma implementação real, buscaríamos do banco de dados
      // Por enquanto, usamos os dados mockados definidos em useTeachersState
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
          status: "aprovado" as TeacherStatus,
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
          status: "pendente" as TeacherStatus,
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
          status: "rejeitado" as TeacherStatus,
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
          status: "aprovado" as TeacherStatus,
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
          status: "pendente" as TeacherStatus,
          dataCadastro: "07/04/2023",
          ativo: true,
          rating: 4.2
        }
      ];
      
      // Filtramos apenas professores ativos e aprovados
      const activeTeachers = mockTeachers.filter(
        teacher => teacher.ativo && teacher.status === "aprovado"
      );
      
      setTeachers(activeTeachers);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSave = () => {
    handleEditTopico(selectedTeacher);
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
                  setSelectedTeacher(selected.professor_id || "");
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
                <Label htmlFor="professor">Professor</Label>
                {loadingTeachers ? (
                  <div className="text-sm text-[#67748a] p-4 border rounded flex items-center justify-center">
                    Carregando professores...
                  </div>
                ) : (
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger id="professor">
                      <SelectValue placeholder="Selecione um professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={teacher.fotoPerfil} alt={teacher.nomeCompleto} />
                              <AvatarFallback>{teacher.nomeCompleto.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{teacher.nomeCompleto}</span>
                            <span className="text-xs text-[#67748a]">({teacher.disciplina})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </>
          )}
          <Button 
            onClick={handleSave} 
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
