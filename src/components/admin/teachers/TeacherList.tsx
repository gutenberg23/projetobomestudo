
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
import { Edit, Trash2, ExternalLink, Youtube, Facebook, Twitter, Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeacherListProps {
  teachers: TeacherData[];
  onEdit: (teacher: TeacherData) => void;
  onDelete: (teacher: TeacherData) => void;
  onViewDetails: (teacher: TeacherData) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  onEdit,
  onDelete,
  onViewDetails
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
            <TableHead>Status</TableHead>
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
                      <AvatarFallback className="bg-[#2a8e9e] text-white">
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
                  <Badge variant="outline" className="bg-[#e8f1f3] text-[#2a8e9e] border-[#2a8e9e]">
                    {teacher.disciplina}
                  </Badge>
                </TableCell>
                <TableCell>
                  <a 
                    href={teacher.linkYoutube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#2a8e9e] hover:underline"
                  >
                    <Youtube className="h-4 w-4 mr-1" />
                    Canal
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {teacher.instagram && (
                      <a href={teacher.instagram} target="_blank" rel="noopener noreferrer" className="text-[#2a8e9e]">
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {teacher.twitter && (
                      <a href={teacher.twitter} target="_blank" rel="noopener noreferrer" className="text-[#2a8e9e]">
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {teacher.facebook && (
                      <a href={teacher.facebook} target="_blank" rel="noopener noreferrer" className="text-[#2a8e9e]">
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>{teacher.dataCadastro}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewDetails(teacher)}
                      className="border-[#2a8e9e] text-[#2a8e9e] hover:bg-[#e8f1f3]"
                    >
                      <ExternalLink size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(teacher)}
                      className="border-[#2a8e9e] text-[#2a8e9e] hover:bg-[#e8f1f3]"
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
              <TableCell colSpan={7} className="text-center py-8">
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
