import React, { Dispatch, SetStateAction } from "react";
import { ChevronDown, ChevronUp, Filter, XCircle, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { Filters } from './types';

interface QuestionFiltersProps {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  resetFilters: () => void;
  handleClearAllQuestionStats: () => Promise<void>;
  dropdownData: {
    years: string[];
    institutions: string[];
    organizations: string[];
    roles: string[];
    disciplines: string[];
    levels: string[];
    difficulties: string[];
    questionTypes: string[];
  };
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  resetFilters,
  handleClearAllQuestionStats,
  dropdownData
}) => {
  const handleChangeFilter = (
    filterKey: keyof Filters,
    value: string
  ) => {
    const currentValues = filters[filterKey].value ? filters[filterKey].value.split(',').filter(v => v !== '') : [];
    const newValues = currentValues.includes(value) 
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
      
    setFilters((prev) => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        value: newValues.join(','),
        isActive: true
      },
    }));
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {handleClearAllQuestionStats && (
            <Button
              variant="outline"
              onClick={handleClearAllQuestionStats}
              className="flex items-center gap-2 border-amber-500 text-amber-500 hover:bg-amber-50"
            >
              <Eraser className="h-4 w-4" />
              Limpar Todas Estatísticas
            </Button>
          )}
        </div>
        
        {showFilters && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
          <CheckboxGroup 
            title="Disciplina" 
            options={dropdownData.disciplines} 
            selectedValues={filters.disciplina.value ? filters.disciplina.value.split(',').filter(d => d !== '') : []} 
            onChange={value => handleChangeFilter("disciplina", value)} 
          />
          
          <CheckboxGroup 
            title="Nível" 
            options={dropdownData.levels} 
            selectedValues={filters.nivel.value ? filters.nivel.value.split(',').filter(l => l !== '') : []} 
            onChange={value => handleChangeFilter("nivel", value)} 
          />
          
          <CheckboxGroup 
            title="Banca" 
            options={dropdownData.institutions} 
            selectedValues={filters.institution.value ? filters.institution.value.split(',').filter(i => i !== '') : []} 
            onChange={value => handleChangeFilter("institution", value)} 
          />
          
          <CheckboxGroup 
            title="Órgão" 
            options={dropdownData.organizations} 
            selectedValues={filters.organization.value ? filters.organization.value.split(',').filter(o => o !== '') : []} 
            onChange={value => handleChangeFilter("organization", value)} 
          />
          
          <CheckboxGroup 
            title="Cargo" 
            options={dropdownData.roles} 
            selectedValues={filters.role.value ? filters.role.value.split(',').filter(r => r !== '') : []} 
            onChange={value => handleChangeFilter("role", value)} 
          />
          
          <CheckboxGroup 
            title="Ano" 
            options={dropdownData.years} 
            selectedValues={filters.ano.value ? filters.ano.value.split(',').filter(a => a !== '') : []} 
            onChange={value => handleChangeFilter("ano", value)} 
          />
          
          <CheckboxGroup 
            title="Dificuldade" 
            options={dropdownData.difficulties} 
            selectedValues={filters.dificuldade.value ? filters.dificuldade.value.split(',').filter(d => d !== '') : []} 
            onChange={value => handleChangeFilter("dificuldade", value)} 
          />
          
          <CheckboxGroup 
            title="Tipo de Questão" 
            options={dropdownData.questionTypes} 
            selectedValues={filters.questionType.value ? filters.questionType.value.split(',').filter(t => t !== '') : []} 
            onChange={value => handleChangeFilter("questionType", value)} 
          />
        </div>
      )}
    </div>
  );
};

export default QuestionFilters;
