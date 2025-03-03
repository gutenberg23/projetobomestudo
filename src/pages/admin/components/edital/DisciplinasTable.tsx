
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash } from "lucide-react";
import { Disciplina } from "./types";

interface DisciplinasTableProps {
  disciplinas: Disciplina[];
  todasSelecionadas: boolean;
  onToggleSelecaoTodas: () => void;
  onToggleSelecao: (id: string) => void;
  onExcluir: (id: string) => void;
  onCriarEdital: () => void;
}

const DisciplinasTable: React.FC<DisciplinasTableProps> = ({
  disciplinas,
  todasSelecionadas,
  onToggleSelecaoTodas,
  onToggleSelecao,
  onExcluir,
  onCriarEdital
}) => {
  const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disciplinas Cadastradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    checked={todasSelecionadas} 
                    onChange={onToggleSelecaoTodas}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tópicos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disciplinas.length > 0 ? (
                disciplinas.map((disciplina) => (
                  <TableRow key={disciplina.id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={disciplina.selecionada} 
                        onChange={() => onToggleSelecao(disciplina.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>{disciplina.id}</TableCell>
                    <TableCell>{disciplina.titulo}</TableCell>
                    <TableCell>{disciplina.descricao}</TableCell>
                    <TableCell>
                      {disciplina.topicos.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {disciplina.topicos.map((topico, index) => (
                            <li key={index}>{topico}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">Nenhum tópico</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onExcluir(disciplina.id)}
                        title="Excluir"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-[#67748a]">
                    Nenhuma disciplina cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onCriarEdital}
          className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white"
          disabled={!disciplinasSelecionadas}
        >
          Criar Edital Verticalizado
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DisciplinasTable;
