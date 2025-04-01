import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link, Trash, Power, Edit, ExternalLink } from "lucide-react";
import { SimuladosTableProps } from "./SimuladosTypes";
import EditarSimuladoModal from "./EditarSimuladoModal";
import { supabase } from "@/integrations/supabase/client";

export const SimuladosTable: React.FC<SimuladosTableProps> = ({
  simulados,
  handleToggleAtivo,
  handleExcluir
}) => {
  const [editingSimuladoId, setEditingSimuladoId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("simulados")
        .update({ ativo: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      handleToggleAtivo(id);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
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
                    <a href={`/simulado/${simulado.id}`} target="_blank" rel="noopener noreferrer">
                      <Button 
                        variant="outline" 
                        size="sm"
                        title="Visualizar simulado"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button 
                      onClick={() => handleToggleStatus(simulado.id, simulado.ativo)} 
                      variant="outline" 
                      size="sm"
                      title={simulado.ativo ? "Desativar" : "Ativar"}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => setEditingSimuladoId(simulado.id)} 
                      variant="outline" 
                      size="sm"
                      title="Editar Simulado"
                    >
                      <Edit className="h-4 w-4" />
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
              <TableCell colSpan={6} className="text-center py-4 text-[#67748a]">
                Nenhum simulado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <EditarSimuladoModal
        isOpen={editingSimuladoId !== null}
        onClose={() => setEditingSimuladoId(null)}
        simuladoId={editingSimuladoId || ""}
      />
    </div>
  );
};
