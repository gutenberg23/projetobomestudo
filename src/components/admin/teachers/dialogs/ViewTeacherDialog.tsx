
import React from "react";
import { TeacherData } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, Facebook, Twitter, Instagram, Mail, Calendar, BookOpen } from "lucide-react";

interface ViewTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherData | null;
}

const ViewTeacherDialog: React.FC<ViewTeacherDialogProps> = ({
  open,
  onOpenChange,
  teacher
}) => {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-[#022731] text-xl font-bold">Detalhes do Professor</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={teacher.fotoPerfil} />
            <AvatarFallback className="bg-[#2a8e9e] text-white text-2xl">
              {teacher.nomeCompleto.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="mt-4 text-xl font-bold text-[#022731]">{teacher.nomeCompleto}</h3>
          
          <div className="flex items-center mt-1 text-[#67748a]">
            <Mail className="h-4 w-4 mr-1" />
            <span>{teacher.email}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="bg-[#e8f1f3] text-[#2a8e9e] border-[#2a8e9e]">
              <BookOpen className="h-3 w-3 mr-1" />
              {teacher.disciplina}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={teacher.status === 'aprovado' 
                ? "bg-green-100 text-green-800 border-green-300" 
                : teacher.status === 'pendente'
                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                : "bg-red-100 text-red-800 border-red-300"
              }
            >
              {teacher.status === 'aprovado' ? 'Aprovado' : 
               teacher.status === 'pendente' ? 'Pendente' : 'Rejeitado'}
            </Badge>
          </div>
          
          <div className="flex items-center mt-2 text-sm text-[#67748a]">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Cadastrado em {teacher.dataCadastro}</span>
          </div>
        </div>
        
        <div className="space-y-4 py-2">
          <div>
            <h4 className="text-sm font-medium text-[#67748a] mb-2">Canal do YouTube</h4>
            <a 
              href={teacher.linkYoutube} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-[#2a8e9e] hover:underline"
            >
              <Youtube className="h-5 w-5 mr-2" />
              {teacher.linkYoutube}
            </a>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-[#67748a] mb-2">Redes Sociais</h4>
            <div className="flex flex-wrap gap-3">
              {teacher.instagram && (
                <a 
                  href={teacher.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-[#2a8e9e] hover:underline"
                >
                  <Instagram className="h-5 w-5 mr-1" />
                  Instagram
                </a>
              )}
              
              {teacher.twitter && (
                <a 
                  href={teacher.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-[#2a8e9e] hover:underline"
                >
                  <Twitter className="h-5 w-5 mr-1" />
                  Twitter
                </a>
              )}
              
              {teacher.facebook && (
                <a 
                  href={teacher.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-[#2a8e9e] hover:underline"
                >
                  <Facebook className="h-5 w-5 mr-1" />
                  Facebook
                </a>
              )}
              
              {!teacher.instagram && !teacher.twitter && !teacher.facebook && (
                <span className="text-[#67748a]">Nenhuma rede social cadastrada</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-[#2a8e9e] text-[#2a8e9e] hover:bg-[#e8f1f3]"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTeacherDialog;
