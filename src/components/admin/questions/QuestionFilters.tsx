import React, { Dispatch, SetStateAction } from "react";
import { ChevronDown, ChevronUp, Filter, XCircle, Eraser, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { Filters } from './types';
import { Input } from "@/components/ui/input";

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
    topicos: string[];
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
  const handleCheckboxChange = (
    filterKey: keyof Filters,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => {
      const currentValues = prev[filterKey].value
        ? prev[filterKey].value.split(",")
        : [];
      let newValues: string[];

      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((v) => v !== value);
      }

      return {
        ...prev,
        [filterKey]: {
          ...prev[filterKey],
          value: newValues.join(","),
          isActive: newValues.length > 0,
        },
      };
    });
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      conteudo: {
        ...prev.conteudo,
        value,
        isActive: value.length > 0,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar no conteúdo das questões..."
          value={filters.conteudo.value || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

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
        
        {(Object.values(filters).some(f => f.isActive)) && (
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
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <CheckboxGroup 
              title="Disciplina" 
              options={dropdownData.disciplines} 
              selectedValues={filters.disciplina.value ? filters.disciplina.value.split(',').filter(d => d !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("disciplina", value, checked)} 
            />
            
            <CheckboxGroup 
              title="Nível" 
              options={dropdownData.levels} 
              selectedValues={filters.nivel.value ? filters.nivel.value.split(',').filter(l => l !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("nivel", value, checked)} 
            />
            
            <CheckboxGroup 
              title="Banca" 
              options={dropdownData.institutions} 
              selectedValues={filters.institution.value ? filters.institution.value.split(',').filter(i => i !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("institution", value, checked)} 
            />
            
            <CheckboxGroup 
              title="Órgão" 
              options={dropdownData.organizations} 
              selectedValues={filters.organization.value ? filters.organization.value.split(',').filter(o => o !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("organization", value, checked)} 
            />
            
            <CheckboxGroup 
              title="Cargo" 
              options={dropdownData.roles} 
              selectedValues={filters.role.value ? filters.role.value.split(',').filter(r => r !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("role", value, checked)} 
            />
            
            <CheckboxGroup 
              title="Ano" 
              options={dropdownData.years} 
              selectedValues={filters.ano.value ? filters.ano.value.split(',').filter(a => a !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("ano", value, checked)} 
            />
            
            <CheckboxGroup 
              title="Dificuldade" 
              options={dropdownData.difficulties} 
              selectedValues={filters.dificuldade.value ? filters.dificuldade.value.split(',').filter(d => d !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("dificuldade", value, checked)} 
            />
            
            <CheckboxGroup 
              title="Tipo de Questão" 
              options={dropdownData.questionTypes} 
              selectedValues={filters.questionType.value ? filters.questionType.value.split(',').filter(t => t !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("questionType", value, checked)} 
            />

            <CheckboxGroup 
              title="Assuntos" 
              options={dropdownData.topicos} 
              selectedValues={filters.topicos.value ? filters.topicos.value.split(',').filter(t => t !== '') : []} 
              onChange={(value, checked) => handleCheckboxChange("topicos", value, checked)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionFilters;
