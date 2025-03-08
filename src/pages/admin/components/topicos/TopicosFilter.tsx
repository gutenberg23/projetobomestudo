
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface TopicosFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  disciplinaFiltro: string;
  setDisciplinaFiltro: (disciplina: string) => void;
  professorFiltro: string;
  setProfessorFiltro: (professor: string) => void;
}

export const TopicosFilter: React.FC<TopicosFilterProps> = ({
  searchTerm,
  setSearchTerm,
  disciplinaFiltro,
  setDisciplinaFiltro,
  professorFiltro,
  setProfessorFiltro
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-lg font-medium mb-3 text-[#272f3c]">Filtros</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search" className="text-[#67748a]">Buscar por título</Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div>
          <Label htmlFor="disciplina-filtro" className="text-[#67748a]">Disciplina</Label>
          <Input
            id="disciplina-filtro"
            placeholder="Digite para filtrar por disciplina..."
            value={disciplinaFiltro}
            onChange={(e) => setDisciplinaFiltro(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="professor-filtro" className="text-[#67748a]">Professor</Label>
          <Input
            id="professor-filtro"
            placeholder="Digite para filtrar por professor..."
            value={professorFiltro}
            onChange={(e) => setProfessorFiltro(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
