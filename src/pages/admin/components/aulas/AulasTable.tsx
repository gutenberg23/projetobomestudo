
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
import { AulasTableProps } from "./AulasTypes";

export const AulasTable: React.FC<AulasTableProps> = ({
  aulas,
  todasSelecionadas,
  handleSelecaoTodas,
  handleSelecaoAula,
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
            <TableHead className="w-[200px]">No Edital</TableHead>
            <TableHead className="w-[120px]">Nº de Tópicos</TableHead>
            <TableHead className="w-[120px]">Nº de Questões</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {aulas.length > 0 ? (
            aulas.map((aula) => (
              <TableRow key={aula.id}>
                <TableCell>
                  <Checkbox 
                    checked={aula.selecionada} 
                    onCheckedChange={() => handleSelecaoAula(aula.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{aula.id}</TableCell>
                <TableCell>{aula.titulo}</TableCell>
                <TableCell>{aula.descricao}</TableCell>
                <TableCell>{aula.topicosIds.length} tópicos</TableCell>
                <TableCell>{aula.totalQuestoes || aula.questoesIds.length} questões</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => openEditModal(aula)} 
                      variant="outline" 
                      size="sm"
                      className="w-auto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => openDeleteModal(aula)} 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 w-auto"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-[#67748a]">
                Nenhuma aula encontrada com os filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
