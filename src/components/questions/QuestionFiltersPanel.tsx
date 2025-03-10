
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckboxGroup } from "./CheckboxGroup";

interface TopicOption {
  id: string;
  name: string;
  parent?: string;
  level: number;
}

interface QuestionFiltersPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilters: {
    disciplines: string[];
    topics: string[];
    institutions: string[];
    organizations: string[];
    roles: string[];
    years: string[];
    educationLevels: string[];
  };
  handleFilterChange: (category: keyof typeof selectedFilters, value: string) => void;
  handleApplyFilters: () => void;
  questionsPerPage: string;
  setQuestionsPerPage: (value: string) => void;
  filterOptions: {
    disciplines: string[];
    topics: TopicOption[] | string[];
    institutions: string[];
    organizations: string[];
    roles: string[];
    years: string[];
    educationLevels: string[];
  };
}

const QuestionFiltersPanel: React.FC<QuestionFiltersPanelProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilters,
  handleFilterChange,
  handleApplyFilters,
  questionsPerPage,
  setQuestionsPerPage,
  filterOptions
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Pesquisar questões..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="text-[#5f2ebe] border-[#5f2ebe] hover:bg-[#5f2ebe] hover:text-white"
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
          
          <Button 
            onClick={handleApplyFilters}
            className="bg-[#5f2ebe] hover:bg-[#4f24a0]"
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-md shadow">
          <div>
            <CheckboxGroup
              title="Disciplinas"
              options={filterOptions.disciplines}
              selectedValues={selectedFilters.disciplines}
              onChange={(value) => handleFilterChange('disciplines', value)}
              placeholder="Selecione as disciplinas"
            />
          </div>
          
          <div>
            <CheckboxGroup
              title="Tópicos"
              options={filterOptions.topics}
              selectedValues={selectedFilters.topics}
              onChange={(value) => handleFilterChange('topics', value)}
              placeholder="Selecione os tópicos"
              hierarchical={true}
            />
          </div>
          
          <div>
            <CheckboxGroup
              title="Bancas"
              options={filterOptions.institutions}
              selectedValues={selectedFilters.institutions}
              onChange={(value) => handleFilterChange('institutions', value)}
              placeholder="Selecione as bancas"
            />
          </div>
          
          <div>
            <CheckboxGroup
              title="Instituições"
              options={filterOptions.organizations}
              selectedValues={selectedFilters.organizations}
              onChange={(value) => handleFilterChange('organizations', value)}
              placeholder="Selecione as instituições"
            />
          </div>
          
          <div>
            <CheckboxGroup
              title="Cargos"
              options={filterOptions.roles}
              selectedValues={selectedFilters.roles}
              onChange={(value) => handleFilterChange('roles', value)}
              placeholder="Selecione os cargos"
            />
          </div>
          
          <div>
            <CheckboxGroup
              title="Anos"
              options={filterOptions.years}
              selectedValues={selectedFilters.years}
              onChange={(value) => handleFilterChange('years', value)}
              placeholder="Selecione os anos"
            />
          </div>
          
          <div>
            <CheckboxGroup
              title="Nível de Escolaridade"
              options={filterOptions.educationLevels}
              selectedValues={selectedFilters.educationLevels}
              onChange={(value) => handleFilterChange('educationLevels', value)}
              placeholder="Selecione os níveis"
            />
          </div>
          
          <div className="flex flex-col">
            <span className="font-medium text-sm mb-1">Questões por página</span>
            <select
              value={questionsPerPage}
              onChange={(e) => setQuestionsPerPage(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      )}
      
      <Separator />
    </div>
  );
};

export default QuestionFiltersPanel;
