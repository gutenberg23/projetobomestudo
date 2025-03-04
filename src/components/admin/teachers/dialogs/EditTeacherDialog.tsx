
import React, { useState, useEffect } from "react";
import { TeacherData } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

interface EditTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherData | null;
  onUpdateTeacher: (teacher: TeacherData) => void;
  disciplinas: string[];
}

const EditTeacherDialog: React.FC<EditTeacherDialogProps> = ({
  open,
  onOpenChange,
  teacher,
  onUpdateTeacher,
  disciplinas
}) => {
  const [formData, setFormData] = useState<Partial<TeacherData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Atualizar formulário quando o professor mudar
  useEffect(() => {
    if (teacher) {
      setFormData({ ...teacher });
    }
  }, [teacher]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as TeacherData["status"] }));
  };
  
  const handleDisciplinaChange = (value: string) => {
    setFormData(prev => ({ ...prev, disciplina: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacher || !formData.nomeCompleto || !formData.email || !formData.linkYoutube || !formData.disciplina) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulação de envio
    setTimeout(() => {
      onUpdateTeacher(formData as TeacherData);
      setIsSubmitting(false);
      onOpenChange(false);
    }, 500);
  };
  
  if (!teacher) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-[#022731] text-xl font-bold">Editar Professor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto" className="text-[#022731]">Nome Completo</Label>
            <Input 
              id="nomeCompleto" 
              name="nomeCompleto"
              value={formData.nomeCompleto || ""}
              onChange={handleInputChange}
              className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#022731]">E-mail</Label>
            <Input 
              id="email" 
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkYoutube" className="text-[#022731]">Link do Canal no YouTube</Label>
            <Input 
              id="linkYoutube" 
              name="linkYoutube"
              value={formData.linkYoutube || ""}
              onChange={handleInputChange}
              className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-[#022731]">Instagram</Label>
            <Input 
              id="instagram" 
              name="instagram"
              value={formData.instagram || ""}
              onChange={handleInputChange}
              className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-[#022731]">Twitter</Label>
            <Input 
              id="twitter" 
              name="twitter"
              value={formData.twitter || ""}
              onChange={handleInputChange}
              className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook" className="text-[#022731]">Facebook</Label>
            <Input 
              id="facebook" 
              name="facebook"
              value={formData.facebook || ""}
              onChange={handleInputChange}
              className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="disciplina" className="text-[#022731]">Disciplina</Label>
              <Select
                value={formData.disciplina}
                onValueChange={handleDisciplinaChange}
              >
                <SelectTrigger className="border-[#2a8e9e]/30 focus:ring-[#2a8e9e]">
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
              <Label htmlFor="status" className="text-[#022731]">Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="border-[#2a8e9e]/30 focus:ring-[#2a8e9e]">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#2a8e9e] hover:bg-[#2a8e9e]/90"
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
