'use client';

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import QuestionFiltersPanel from "@/components/questions/QuestionFiltersPanel";
import QuestionResults from "@/components/questions/QuestionResults";
import { ScoreCounter } from "@/components/questions/ScoreCounter";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Questions = () => {
  const [searchParams] = useSearchParams();
  const [showScoreCounter, setShowScoreCounter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    disciplines: [] as string[],
    topics: [] as string[],
    institutions: [] as string[],
    organizations: [] as string[],
    roles: [] as string[],
    years: [] as string[],
    educationLevels: [] as string[],
    difficulty: [] as string[]
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
    educationLevels: [] as string[],
    difficulty: [] as string[]
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

  // Carregar filtros a partir da URL
  useEffect(() => {
    // Função para analisar parâmetros da URL
    const parseUrlParams = () => {
      // Obter filtros da URL
      const querySearch = searchParams.get('q') || '';
      setSearchQuery(querySearch);
      
      // Configurar número de questões por página
      const perPage = searchParams.get('perPage');
      if (perPage && ['5', '10', '20', '50', '100'].includes(perPage)) {
        setQuestionsPerPage(perPage);
      }
      
      // Configurar filtros selecionados
      const newFilters = { ...selectedFilters };
      
      Object.keys(selectedFilters).forEach(key => {
        const param = searchParams.get(key);
        if (param) {
          newFilters[key as keyof typeof selectedFilters] = param.split(',');
        } else {
          newFilters[key as keyof typeof selectedFilters] = [];
        }
      });
      
      setSelectedFilters(newFilters);
    };
    
    parseUrlParams();
  }, [searchParams]);

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
        const difficulties = [...new Set(data.map(q => q.difficulty).filter(Boolean))].sort();
        
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
          educationLevels: levels,
          difficulty: difficulties
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
    
    if (selectedFilters.topics.length > 0 && !selectedFilters.topics.some(topic => question.topicos?.includes(topic))) {
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
    
    if (selectedFilters.difficulty.length > 0 && !selectedFilters.difficulty.includes(question.difficulty)) {
      return false;
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
  
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 mx-auto w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl text-[#262f3c] font-extrabold md:text-3xl">Questões</h1>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowScoreCounter(true)}
            >
              <Calculator className="h-4 w-4" />
              Contador
            </Button>
          </div>

          <QuestionFiltersPanel
            filterOptions={filterOptions}
            selectedFilters={selectedFilters}
            handleFilterChange={handleFilterChange}
            handleApplyFilters={handleApplyFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            questionsPerPage={questionsPerPage}
            setQuestionsPerPage={setQuestionsPerPage}
          />

          <QuestionResults
            questions={paginatedQuestions}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            loading={loading}
            disabledOptions={disabledOptions}
            onToggleDisabled={handleToggleDisabled}
            hasFilters={Object.values(selectedFilters).some(arr => arr.length > 0)}
            questionsPerPage={questionsPerPage}
            setQuestionsPerPage={setQuestionsPerPage}
          />
        </div>

        {showScoreCounter && (
          <ScoreCounter onClose={() => setShowScoreCounter(false)} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Questions;
