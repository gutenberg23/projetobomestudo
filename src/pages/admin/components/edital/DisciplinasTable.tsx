import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash, Search, ChevronDown, ChevronUp, Pencil, Link as LinkIcon } from "lucide-react";
import { Disciplina } from "@/types/edital";
import DisciplinaForm from "./DisciplinaForm";
import { Pagination } from "@/components/ui/pagination";

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
  onEditDisciplina: (disciplina: Disciplina) => void;
}

const ITEMS_PER_PAGE = 20;

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
  onEditDisciplina
}) => {
  const disciplinasSelecionadas = disciplinas.filter(d => d.selecionada).length > 0;
  const [topicosExpandidos, setTopicosExpandidos] = useState<{ [key: string]: boolean }>({});
  const [disciplinaParaEditar, setDisciplinaParaEditar] = useState<Disciplina | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredDisciplinas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDisciplinas = filteredDisciplinas.slice(startIndex, endIndex);

  const toggleTopicos = (disciplinaId: string) => {
    setTopicosExpandidos(prev => ({
      ...prev,
      [disciplinaId]: !prev[disciplinaId]
    }));
  };

  const handleEditDisciplina = (disciplina: Disciplina) => {
    onEditDisciplina(disciplina);
    setDisciplinaParaEditar(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
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
                <TableHead>Disciplina</TableHead>
                <TableHead>Órgão-Cargo</TableHead>
                <TableHead>Tópicos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDisciplinas.length > 0 ? (
                currentDisciplinas.map((disciplina) => (
                  <React.Fragment key={disciplina.id}>
                    <TableRow>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={disciplina.selecionada} 
                          onChange={() => onToggleSelecao(disciplina.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>{disciplina.titulo}</TableCell>
                      <TableCell>{disciplina.descricao}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{disciplina.topicos.length} tópicos</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTopicos(disciplina.id)}
                            className="h-8 w-8 p-0"
                          >
                            {topicosExpandidos[disciplina.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setDisciplinaParaEditar(disciplina)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
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
                    {topicosExpandidos[disciplina.id] && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <ul className="list-disc pl-5 space-y-2">
                              {disciplina.topicos.map((topico, index) => (
                                <li key={index} className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>{topico}</span>
                                    {disciplina.links[index] && (
                                      <a 
                                        href={disciplina.links[index]} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                      >
                                        <LinkIcon className="h-4 w-4" />
                                      </a>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-[#67748a]">
                    {searchTerm ? "Nenhuma disciplina encontrada com os critérios de busca." : "Nenhuma disciplina cadastrada."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredDisciplinas.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredDisciplinas.length}
              />
            </div>
          )}
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

      {disciplinaParaEditar && (
        <div className="mt-6">
          <DisciplinaForm
            onAddDisciplina={() => {}}
            onEditDisciplina={handleEditDisciplina}
            disciplinaParaEditar={disciplinaParaEditar}
          />
        </div>
      )}
    </>
  );
};

export default DisciplinasTable;
