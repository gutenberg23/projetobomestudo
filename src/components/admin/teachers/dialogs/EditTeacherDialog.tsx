import React, { useState, useEffect } from "react";
import { TeacherData } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfilePhotoSection } from "./components/ProfilePhotoSection";

interface EditTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherData | null;
  onUpdateTeacher: (teacher: TeacherData) => void;
}

const EditTeacherDialog: React.FC<EditTeacherDialogProps> = ({
  open,
  onOpenChange,
  teacher,
  onUpdateTeacher
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<TeacherData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  
  // Atualizar formulário quando o professor mudar
  useEffect(() => {
    if (teacher) {
      setFormData({ ...teacher });
      setFotoPreview(teacher.fotoPerfil || null);
    }
  }, [teacher]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as TeacherData["status"] }));
  };
  
  const handleFileSelect = (url: string) => {
    setFormData(prev => ({ ...prev, fotoPerfil: url }));
    setFotoPreview(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacher || !formData.nomeCompleto || !formData.email || !formData.disciplina) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('professores')
        .update({
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
        .eq('id', teacher.id);
      
      if (error) throw error;
      
      // Atualizar na interface
      onUpdateTeacher(formData as TeacherData);
      
      toast({
        title: "Professor atualizado",
        description: "Os dados do professor foram atualizados com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar professor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o professor. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!teacher) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c] text-xl font-bold">Editar Professor</DialogTitle>
          <DialogDescription className="text-[#67748a]">
            Atualize os dados do professor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto" className="text-[#272f3c]">Nome Completo</Label>
            <Input 
              id="nomeCompleto" 
              name="nomeCompleto"
              value={formData.nomeCompleto || ""}
              onChange={handleInputChange}
              className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#272f3c]">E-mail</Label>
            <Input 
              id="email" 
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
            />
          </div>
          
          <ProfilePhotoSection 
            fotoPreview={fotoPreview} 
            handleFileSelect={handleFileSelect} 
          />
          
          <div className="space-y-2">
            <Label htmlFor="linkYoutube" className="text-[#272f3c]">Link do Canal no YouTube</Label>
            <Input 
              id="linkYoutube" 
              name="linkYoutube"
              value={formData.linkYoutube || ""}
              onChange={handleInputChange}
              className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="disciplina" className="text-[#272f3c]">Disciplina</Label>
            <Input 
              id="disciplina" 
              name="disciplina"
              value={formData.disciplina || ""}
              onChange={handleInputChange}
              className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-[#272f3c]">Instagram</Label>
            <Input 
              id="instagram" 
              name="instagram"
              value={formData.instagram || ""}
              onChange={handleInputChange}
              className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-[#272f3c]">Twitter</Label>
            <Input 
              id="twitter" 
              name="twitter"
              value={formData.twitter || ""}
              onChange={handleInputChange}
              className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook" className="text-[#272f3c]">Facebook</Label>
            <Input 
              id="facebook" 
              name="facebook"
              value={formData.facebook || ""}
              onChange={handleInputChange}
              className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website" className="text-[#272f3c]">Website</Label>
            <Input 
              id="website" 
              name="website"
              value={formData.website || ""}
              onChange={handleInputChange}
              className="border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status" className="text-[#272f3c]">Status</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="border-[#5f2ebe]/30 focus:ring-[#5f2ebe]">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90"
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeacherDialog;
