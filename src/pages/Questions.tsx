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
  const [tempFilters, setTempFilters] = useState({
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
  const [totalCount, setTotalCount] = useState(0);
  
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
          try {
            // Primeiro tentar interpretar como JSON (novo formato)
            newFilters[key as keyof typeof selectedFilters] = JSON.parse(param);
          } catch (e) {
            // Caso falhe, usar o formato antigo com split
            newFilters[key as keyof typeof selectedFilters] = param.split(',');
          }
        } else {
          newFilters[key as keyof typeof selectedFilters] = [];
        }
      });
      
      setSelectedFilters(newFilters);
      setTempFilters(newFilters); // Inicializar filtros temporários com os mesmos valores
    };
    
    parseUrlParams();
  }, [searchParams]);

  // Buscar opções de filtro (só uma vez)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Buscar apenas os dados necessários para os filtros (max 100 registros mais recentes)
        const { data, error } = await supabase
          .from('questoes')
          .select('discipline, topicos, institution, organization, role, year, level, difficulty')
          .order('created_at', { ascending: false })
          .limit(100);
        
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
        console.error('Erro ao carregar opções de filtro:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Buscar questões com base nos filtros e paginação
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Calcular offset para paginação
        const offset = (currentPage - 1) * parseInt(questionsPerPage);
        const limit = parseInt(questionsPerPage);

        // Construir a consulta básica
        let query = supabase.from('questoes').select('*', { count: 'exact' });
        
        // Aplicar texto de pesquisa
        if (searchQuery) {
          query = query.ilike('content', `%${searchQuery}%`);
        }
        
        // Aplicar filtros
        if (selectedFilters.disciplines.length > 0) {
          query = query.in('discipline', selectedFilters.disciplines);
        }
        
        if (selectedFilters.institutions.length > 0) {
          query = query.in('institution', selectedFilters.institutions);
        }
        
        if (selectedFilters.organizations.length > 0) {
          query = query.in('organization', selectedFilters.organizations);
        }
        
        if (selectedFilters.roles.length > 0) {
          query = query.in('role', selectedFilters.roles);
        }
        
        if (selectedFilters.years.length > 0) {
          query = query.in('year', selectedFilters.years);
        }
        
        if (selectedFilters.educationLevels.length > 0) {
          query = query.in('level', selectedFilters.educationLevels);
        }
        
        if (selectedFilters.difficulty.length > 0) {
          query = query.in('difficulty', selectedFilters.difficulty);
        }
        
        // O filtro de tópicos é um caso especial (array)
        if (selectedFilters.topics.length > 0) {
          console.log("Buscando questões com assuntos:", selectedFilters.topics);
          
          // Fazer a consulta para obter todos os IDs de questões com os assuntos selecionados
          let idsQuestoes: string[] = [];
          
          try {
            // Buscar todas as questões com um único query
            const { data: todasQuestoes, error: erroConsulta } = await supabase
              .from('questoes')
              .select('id, assuntos');
            
            if (erroConsulta) {
              console.error("Erro ao buscar questões para filtrar por assuntos:", erroConsulta);
            } else if (todasQuestoes && todasQuestoes.length > 0) {
              // Filtrar questões que contêm qualquer um dos assuntos selecionados
              const assuntosSelecionados = selectedFilters.topics;
              
              for (const questao of todasQuestoes) {
                if (questao.assuntos && Array.isArray(questao.assuntos)) {
                  // Verificar correspondência mais flexível entre assuntos
                  const temAssuntoSelecionado = assuntosSelecionados.some(assuntoSelecionado => {
                    // Normalizar o assunto selecionado
                    const assuntoNormalizado = assuntoSelecionado.toLowerCase().trim();
                    
                    return questao.assuntos.some((assuntoQuestao: string) => {
                      // Normalizar o assunto da questão
                      const questaoNormalizada = assuntoQuestao.toLowerCase().trim();
                      
                      // Verificar correspondência exata ou se um contém o outro
                      return questaoNormalizada === assuntoNormalizado || 
                             questaoNormalizada.includes(assuntoNormalizado) || 
                             assuntoNormalizado.includes(questaoNormalizada);
                    });
                  });
                  
                  if (temAssuntoSelecionado) {
                    idsQuestoes.push(questao.id);
                  }
                }
              }
            }
            
            console.log(`Total de ${idsQuestoes.length} questões encontradas para os assuntos selecionados`);
            
            // Adicionar filtro de IDs à consulta principal
            if (idsQuestoes.length > 0) {
              query = query.in('id', idsQuestoes);
            } else {
              // Caso não encontremos nenhuma questão, forçar um resultado vazio
              query = query.eq('id', 'id_inexistente');
            }
          } catch (e) {
            console.error("Erro ao processar busca por assuntos:", e);
            // Em caso de erro, retornar resultado vazio
            query = query.eq('id', 'id_inexistente');
          }
        }
        
        // Aplicar paginação
        query = query.range(offset, offset + limit - 1);
        
        // Executar a consulta
        const { data, error, count } = await query;
        
        if (error) {
          throw error;
        }
        
        // Atualizar a contagem total
        if (count !== null) {
          setTotalCount(count);
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
          topicos: Array.isArray(q.topicos) ? q.topicos : [],
          assuntos: Array.isArray(q.assuntos) ? q.assuntos : []
        }));
        
        setQuestions(formattedQuestions);
      } catch (error) {
        console.error('Erro ao carregar questões:', error);
        toast.error('Erro ao carregar questões. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [searchQuery, selectedFilters, currentPage, questionsPerPage]);
  
  const handleToggleDisabled = (optionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDisabledOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId) 
        : [...prev, optionId]
    );
  };
  
  const handleFilterChange = (
    category: "topics" | "disciplines" | "institutions" | "organizations" | "roles" | "years" | "educationLevels" | "difficulty" | "reset_all",
    value: string | any
  ) => {
    // Caso especial para redefinir todos os filtros
    if (category === "reset_all") {
      setTempFilters({
        disciplines: [],
        topics: [],
        institutions: [],
        organizations: [],
        roles: [],
        years: [],
        educationLevels: [],
        difficulty: []
      });
      return;
    }
    
    setTempFilters(prev => {
      const newFilters = { ...prev };
      
      // Lógica especial para disciplinas e tópicos
      if (category === "disciplines") {
        // Verificar se estamos adicionando ou removendo a disciplina
        const isAddingDiscipline = !prev.disciplines.includes(value);
        
        if (isAddingDiscipline) {
          newFilters.disciplines = [...prev.disciplines, value];
        } else {
          newFilters.disciplines = prev.disciplines.filter(item => item !== value);
          
          // Se removeu todas as disciplinas, limpar os tópicos também
          if (newFilters.disciplines.length === 0) {
            newFilters.topics = [];
          }
        }
      } 
      // Para outras categorias, manter a lógica original
      else {
        if (newFilters[category].includes(value)) {
          newFilters[category] = newFilters[category].filter(item => item !== value);
        } else {
          newFilters[category] = [...newFilters[category], value];
        }
      }
      
      return newFilters;
    });
  };
  
  const handleApplyFilters = () => {
    setSelectedFilters(tempFilters);
    setCurrentPage(1); // Voltar para a primeira página ao aplicar novos filtros
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  // Cálculo para paginação com base na contagem total
  const totalPages = Math.max(1, Math.ceil(totalCount / parseInt(questionsPerPage)));
  
  return (
    <div className="flex flex-col min-h-screen bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-[#272f3c] font-extrabold md:text-3xl mb-2">Questões de Concursos</h1>
          <Button
            variant="outline"
            onClick={() => setShowScoreCounter(!showScoreCounter)}
            className="flex items-center"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {showScoreCounter ? "Desativar Pontuação" : "Ativar Pontuação"}
          </Button>
        </div>

        {showScoreCounter && (
          <div className="mb-6">
            <ScoreCounter />
          </div>
        )}

        <QuestionFiltersPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilters={tempFilters}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={handleApplyFilters}
          questionsPerPage={questionsPerPage}
          setQuestionsPerPage={setQuestionsPerPage}
          filterOptions={filterOptions}
          rightElement={
            <div className="pr-3">
              <Select value={questionsPerPage} onValueChange={(value) => {
                setQuestionsPerPage(value);
                setCurrentPage(1); // Voltar para a primeira página quando mudar o número de itens por página
              }}>
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
          }
        />

        <QuestionResults
          questions={questions} 
          loading={loading}
          disabledOptions={disabledOptions}
          onToggleDisabled={handleToggleDisabled}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          hasFilters={Object.values(selectedFilters).some(arr => arr.length > 0)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Questions;
