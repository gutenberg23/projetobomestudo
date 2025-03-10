
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterIcon, X } from "lucide-react";
import { FiltersType } from "./types";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";

interface QuestionFiltersProps {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  resetFilters: () => void;
  institutions: string[];
  organizations: string[];
  roles: string[];
  disciplines: string[];
  levels: string[];
  difficulties: string[];
  questionTypes: string[];
  years: string[];
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  resetFilters,
  institutions,
  organizations,
  roles,
  disciplines,
  levels,
  difficulties,
  questionTypes,
  years
}) => {
  const handleFilterChange = (field: keyof Omit<FiltersType, 'id'>, value: string) => {
    setFilters(prev => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
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
              onClick={resetFilters}
              className="ml-2"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
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
            <CheckboxGroup
              title=""
              options={years}
              selectedValues={filters.year}
              onChange={(value) => handleFilterChange('year', value)}
              placeholder="Filtrar por Ano"
            />
          </div>
          <div>
            <Label htmlFor="filter-institution">Banca</Label>
            <CheckboxGroup
              title=""
              options={institutions}
              selectedValues={filters.institution}
              onChange={(value) => handleFilterChange('institution', value)}
              placeholder="Filtrar por Banca"
            />
          </div>
          <div>
            <Label htmlFor="filter-organization">Instituição</Label>
            <CheckboxGroup
              title=""
              options={organizations}
              selectedValues={filters.organization}
              onChange={(value) => handleFilterChange('organization', value)}
              placeholder="Filtrar por Instituição"
            />
          </div>
          <div>
            <Label htmlFor="filter-role">Cargo</Label>
            <CheckboxGroup
              title=""
              options={roles}
              selectedValues={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              placeholder="Filtrar por Cargo"
            />
          </div>
          <div>
            <Label htmlFor="filter-discipline">Disciplina</Label>
            <CheckboxGroup
              title=""
              options={disciplines}
              selectedValues={filters.discipline}
              onChange={(value) => handleFilterChange('discipline', value)}
              placeholder="Filtrar por Disciplina"
            />
          </div>
          <div>
            <Label htmlFor="filter-level">Nível</Label>
            <CheckboxGroup
              title=""
              options={levels}
              selectedValues={filters.level}
              onChange={(value) => handleFilterChange('level', value)}
              placeholder="Filtrar por Nível"
            />
          </div>
          <div>
            <Label htmlFor="filter-difficulty">Dificuldade</Label>
            <CheckboxGroup
              title=""
              options={difficulties}
              selectedValues={filters.difficulty}
              onChange={(value) => handleFilterChange('difficulty', value)}
              placeholder="Filtrar por Dificuldade"
            />
          </div>
          <div>
            <Label htmlFor="filter-questionType">Tipo de Questão</Label>
            <CheckboxGroup
              title=""
              options={questionTypes}
              selectedValues={filters.questionType}
              onChange={(value) => handleFilterChange('questionType', value)}
              placeholder="Filtrar por Tipo"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionFilters;
