
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
import { TopicosTableProps } from "./TopicosTypes";

export const TopicosTable: React.FC<TopicosTableProps> = ({
  topicos,
  todosSelecionados,
  handleSelecaoTodos,
  handleSelecaoTopico,
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
                  id="selectAll"
                  checked={todosSelecionados} 
                  onCheckedChange={handleSelecaoTodos}
                />
              </div>
            </TableHead>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead className="w-[200px]">Título</TableHead>
            <TableHead className="w-[150px]">Disciplina</TableHead>
            <TableHead className="w-[150px]">Patrocinador</TableHead>
            <TableHead className="w-[150px]">Questões</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topicos.length > 0 ? (
            topicos.map((topico) => (
              <TableRow key={topico.id}>
                <TableCell>
                  <Checkbox 
                    id={`topico-${topico.id}`}
                    checked={topico.selecionado} 
                    onCheckedChange={() => handleSelecaoTopico(topico.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{topico.id}</TableCell>
                <TableCell>{topico.titulo}</TableCell>
                <TableCell>{topico.disciplina}</TableCell>
                <TableCell>{topico.patrocinador}</TableCell>
                <TableCell>{topico.questoesIds.length} questões</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => openEditModal(topico)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => openDeleteModal(topico)} 
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
              <TableCell colSpan={7} className="text-center py-4 text-[#67748a]">
                Nenhum tópico encontrado com os filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
