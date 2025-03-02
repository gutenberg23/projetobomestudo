
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash } from "lucide-react";
import { DisciplinasTableProps } from "./DisciplinasTypes";

export const DisciplinasTable: React.FC<DisciplinasTableProps> = ({
  disciplinas,
  todasSelecionadas,
  handleSelecaoTodas,
  handleSelecaoDisciplina,
  openEditModal,
  openDeleteModal
}) => {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <div className="flex items-center">
                <Checkbox 
                  checked={todasSelecionadas} 
                  onCheckedChange={handleSelecaoTodas}
                />
              </div>
            </TableHead>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead className="w-[200px]">Título</TableHead>
            <TableHead className="w-[200px]">Descrição</TableHead>
            <TableHead className="w-[120px]">Nº de Aulas</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disciplinas.length > 0 ? (
            disciplinas.map((disciplina) => (
              <TableRow key={disciplina.id}>
                <TableCell>
                  <Checkbox 
                    checked={disciplina.selecionada} 
                    onCheckedChange={() => handleSelecaoDisciplina(disciplina.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{disciplina.id}</TableCell>
                <TableCell>{disciplina.titulo}</TableCell>
                <TableCell>{disciplina.descricao}</TableCell>
                <TableCell>{disciplina.aulasIds.length} aulas</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => openEditModal(disciplina)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => openDeleteModal(disciplina)} 
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
              <TableCell colSpan={6} className="text-center py-4 text-[#67748a]">
                Nenhuma disciplina encontrada com os filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
