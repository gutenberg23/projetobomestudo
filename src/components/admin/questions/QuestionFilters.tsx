
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterIcon, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface FiltersType {
  id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  discipline: string;
  level: string;
  difficulty: string;
  questionType: string;
}

interface QuestionFiltersProps {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  resetFilters: () => void;
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  resetFilters,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Função para atualizar a URL com os filtros
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    
    // Adicionar filtros não vazios à URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Atualizar a URL sem recarregar a página
    setSearchParams(params);
  };

  // Aplicar filtros na URL
  const applyFilters = () => {
    updateUrlWithFilters();
  };

  // Limpar filtros e URL
  const handleResetFilters = () => {
    resetFilters();
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FilterIcon className="h-4 w-4" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
          {showFilters && (
            <Button 
              variant="ghost" 
              onClick={handleResetFilters}
              className="ml-2"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
        {showFilters && (
          <Button 
            variant="default" 
            onClick={applyFilters}
            className="ml-2 bg-[#5f2ebe] text-white"
          >
            Aplicar Filtros
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="filter-id">ID</Label>
            <Input 
              id="filter-id" 
              value={filters.id} 
              onChange={(e) => setFilters({...filters, id: e.target.value})} 
              placeholder="Filtrar por ID" 
            />
          </div>
          <div>
            <Label htmlFor="filter-year">Ano</Label>
            <Input 
              id="filter-year" 
              value={filters.year} 
              onChange={(e) => setFilters({...filters, year: e.target.value})} 
              placeholder="Filtrar por Ano" 
            />
          </div>
          <div>
            <Label htmlFor="filter-institution">Banca</Label>
            <Input 
              id="filter-institution" 
              value={filters.institution} 
              onChange={(e) => setFilters({...filters, institution: e.target.value})} 
              placeholder="Filtrar por Banca" 
            />
          </div>
          <div>
            <Label htmlFor="filter-organization">Instituição</Label>
            <Input 
              id="filter-organization" 
              value={filters.organization} 
              onChange={(e) => setFilters({...filters, organization: e.target.value})} 
              placeholder="Filtrar por Instituição" 
            />
          </div>
          <div>
            <Label htmlFor="filter-role">Cargo</Label>
            <Input 
              id="filter-role" 
              value={filters.role} 
              onChange={(e) => setFilters({...filters, role: e.target.value})} 
              placeholder="Filtrar por Cargo" 
            />
          </div>
          <div>
            <Label htmlFor="filter-discipline">Disciplina</Label>
            <Input 
              id="filter-discipline" 
              value={filters.discipline} 
              onChange={(e) => setFilters({...filters, discipline: e.target.value})} 
              placeholder="Filtrar por Disciplina" 
            />
          </div>
          <div>
            <Label htmlFor="filter-level">Nível</Label>
            <Input 
              id="filter-level" 
              value={filters.level} 
              onChange={(e) => setFilters({...filters, level: e.target.value})} 
              placeholder="Filtrar por Nível" 
            />
          </div>
          <div>
            <Label htmlFor="filter-difficulty">Dificuldade</Label>
            <Input 
              id="filter-difficulty" 
              value={filters.difficulty} 
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})} 
              placeholder="Filtrar por Dificuldade" 
            />
          </div>
          <div>
            <Label htmlFor="filter-questionType">Tipo de Questão</Label>
            <Input 
              id="filter-questionType" 
              value={filters.questionType} 
              onChange={(e) => setFilters({...filters, questionType: e.target.value})} 
              placeholder="Filtrar por Tipo" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionFilters;
