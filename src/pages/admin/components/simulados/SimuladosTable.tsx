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
import { Link, Trash, Power, Edit, ExternalLink, Search } from "lucide-react";
import { SimuladosTableProps } from "./SimuladosTypes";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 20;

const SimuladosTable: React.FC<SimuladosTableProps> = ({
  simulados,
  handleVincularCurso,
  handleToggleAtivo,
  handleExcluir
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar simulados pelo título
  const filteredSimulados = simulados.filter(simulado =>
    simulado.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginação
  const totalPages = Math.ceil(filteredSimulados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSimulados = filteredSimulados.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por título..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Resetar para primeira página ao pesquisar
            }}
            className="pl-8"
          />
        </div>
      </div>

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
            {currentSimulados.length > 0 ? (
              currentSimulados.map((simulado) => (
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
                <TableCell colSpan={6} className="text-center py-4 text-[#67748a]">
                  {searchTerm ? "Nenhum simulado encontrado para esta pesquisa." : "Nenhum simulado encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredSimulados.length > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export { SimuladosTable };
