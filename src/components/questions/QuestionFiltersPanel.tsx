
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { useSearchParams, useNavigate } from "react-router-dom";

interface QuestionFiltersPanelProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedFilters: {
    disciplines: string[];
    topics: string[];
    institutions: string[];
    organizations: string[];
    roles: string[];
    years: string[];
    educationLevels: string[];
  };
  handleFilterChange: (category: string, value: string) => void;
  handleApplyFilters: () => void;
  questionsPerPage: string;
  setQuestionsPerPage: (value: string) => void;
  filterOptions: {
    disciplines: string[];
    topics: string[];
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Ordenar todas as listas de opções em ordem alfabética
  const sortedOptions = {
    disciplines: [...filterOptions.disciplines].sort((a, b) => a.localeCompare(b)),
    topics: [...filterOptions.topics].sort((a, b) => a.localeCompare(b)),
    institutions: [...filterOptions.institutions].sort((a, b) => a.localeCompare(b)),
    organizations: [...filterOptions.organizations].sort((a, b) => a.localeCompare(b)),
    roles: [...filterOptions.roles].sort((a, b) => a.localeCompare(b)),
    years: [...filterOptions.years].sort((a, b) => b.localeCompare(a)), // Anos em ordem decrescente
    educationLevels: [...filterOptions.educationLevels].sort((a, b) => a.localeCompare(b))
  };

  // Atualizar a URL com os filtros selecionados
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    
    // Adicionar consulta de pesquisa
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    // Adicionar filtros selecionados
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length) {
        params.set(key, values.join(','));
      }
    });
    
    // Adicionar questões por página
    params.set('perPage', questionsPerPage);
    
    // Atualizar a URL sem recarregar a página
    setSearchParams(params);
  };

  // Aplicar filtros e atualizar URL
  const applyFiltersWithUrl = () => {
    updateUrlWithFilters();
    handleApplyFilters();
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="relative w-full">
          <Input 
            type="text" 
            placeholder="Pesquisar palavras-chave..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pr-10 w-full" 
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <CheckboxGroup 
          title="Disciplina" 
          options={sortedOptions.disciplines} 
          selectedValues={selectedFilters.disciplines} 
          onChange={value => handleFilterChange("disciplines", value)} 
        />
        
        <CheckboxGroup 
          title="Tópico" 
          options={sortedOptions.topics} 
          selectedValues={selectedFilters.topics} 
          onChange={value => handleFilterChange("topics", value)} 
        />
        
        <CheckboxGroup 
          title="Banca" 
          options={sortedOptions.institutions} 
          selectedValues={selectedFilters.institutions} 
          onChange={value => handleFilterChange("institutions", value)} 
        />
        
        <CheckboxGroup 
          title="Instituição" 
          options={sortedOptions.organizations} 
          selectedValues={selectedFilters.organizations} 
          onChange={value => handleFilterChange("organizations", value)} 
        />
        
        <CheckboxGroup 
          title="Cargo" 
          options={sortedOptions.roles} 
          selectedValues={selectedFilters.roles} 
          onChange={value => handleFilterChange("roles", value)} 
        />
        
        <CheckboxGroup 
          title="Ano" 
          options={sortedOptions.years} 
          selectedValues={selectedFilters.years} 
          onChange={value => handleFilterChange("years", value)} 
        />
        
        <CheckboxGroup 
          title="Escolaridade" 
          options={sortedOptions.educationLevels} 
          selectedValues={selectedFilters.educationLevels} 
          onChange={value => handleFilterChange("educationLevels", value)} 
        />
        
        <div className="flex items-center gap-4">
          <span className="text-sm whitespace-nowrap">Questões por página:</span>
          <Select value={questionsPerPage} onValueChange={value => setQuestionsPerPage(value)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={applyFiltersWithUrl} className="w-full text-white bg-[#5f2ebe]">
        Filtrar Questões
      </Button>
    </div>
  );
};

export default QuestionFiltersPanel;
