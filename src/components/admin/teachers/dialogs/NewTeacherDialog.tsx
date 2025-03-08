
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeacherData, TeacherStatus } from "../types";
import { 
  BasicInfoSection, 
  ProfilePhotoSection, 
  DisciplineSection, 
  TopicsSection, 
  SocialMediaSection 
} from "./components";

interface NewTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTeacher: (teacher: Omit<TeacherData, 'id'>) => void;
  disciplinas: string[];
}

// Lista de tópicos simulada - em um caso real seria carregada do backend
const topicsByDisciplina: Record<string, string[]> = {
  "Português": ["Gramática", "Interpretação de Texto", "Redação", "Literatura"],
  "Matemática": ["Álgebra", "Geometria", "Estatística", "Probabilidade"],
  "Direito Constitucional": ["Princípios Fundamentais", "Direitos e Garantias", "Organização do Estado"],
  "Direito Administrativo": ["Atos Administrativos", "Licitação", "Contratos Administrativos"],
  "Contabilidade": ["Contabilidade Básica", "Demonstrações Financeiras", "Análise de Balanços"]
};

const NewTeacherDialog: React.FC<NewTeacherDialogProps> = ({
  open,
  onOpenChange,
  onAddTeacher,
  disciplinas
}) => {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    linkYoutube: "",
    disciplina: "",
    instagram: "",
    twitter: "",
    facebook: "",
    website: "",
    fotoPerfil: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70), // Placeholder temporário
    status: "pendente" as TeacherStatus,
    ativo: true,
    rating: 0
  });
  
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicVideos, setTopicVideos] = useState<Record<string, string>>({});
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  
  useEffect(() => {
    if (formData.disciplina && topicsByDisciplina[formData.disciplina]) {
      setAvailableTopics(topicsByDisciplina[formData.disciplina]);
    } else {
      setAvailableTopics([]);
    }
    // Limpar tópicos selecionados quando a disciplina mudar
    setSelectedTopics([]);
    setTopicVideos({});
  }, [formData.disciplina]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDisciplinaChange = (value: string) => {
    setFormData(prev => ({ ...prev, disciplina: value }));
  };
  
  const handleFileSelect = () => {
    // Simulação de upload de arquivo (em produção, usaríamos um sistema real de upload)
    const randomAvatar = "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70);
    setFormData(prev => ({ ...prev, fotoPerfil: randomAvatar }));
    setFotoPreview(randomAvatar);
  };
  
  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleVideoLinkChange = (topic: string, value: string) => {
    setTopicVideos(prev => ({
      ...prev,
      [topic]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeCompleto || !formData.email || !formData.disciplina) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    onAddTeacher({
      ...formData,
      // Adicionar outros dados necessários
      dataCadastro: new Date().toLocaleDateString('pt-BR')
    });
    
    // Resetar formulário
    setFormData({
      nomeCompleto: "",
      email: "",
      linkYoutube: "",
      disciplina: "",
      instagram: "",
      twitter: "",
      facebook: "",
      website: "",
      fotoPerfil: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70),
      status: "pendente",
      ativo: true,
      rating: 0
    });
    setFotoPreview(null);
    setSelectedTopics([]);
    setTopicVideos({});
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c] text-xl font-bold">Adicionar Novo Professor</DialogTitle>
          <DialogDescription className="text-[#67748a]">
            Preencha os dados do novo professor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <BasicInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <ProfilePhotoSection 
            fotoPreview={fotoPreview} 
            handleFileSelect={handleFileSelect} 
          />
          
          <DisciplineSection 
            disciplina={formData.disciplina} 
            handleDisciplinaChange={handleDisciplinaChange} 
            disciplinas={disciplinas} 
          />
          
          <TopicsSection 
            availableTopics={availableTopics} 
            selectedTopics={selectedTopics} 
            topicVideos={topicVideos} 
            handleTopicToggle={handleTopicToggle} 
            handleVideoLinkChange={handleVideoLinkChange} 
          />
          
          <SocialMediaSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-[#ea2be2] text-[#ea2be2]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 text-white"
            >
              Adicionar Professor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTeacherDialog;
