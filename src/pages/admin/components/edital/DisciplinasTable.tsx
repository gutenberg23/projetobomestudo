
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash, Search } from "lucide-react";
import { Disciplina } from "./types";

interface DisciplinasTableProps {
  disciplinas: Disciplina[];
  filteredDisciplinas: Disciplina[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  todasSelecionadas: boolean;
  onToggleSelecaoTodas: () => void;
  onToggleSelecao: (id: string) => void;
  onExcluir: (id: string) => void;
  onCriarEdital: () => void;
}

const DisciplinasTable: React.FC<DisciplinasTableProps> = ({
  disciplinas,
  filteredDisciplinas,
  searchTerm,
  onSearchChange,
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
        <div className="mb-4 relative">
          <Input
            placeholder="Pesquisar por título ou tópico..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
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
              {filteredDisciplinas.length > 0 ? (
                filteredDisciplinas.map((disciplina) => (
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
                    {searchTerm ? "Nenhuma disciplina encontrada com os critérios de busca." : "Nenhuma disciplina cadastrada."}
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
