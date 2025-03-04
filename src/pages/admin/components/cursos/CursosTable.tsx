
import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Heart } from "lucide-react";
import { CursosTableProps } from "./CursosTypes";

export const CursosTable: React.FC<CursosTableProps> = ({
  cursos,
  openEditModal,
  openDeleteModal
}) => {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead className="w-[200px]">Título</TableHead>
            <TableHead className="w-[200px]">Descrição</TableHead>
            <TableHead className="w-[120px]">Nº de Disciplinas</TableHead>
            <TableHead className="w-[120px]">Nº de Aulas</TableHead>
            <TableHead className="w-[120px]">Nº de Tópicos</TableHead>
            <TableHead className="w-[120px]">Nº de Questões</TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-[#ea2be2]" />
                Favoritos
              </div>
            </TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cursos.length > 0 ? (
            cursos.map((curso) => (
              <TableRow key={curso.id}>
                <TableCell className="font-medium">{curso.id}</TableCell>
                <TableCell>{curso.titulo}</TableCell>
                <TableCell>{curso.descricao}</TableCell>
                <TableCell>{curso.disciplinasIds.length} disciplinas</TableCell>
                <TableCell>{curso.aulasIds?.length || 0} aulas</TableCell>
                <TableCell>{curso.topicosIds?.length || 0} tópicos</TableCell>
                <TableCell>{curso.questoesIds?.length || 0} questões</TableCell>
                <TableCell>{curso.favoritos || 0}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => openEditModal(curso)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => openDeleteModal(curso)} 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-[#67748a]">
                Nenhum curso encontrado com os filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
