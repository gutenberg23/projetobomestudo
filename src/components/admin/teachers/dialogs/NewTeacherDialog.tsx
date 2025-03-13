
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeacherData, TeacherStatus } from "../types";
import { 
  BasicInfoSection, 
  ProfilePhotoSection, 
  DisciplineSection, 
  SocialMediaSection 
} from "./components";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTeacher: (teacher: TeacherData) => void;
}

const NewTeacherDialog: React.FC<NewTeacherDialogProps> = ({
  open,
  onOpenChange,
  onAddTeacher
}) => {
  const { toast } = useToast();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeCompleto || !formData.email || !formData.disciplina) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('professores')
        .insert({
          nome_completo: formData.nomeCompleto,
          email: formData.email,
          link_youtube: formData.linkYoutube,
          disciplina: formData.disciplina,
          instagram: formData.instagram,
          twitter: formData.twitter,
          facebook: formData.facebook,
          website: formData.website,
          foto_perfil: formData.fotoPerfil
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Converter dados do formato do banco para o formato da interface
      const newTeacher: TeacherData = {
        id: data.id,
        nomeCompleto: data.nome_completo,
        email: data.email,
        linkYoutube: data.link_youtube || '',
        disciplina: data.disciplina,
        instagram: data.instagram || '',
        twitter: data.twitter || '',
        facebook: data.facebook || '',
        website: data.website || '',
        fotoPerfil: data.foto_perfil || '',
        status: 'aprovado',
        dataCadastro: new Date(data.data_cadastro).toLocaleDateString('pt-BR'),
        ativo: true,
        rating: data.rating || 0
      };
      
      onAddTeacher(newTeacher);
      
      toast({
        title: "Professor adicionado",
        description: `O professor ${formData.nomeCompleto} foi adicionado com sucesso.`,
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
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao adicionar professor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o professor. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
              className="border-[#5f2ebe] text-[#5f2ebe]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 text-white"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar Professor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTeacherDialog;
