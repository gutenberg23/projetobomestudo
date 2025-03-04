
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherFiltersState } from "./types";

interface TeacherFiltersProps {
  filtros: TeacherFiltersState;
  onChangeSearchTerm: (term: string) => void;
  onChangeStatusFilter: (status: string) => void;
  onChangeDisciplinaFilter: (disciplina: string) => void;
  onFilterSubmit: () => void;
  onAddNewTeacher: () => void;
  disciplinas: string[];
}

const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  filtros,
  onChangeSearchTerm,
  onChangeStatusFilter,
  onChangeDisciplinaFilter,
  onFilterSubmit,
  onAddNewTeacher,
  disciplinas
}) => {
  const [searchValue, setSearchValue] = useState(filtros.termoPesquisa);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeSearchTerm(searchValue);
    onFilterSubmit();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1 space-y-1">
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Buscar professor..."
            value={searchValue}
            onChange={handleSearchChange}
            className="border-[#2a8e9e]/30 focus-visible:ring-[#2a8e9e]"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-[#2a8e9e] hover:bg-[#2a8e9e]/90"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="w-full sm:w-auto">
          <Select
            value={filtros.filtroStatus}
            onValueChange={onChangeStatusFilter}
          >
            <SelectTrigger className="min-w-[180px] border-[#2a8e9e]/30 focus:ring-[#2a8e9e]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="aprovado">Aprovados</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="rejeitado">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={filtros.filtroDisciplina}
            onValueChange={onChangeDisciplinaFilter}
          >
            <SelectTrigger className="min-w-[180px] border-[#2a8e9e]/30 focus:ring-[#2a8e9e]">
              <SelectValue placeholder="Disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {disciplinas.map((disciplina) => (
                <SelectItem key={disciplina} value={disciplina}>
                  {disciplina}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          size="icon"
          onClick={onFilterSubmit}
          className="border-[#2a8e9e] text-[#2a8e9e] hover:bg-[#e8f1f3]"
        >
          <Filter className="h-4 w-4" />
        </Button>
        
        <Button 
          onClick={onAddNewTeacher}
          className="bg-[#2a8e9e] hover:bg-[#2a8e9e]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Professor
        </Button>
      </div>
    </div>
  );
};

export default TeacherFilters;
