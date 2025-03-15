
import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import QuestionFiltersPanel from "@/components/questions/QuestionFiltersPanel";
import QuestionResults from "@/components/questions/QuestionResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

const Questions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    disciplines: [] as string[],
    topics: [] as string[],
    institutions: [] as string[],
    organizations: [] as string[],
    roles: [] as string[],
    years: [] as string[],
    educationLevels: [] as string[]
  });
  const [questionsPerPage, setQuestionsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    disciplines: [] as string[],
    topics: [] as string[],
    institutions: [] as string[],
    organizations: [] as string[],
    roles: [] as string[],
    years: [] as string[],
    educationLevels: [] as string[]
  });
  
  const totalQuestions = questions.length;
  
  // Função para converter options do banco para o formato esperado
  const parseOptions = (options: Json | null): any[] => {
    if (!options) return [];
    
    // Verificar se options é um array
    if (Array.isArray(options)) {
      return options.map((option: any) => ({
        id: option.id || `option-${Math.random().toString(36).substr(2, 9)}`,
        text: option.text || '',
        isCorrect: Boolean(option.isCorrect)
      }));
    }
    
    return [];
  };

  // Buscar questões do banco de dados
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Buscar todas as questões
        const { data, error } = await supabase
          .from('questoes')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Transformar os dados para o formato esperado pelo componente
        const formattedQuestions = data.map(q => ({
          id: q.id,
          year: q.year,
          institution: q.institution,
          organization: q.organization,
          role: q.role,
          discipline: q.discipline,
          level: q.level,
          difficulty: q.difficulty,
          questionType: q.questiontype,
          content: q.content,
          teacherExplanation: q.teacherexplanation,
          aiExplanation: q.aiexplanation || "",
          expandableContent: q.expandablecontent || "",
          options: parseOptions(q.options),
          topicos: Array.isArray(q.topicos) ? q.topicos : []
        }));
        
        setQuestions(formattedQuestions);
        
        // Extrair valores únicos para cada dropdown
        const institutions = [...new Set(data.map(q => q.institution).filter(Boolean))].sort();
        const organizations = [...new Set(data.map(q => q.organization).filter(Boolean))].sort();
        const roles = [...new Set(data.map(q => q.role).filter(Boolean))].sort();
        const disciplines = [...new Set(data.map(q => q.discipline).filter(Boolean))].sort();
        const levels = [...new Set(data.map(q => q.level).filter(Boolean))].sort();
        const years = [...new Set(data.map(q => q.year).filter(Boolean))].sort((a, b) => b.localeCompare(a));
        
        // Coletar todos os tópicos únicos
        const allTopics = data.flatMap(q => q.topicos || [])
          .filter(Boolean)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort();
        
        // Atualizar as opções de filtro
        setFilterOptions({
          disciplines,
          topics: allTopics,
          institutions,
          organizations,
          roles,
          years,
          educationLevels: ['Médio', 'Superior', 'Pós-graduação'] // Mantém esses valores padrão pois não estão no banco
        });
        
      } catch (error) {
        console.error('Erro ao carregar questões:', error);
        toast.error('Erro ao carregar questões. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  const handleToggleDisabled = (optionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDisabledOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId) 
        : [...prev, optionId]
    );
  };
  
  const handleFilterChange = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[category];
      return {
        ...prev,
        [category]: currentValues.includes(value) 
          ? currentValues.filter(item => item !== value) 
          : [...currentValues, value]
      };
    });
  };
  
  const handleApplyFilters = () => {
    setCurrentPage(1);
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Filtrar as questões com base nos filtros selecionados
  const filteredQuestions = questions.filter(question => {
    // Filtrar por texto de pesquisa
    if (searchQuery && !question.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Aplicar filtros de seleção
    if (selectedFilters.disciplines.length > 0 && !selectedFilters.disciplines.includes(question.discipline)) {
      return false;
    }
    
    if (selectedFilters.institutions.length > 0 && !selectedFilters.institutions.includes(question.institution)) {
      return false;
    }
    
    if (selectedFilters.organizations.length > 0 && !selectedFilters.organizations.includes(question.organization)) {
      return false;
    }
    
    if (selectedFilters.roles.length > 0 && !selectedFilters.roles.includes(question.role)) {
      return false;
    }
    
    if (selectedFilters.years.length > 0 && !selectedFilters.years.includes(question.year)) {
      return false;
    }
    
    if (selectedFilters.educationLevels.length > 0 && !selectedFilters.educationLevels.includes(question.level)) {
      return false;
    }
    
    // Filtrar por tópicos
    if (selectedFilters.topics.length > 0) {
      const hasMatchingTopic = question.topicos.some((topico: string) => 
        selectedFilters.topics.includes(topico)
      );
      if (!hasMatchingTopic) {
        return false;
      }
    }
    
    return true;
  });

  // Cálculo para paginação
  const totalPages = Math.ceil(filteredQuestions.length / parseInt(questionsPerPage));
  
  // Paginação
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * parseInt(questionsPerPage),
    currentPage * parseInt(questionsPerPage)
  );
  
  const hasFilters = Object.values(selectedFilters).some(arr => arr.length > 0);
  
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 mx-auto w-full">
        <h1 className="text-2xl mb-6 text-[#262f3c] font-extrabold md:text-3xl">Questões</h1>

        <QuestionFiltersPanel 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilters={selectedFilters}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={handleApplyFilters}
          questionsPerPage={questionsPerPage}
          setQuestionsPerPage={setQuestionsPerPage}
          filterOptions={filterOptions}
        />

        <QuestionResults 
          questions={paginatedQuestions}
          disabledOptions={disabledOptions}
          onToggleDisabled={handleToggleDisabled}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          hasFilters={hasFilters}
          loading={loading}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Questions;
