
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
import { Link, Trash, Power } from "lucide-react";
import { SimuladosTableProps } from "./SimuladosTypes";

export const SimuladosTable: React.FC<SimuladosTableProps> = ({
  simulados,
  handleToggleSelection,
  handleVincularCurso,
  handleToggleAtivo,
  handleExcluir,
  selectedSimulados
}) => {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <div className="flex items-center">
                <Checkbox 
                  checked={simulados.length > 0 && simulados.every(simulado => selectedSimulados.includes(simulado.id))}
                  onCheckedChange={() => {
                    if (simulados.every(simulado => selectedSimulados.includes(simulado.id))) {
                      simulados.forEach(simulado => handleToggleSelection(simulado.id));
                    } else {
                      simulados.forEach(simulado => {
                        if (!selectedSimulados.includes(simulado.id)) {
                          handleToggleSelection(simulado.id);
                        }
                      });
                    }
                  }}
                />
              </div>
            </TableHead>
            <TableHead className="w-[200px]">Título</TableHead>
            <TableHead className="w-[300px]">Descrição</TableHead>
            <TableHead className="w-[100px]">Nº de Questões</TableHead>
            <TableHead className="w-[100px]">Nº de Cursos</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[200px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {simulados.length > 0 ? (
            simulados.map((simulado) => (
              <TableRow key={simulado.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedSimulados.includes(simulado.id)} 
                    onCheckedChange={() => handleToggleSelection(simulado.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{simulado.titulo}</TableCell>
                <TableCell>{simulado.descricao}</TableCell>
                <TableCell>{simulado.questoesIds.length} questões</TableCell>
                <TableCell>{simulado.cursosIds.length} cursos</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${simulado.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {simulado.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleVincularCurso(simulado.id)} 
                      variant="outline" 
                      size="sm"
                      title="Vincular a um curso"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleToggleAtivo(simulado.id)} 
                      variant="outline" 
                      size="sm"
                      title={simulado.ativo ? "Desativar" : "Ativar"}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleExcluir(simulado.id)} 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      title="Excluir"
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
                Nenhum simulado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
