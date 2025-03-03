
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash, Power } from "lucide-react";
import { Edital } from "./types";

interface EditaisTableProps {
  editais: Edital[];
  onToggleAtivo: (id: string) => void;
  onExcluir: (id: string) => void;
}

const EditaisTable: React.FC<EditaisTableProps> = ({ 
  editais, 
  onToggleAtivo, 
  onExcluir 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editais Verticalizados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>ID do Curso</TableHead>
                <TableHead>Disciplinas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editais.length > 0 ? (
                editais.map((edital) => (
                  <TableRow key={edital.id}>
                    <TableCell>{edital.id}</TableCell>
                    <TableCell>{edital.titulo}</TableCell>
                    <TableCell>{edital.cursoId}</TableCell>
                    <TableCell>{edital.disciplinasIds.length} disciplinas</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${edital.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {edital.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => onToggleAtivo(edital.id)}
                          title={edital.ativo ? "Desativar" : "Ativar"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => onExcluir(edital.id)}
                          title="Excluir"
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
                    Nenhum edital cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditaisTable;
