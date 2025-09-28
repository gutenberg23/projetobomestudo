import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuestionFiltersPanelCopy from "@/components/questions/QuestionFiltersPanelCopy";
import { supabase } from "@/integrations/supabase/client";

interface DisciplinaFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: { assuntos: string[]; topicos: string[]; disciplinas: string[]; bancas: string[] }, link: string, quantidadeQuestoes?: number) => void;
  initialAssuntos?: string[];
  initialTopicos?: string[];
  initialDisciplinas?: string[];
  initialBancas?: string[];
}

export const DisciplinaFiltersModal: React.FC<DisciplinaFiltersModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialAssuntos = [],
  initialTopicos = [],
  initialDisciplinas = [],
  initialBancas = []
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [tempFilters, setTempFilters] = useState({
    disciplines: Array.isArray(initialDisciplinas) ? initialDisciplinas : [],
    topics: Array.isArray(initialAssuntos) ? initialAssuntos : [],
    institutions: Array.isArray(initialBancas) ? initialBancas : [],
    organizations: [] as string[],
    roles: [] as string[],
    years: [] as string[],
    educationLevels: [] as string[],
    difficulty: [] as string[],
    subtopics: Array.isArray(initialTopicos) ? initialTopicos : []
  });
  const [filterOptions, setFilterOptions] = useState({
    disciplines: [] as string[],
    topics: [] as string[],
    institutions: [] as string[],
    organizations: [] as string[],
    roles: [] as string[],
    years: [] as string[],
    educationLevels: [] as string[],
    difficulty: [] as string[]
  });

  // Carregar opções de filtro
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Buscar todos os dados necessários para os filtros
        const { data, error } = await supabase
          .from('questoes')
          .select('discipline, assuntos, topicos, institution, organization, role, year, level, difficulty')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Extrair valores únicos para cada dropdown
        const institutions = [...new Set(data.map(q => q.institution).filter(Boolean))].sort();
        const organizations = [...new Set(data.map(q => q.organization).filter(Boolean))].sort();
        const roles = [...new Set(data.map(q => q.role).filter(Boolean))].sort();
        const disciplines = [...new Set(data.map(q => q.discipline).filter(Boolean))].sort();
        const levels = [...new Set(data.map(q => q.level).filter(Boolean))].sort();
        const years = [...new Set(data.map(q => q.year).filter(Boolean))].sort((a, b) => String(b).localeCompare(String(a)));
        const difficulties = [...new Set(data.map(q => q.difficulty).filter(Boolean))].sort();
        
        // Coletar todos os assuntos únicos
        const allSubjects = data.flatMap(q => Array.isArray(q.assuntos) ? q.assuntos : [])
          .filter(Boolean)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort();
        
        // Atualizar as opções de filtro
        setFilterOptions({
          disciplines,
          topics: allSubjects,
          institutions,
          organizations,
          roles,
          years,
          educationLevels: levels,
          difficulty: difficulties
        });
        
      } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
      }
    };
    
    if (isOpen) {
      fetchFilterOptions();
    }
  }, [isOpen]);

  // Atualizar filtros iniciais quando o modal abre
  useEffect(() => {
    if (isOpen) {
      const initialTopics = Array.isArray(initialAssuntos) ? initialAssuntos : [];
      const initialSubtopics = Array.isArray(initialTopicos) ? initialTopicos : [];
      const initialDisciplines = Array.isArray(initialDisciplinas) ? initialDisciplinas : [];
      const initialInstitutions = Array.isArray(initialBancas) ? initialBancas : [];
      
      setTempFilters({
        disciplines: initialDisciplines,
        topics: initialTopics,
        institutions: initialInstitutions,
        organizations: [],
        roles: [],
        years: [],
        educationLevels: [],
        difficulty: [],
        subtopics: initialSubtopics
      });

    }
  }, [isOpen, initialAssuntos, initialTopicos, initialDisciplinas, initialBancas]);

  const handleFilterChange = (
    category: "topics" | "disciplines" | "institutions" | "organizations" | "roles" | "years" | "educationLevels" | "difficulty" | "subtopics" | "reset_all",
    value: string
  ) => {
    setTempFilters(prev => {
      const newFilters = { ...prev };
      
      if (category === "reset_all") {
        return {
          disciplines: [],
          topics: [],
          institutions: [],
          organizations: [],
          roles: [],
          years: [],
          educationLevels: [],
          difficulty: [],
          subtopics: []
        };
      }
      
      // Garantir que a categoria exista como array
      if (!newFilters[category]) {
        newFilters[category] = [];
      }
      
      // Garantir que seja um array
      if (!Array.isArray(newFilters[category])) {
        newFilters[category] = [];
      }
      
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(item => item !== value);
      } else {
        newFilters[category] = [...newFilters[category], value];
      }
      
      return newFilters;
    });
  };

  // Função para contar questões com base nos filtros atuais
  const countQuestoes = async (filters: any) => {
    try {
      // Construir os filtros para a consulta
      let query = supabase.from('questoes').select('*', { count: 'exact' });
      
      if (filters.disciplines && filters.disciplines.length > 0) {
        query = query.in('discipline', filters.disciplines);
      }
      
      if (filters.topics && filters.topics.length > 0) {
        query = query.overlaps('assuntos', filters.topics);
      }
      
      if (filters.institutions && filters.institutions.length > 0) {
        query = query.in('institution', filters.institutions);
      }
      
      if (filters.subtopics && filters.subtopics.length > 0) {
        query = query.overlaps('topicos', filters.subtopics);
      }
      
      const { count, error } = await query;
      
      if (error) {
        console.error('Erro ao contar questões:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar questões:', error);
      return 0;
    }
  };

  const handleApplyFilters = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Contar as questões com os filtros atuais
    const quantidadeQuestoes = await countQuestoes(tempFilters);
    
    // Criar o link com os filtros aplicados
    const params = new URLSearchParams();
    
    if (tempFilters.disciplines.length > 0) {
      params.set('disciplines', JSON.stringify(tempFilters.disciplines));
    }
    
    if (tempFilters.topics.length > 0) {
      params.set('topics', JSON.stringify(tempFilters.topics));
    }
    
    if (tempFilters.institutions.length > 0) {
      params.set('institutions', JSON.stringify(tempFilters.institutions));
    }
    
    if (tempFilters.subtopics.length > 0) {
      params.set('subtopics', JSON.stringify(tempFilters.subtopics));
    }
    
    // Adicionar o parâmetro perPage para garantir consistência
    params.set('perPage', '10');
    
    const link = `/questions?${params.toString()}`;
    
    onApplyFilters({
      assuntos: tempFilters.topics,
      topicos: tempFilters.subtopics,
      disciplinas: tempFilters.disciplines,
      bancas: tempFilters.institutions
    }, link, quantidadeQuestoes);
    
    onClose();
  };

  // Prevenir o fechamento do modal ao clicar em elementos internos
  const handleContentClick = () => {
    // Removido stopPropagation para permitir interação com componentes internos
    // e.stopPropagation();
  };

  // Função para lidar com mudanças no fechamento do modal
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" onClick={handleContentClick}>
        <DialogHeader>
          <DialogTitle>Selecionar Filtros para o Tópico</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4" onClick={handleContentClick}>
          <QuestionFiltersPanelCopy
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilters={tempFilters}
            handleFilterChange={handleFilterChange}
            handleApplyFilters={() => {}}
            questionsPerPage="10"
            setQuestionsPerPage={() => {}}
            filterOptions={filterOptions}
            rightElement={<div></div>}
          />
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}>
              Cancelar
            </Button>
            <Button onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleApplyFilters(e);
            }}>
              Configurar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};