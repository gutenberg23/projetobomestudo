
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface QuestionListSummaryProps {
  count: number;
  hasFilters: boolean;
  selectedFilters: {
    disciplines: string[];
    topics: string[];
    institutions: string[];
    organizations: string[];
    roles: string[];
    years: string[];
    educationLevels: string[];
  };
  onRemoveFilter: (category: string, value: string) => void;
  searchQuery?: string;
  onClearSearchQuery?: () => void;
}

const QuestionListSummary: React.FC<QuestionListSummaryProps> = ({
  count,
  hasFilters,
  selectedFilters,
  onRemoveFilter,
  searchQuery,
  onClearSearchQuery
}) => {
  // Função para formatar o nome da categoria
  const formatCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      disciplines: "Disciplina",
      topics: "Tópico",
      institutions: "Banca",
      organizations: "Instituição",
      roles: "Cargo",
      years: "Ano",
      educationLevels: "Escolaridade"
    };
    
    return categoryMap[category] || category;
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <strong>{count}</strong> questões
          {hasFilters && " com filtros aplicados"}
        </p>
      </div>
      
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {/* Mostrar o termo de pesquisa como tag se existir */}
          {searchQuery && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 bg-gray-100"
            >
              <span>Pesquisa: {searchQuery}</span>
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={onClearSearchQuery} 
              />
            </Badge>
          )}
          
          {/* Mapear todos os filtros selecionados como tags */}
          {Object.entries(selectedFilters).map(([category, values]) => 
            values.map((value) => (
              <Badge 
                key={`${category}-${value}`} 
                variant="secondary"
                className="flex items-center gap-1 bg-gray-100"
              >
                <span>{formatCategoryName(category)}: {value}</span>
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => onRemoveFilter(category, value)} 
                />
              </Badge>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionListSummary;
