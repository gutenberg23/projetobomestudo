
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TeacherBasicInfo } from "./teacher-signup/TeacherBasicInfo";
import { TeacherPhotoUpload } from "./teacher-signup/TeacherPhotoUpload";
import { TeacherDisciplineSelect } from "./teacher-signup/TeacherDisciplineSelect";
import { TeacherTopicsList } from "./teacher-signup/TeacherTopicsList";
import { TeacherSocialMedia } from "./teacher-signup/TeacherSocialMedia";
import { TeacherTermsAgreement } from "./teacher-signup/TeacherTermsAgreement";
import { disciplinas, topicosPorDisciplina, TeacherFormData } from "./teacher-signup/types";

interface TeacherSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeacherSignupDialog: React.FC<TeacherSignupDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<TeacherFormData>({
    nomeCompleto: "",
    email: "",
    linkYoutube: "",
    disciplina: "",
    instagram: "",
    twitter: "",
    facebook: "",
    fotoPerfil: null,
    aceitouTermos: false
  });
  
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicosSelecionados, setTopicosSelecionados] = useState<string[]>([]);
  const [topicosDisponiveis, setTopicosDisponiveis] = useState<string[]>([]);
  const [linksVideos, setLinksVideos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.disciplina && topicosPorDisciplina[formData.disciplina]) {
      setTopicosDisponiveis(topicosPorDisciplina[formData.disciplina]);
    } else {
      setTopicosDisponiveis([]);
    }
    // Limpar tópicos selecionados ao mudar de disciplina
    setTopicosSelecionados([]);
    setLinksVideos({});
  }, [formData.disciplina]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, aceitouTermos: checked }));
  };

  const handleDisciplinaChange = (value: string) => {
    setFormData(prev => ({ ...prev, disciplina: value }));
  };

  const handleTopicoToggle = (topico: string) => {
    setTopicosSelecionados(prev => 
      prev.includes(topico) 
        ? prev.filter(t => t !== topico) 
        : [...prev, topico]
    );
  };

  const handleLinkVideoChange = (topico: string, valor: string) => {
    setLinksVideos(prev => ({
      ...prev,
      [topico]: valor
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, fotoPerfil: file }));
    
    // Criar preview da imagem
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFotoPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.nomeCompleto || !formData.email || !formData.linkYoutube || !formData.disciplina) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.aceitouTermos) {
      toast({
        title: "Termos de uso",
        description: "Você precisa aceitar os termos de uso para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulação de envio
    setIsSubmitting(true);
    
    // Aqui seria a implementação real do envio dos dados para o backend
    setTimeout(() => {
      toast({
        title: "Cadastro recebido com sucesso!",
        description: "Entraremos em contato em breve para dar continuidade ao processo.",
      });
      
      // Resetar formulário e fechar diálogo
      setFormData({
        nomeCompleto: "",
        email: "",
        linkYoutube: "",
        disciplina: "",
        instagram: "",
        twitter: "",
        facebook: "",
        fotoPerfil: null,
        aceitouTermos: false
      });
      setFotoPreview(null);
      setTopicosSelecionados([]);
      setLinksVideos({});
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#022731] text-2xl font-bold">Cadastro de Professor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <TeacherBasicInfo 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <TeacherPhotoUpload 
            fotoPreview={fotoPreview} 
            handleFileChange={handleFileChange} 
          />
          
          <TeacherDisciplineSelect 
            disciplina={formData.disciplina} 
            handleDisciplinaChange={handleDisciplinaChange} 
            disciplinas={disciplinas} 
          />
          
          <TeacherTopicsList 
            topicosDisponiveis={topicosDisponiveis}
            topicosSelecionados={topicosSelecionados}
            linksVideos={linksVideos}
            handleTopicoToggle={handleTopicoToggle}
            handleLinkVideoChange={handleLinkVideoChange}
          />
          
          <TeacherSocialMedia 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
          
          <TeacherTermsAgreement 
            aceitouTermos={formData.aceitouTermos} 
            handleCheckboxChange={handleCheckboxChange} 
          />
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#2a8e9e] hover:bg-[#2a8e9e]/90 text-white"
            >
              {isSubmitting ? "Enviando..." : "Enviar Cadastro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
