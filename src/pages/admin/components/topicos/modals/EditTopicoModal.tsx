import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Topico } from "../TopicosTypes";
import { QuestionsManager } from "./components/QuestionsManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditTopicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  topico: Topico | null;
  onSave: (topico: Topico) => void;
}

interface TeacherData {
  id: string;
  nomeCompleto: string;
  disciplina: string;
}

export const EditTopicoModal: React.FC<EditTopicoModalProps> = ({
  isOpen,
  onClose,
  topico,
  onSave,
}) => {
  const [editedTopico, setEditedTopico] = useState<Topico | null>(null);
  const [newQuestaoId, setNewQuestaoId] = useState("");

  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  useEffect(() => {
    if (isOpen && topico) {
      console.log('Abrindo modal com tópico:', topico);
      console.log('Valor de abrirEmNovaGuia:', topico.abrirEmNovaGuia);
      setEditedTopico({ ...topico });
      fetchTeachers();
    }
  }, [isOpen, topico]);



  const fetchTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
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
      setIsLoadingTeachers(false);
    }
  };

  const addQuestaoId = () => {
    if (!editedTopico || !newQuestaoId.trim()) {
      toast.error("Digite um ID de questão válido");
      return;
    }

    if (editedTopico.questoesIds.includes(newQuestaoId)) {
      toast.error("Esta questão já foi adicionada");
      return;
    }

    setEditedTopico({
      ...editedTopico,
      questoesIds: [...editedTopico.questoesIds, newQuestaoId]
    });
    setNewQuestaoId("");
  };

  const removeQuestaoId = (index: number) => {
    if (!editedTopico) return;
    
    const updatedQuestoes = [...editedTopico.questoesIds];
    updatedQuestoes.splice(index, 1);
    setEditedTopico({
      ...editedTopico,
      questoesIds: updatedQuestoes
    });
  };

  const handleSave = async () => {
    if (editedTopico) {
      try {
        let professor_nome = editedTopico.professor_nome || "";
        if (editedTopico.professor_id) {
          const selectedTeacher = teachers.find(t => t.id === editedTopico.professor_id);
          if (selectedTeacher) {
            professor_nome = selectedTeacher.nomeCompleto;
          }
        }
        
        // Atualizar o tópico com o nome do professor atualizado
        const topicoAtualizado = {
          ...editedTopico,
          professor_nome: professor_nome
        };
        
        // Chamar a função de salvamento externa em vez de fazer a atualização direta
        onSave(topicoAtualizado);
        
        // Fechar o modal e mostrar mensagem de sucesso é responsabilidade da função onSave
      } catch (error) {
        console.error("Erro ao preparar tópico para atualização:", error);
        toast.error("Erro ao atualizar o tópico. Tente novamente.");
      }
    }
  };

  if (!editedTopico) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Editar Tópico</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="edit-titulo">Título</Label>
            <Input
              id="edit-titulo"
              value={editedTopico.titulo}
              onChange={(e) => setEditedTopico({ ...editedTopico, titulo: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-disciplina">Disciplina</Label>
            <Input
              id="edit-disciplina"
              value={editedTopico.disciplina}
              onChange={(e) => setEditedTopico({ ...editedTopico, disciplina: e.target.value })}
              placeholder="Digite a disciplina"
            />
          </div>
          <div>
            <Label htmlFor="edit-professor">Professor</Label>
            {isLoadingTeachers ? (
              <div className="text-sm text-[#67748a] py-2">Carregando professores...</div>
            ) : (
              <Select
                value={editedTopico.professor_id || ""}
                onValueChange={(value) => setEditedTopico({ ...editedTopico, professor_id: value })}
              >
                <SelectTrigger id="edit-professor">
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
            )}
          </div>
          <div>
            <Label htmlFor="edit-patrocinador">Patrocinador</Label>
            <Input
              id="edit-patrocinador"
              value={editedTopico.patrocinador}
              onChange={(e) => setEditedTopico({ ...editedTopico, patrocinador: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-video-url">Link da Videoaula</Label>
            <Input
              id="edit-video-url"
              value={editedTopico.videoUrl}
              onChange={(e) => setEditedTopico({ ...editedTopico, videoUrl: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-abrir-em-nova-guia"
              checked={editedTopico.abrirEmNovaGuia || false}
              onCheckedChange={(checked) => setEditedTopico({ ...editedTopico, abrirEmNovaGuia: checked === true })}
            />
            <Label htmlFor="edit-abrir-em-nova-guia" className="cursor-pointer text-sm text-[#272f3c]">
              Abrir aula em nova guia
            </Label>
          </div>
          <div>
            <Label htmlFor="edit-pdf-url">Link da Aula em PDF</Label>
            <Input
              id="edit-pdf-url"
              value={editedTopico.pdfUrl}
              onChange={(e) => setEditedTopico({ ...editedTopico, pdfUrl: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-mapa-url">Link do Mapa Mental</Label>
            <Input
              id="edit-mapa-url"
              value={editedTopico.mapaUrl}
              onChange={(e) => setEditedTopico({ ...editedTopico, mapaUrl: e.target.value })}
              placeholder="https://exemplo.com/mapa"
            />
          </div>
          <div>
            <Label htmlFor="edit-resumo-url">Link do Resumo</Label>
            <Input
              id="edit-resumo-url"
              value={editedTopico.resumoUrl}
              onChange={(e) => setEditedTopico({ ...editedTopico, resumoUrl: e.target.value })}
              placeholder="https://exemplo.com/resumo"
            />
          </div>
          <div>
            <Label htmlFor="edit-musicaUrl">Link da Música</Label>
            <Input
              id="edit-musicaUrl"
              value={editedTopico.musicaUrl || ""}
              onChange={(e) => setEditedTopico({ ...editedTopico, musicaUrl: e.target.value })}
              placeholder="URL da música"
            />
          </div>
          <div>
            <Label htmlFor="edit-cadernoQuestoesUrl">Link do Caderno de Questões</Label>
            <Input
              id="edit-cadernoQuestoesUrl"
              value={editedTopico.cadernoQuestoesUrl || ""}
              onChange={(e) => setEditedTopico({ ...editedTopico, cadernoQuestoesUrl: e.target.value })}
              placeholder="URL do caderno de questões"
            />
          </div>
          <QuestionsManager
            questoesIds={editedTopico.questoesIds}
            newQuestaoId={newQuestaoId}
            setNewQuestaoId={setNewQuestaoId}
            addQuestaoId={addQuestaoId}
            removeQuestaoId={removeQuestaoId}
            label="Questões"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="bg-[#ea2be2] hover:bg-[#ea2be2]/90" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
