
import React from "react";
import { TeacherData } from "./types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, ExternalLink, Youtube, Facebook, Twitter, Instagram, Link, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeacherListProps {
  teachers: TeacherData[];
  onEdit: (teacher: TeacherData) => void;
  onDelete: (teacher: TeacherData) => void;
  onViewDetails: (teacher: TeacherData) => void;
  onViewNotes: (teacher: TeacherData) => void;
  onRatingChange: (teacherId: string, newRating: number) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  onEdit,
  onDelete,
  onViewDetails,
  onViewNotes,
  onRatingChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Professor</TableHead>
            <TableHead>Disciplina</TableHead>
            <TableHead>Canal no YouTube</TableHead>
            <TableHead>Redes Sociais</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={teacher.fotoPerfil} />
                      <AvatarFallback className="bg-[#5f2ebe] text-white">
                        {teacher.nomeCompleto.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-[#272f3c]">{teacher.nomeCompleto}</div>
                      <div className="text-sm text-[#67748a]">{teacher.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-[#f6f8fa] text-[#5f2ebe] border-[#5f2ebe]">
                    {teacher.disciplina}
                  </Badge>
                </TableCell>
                <TableCell>
                  {teacher.linkYoutube ? (
                    <a 
                      href={teacher.linkYoutube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#5f2ebe] hover:underline"
                    >
                      <Youtube className="h-4 w-4 mr-1" />
                      Canal
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">Não informado</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {teacher.instagram && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={teacher.instagram} target="_blank" rel="noopener noreferrer" className="text-[#5f2ebe]">
                              <Instagram className="h-4 w-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Instagram</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {teacher.twitter && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={teacher.twitter} target="_blank" rel="noopener noreferrer" className="text-[#5f2ebe]">
                              <Twitter className="h-4 w-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Twitter</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {teacher.facebook && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={teacher.facebook} target="_blank" rel="noopener noreferrer" className="text-[#5f2ebe]">
                              <Facebook className="h-4 w-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Facebook</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {teacher.website && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={teacher.website} target="_blank" rel="noopener noreferrer" className="text-[#5f2ebe]">
                              <Link className="h-4 w-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Website</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>{teacher.dataCadastro}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewDetails(teacher)}
                      className="border-[#5f2ebe] text-[#5f2ebe] hover:bg-[#f6f8fa]"
                    >
                      <ExternalLink size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewNotes(teacher)}
                      className="border-[#5f2ebe] text-[#5f2ebe] hover:bg-[#f6f8fa]"
                    >
                      <StickyNote size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(teacher)}
                      className="border-[#5f2ebe] text-[#5f2ebe] hover:bg-[#f6f8fa]"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(teacher)}
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="text-center">
                  <Youtube className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-lg font-medium text-[#272f3c]">Nenhum professor encontrado</h3>
                  <p className="mt-1 text-sm text-[#67748a]">Não encontramos professores com os filtros aplicados.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherList;
