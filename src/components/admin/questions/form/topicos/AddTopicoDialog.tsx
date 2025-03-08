
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
      // Usamos o select para obter todas as disciplinas e depois filtramos os valores únicos no JavaScript
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

    // Aqui nós chamamos a função original handleAddTopico, mas com os dados adicionais
    // Você precisará modificar a função original para receber esses dados adicionais
    console.log({
      nome: newTopicoNome,
      disciplina: selectedDisciplina,
      patrocinador,
      questoesIds: selectedQuestoes,
      professor_id: selectedProfessorId
    });
    
    handleAddTopico();
    
    // Reset do estado
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
