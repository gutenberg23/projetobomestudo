import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash, Search, Edit, ChevronDown, ChevronUp } from "lucide-react";
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
  onEditar: (disciplina: Disciplina) => void;
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
  onCriarEdital,
  onEditar
}) => {
  const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada).length > 0;
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Banca - Cargo</TableHead>
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
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>{disciplina.titulo}</TableCell>
                    <TableCell>{disciplina.descricao}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleExpand(disciplina.id)}
                          className="h-8 w-8"
                        >
                          {expandedRows[disciplina.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <span>
                          {expandedRows[disciplina.id]
                            ? disciplina.topicos.join(", ")
                            : `${disciplina.topicos.length} tópicos`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditar(disciplina)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onExcluir(disciplina.id)}
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
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 text-white"
          disabled={!disciplinasSelecionadas}
        >
          Criar Edital Verticalizado
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DisciplinasTable;
