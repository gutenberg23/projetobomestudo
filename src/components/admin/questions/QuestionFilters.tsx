import React, { Dispatch, SetStateAction, useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Filter, XCircle, Eraser, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Filters, FilterItem } from './types';
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/admin/questions/form/MultiSelect";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface QuestionFiltersProps {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  resetFilters: () => void;
  handleClearAllQuestionStats: () => Promise<void>;
  handleDeleteAllQuestions?: () => Promise<void>;
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
  handleDeleteAllQuestions,
  dropdownData,

}) => {
  const [subjectsByDiscipline, setSubjectsByDiscipline] = useState<{[key: string]: string[]}>({});
  const [topicsBySubject, setTopicsBySubject] = useState<{[key: string]: string[]}>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Buscar questões para análise de relações entre disciplinas, assuntos e tópicos
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questoes')
          .select('discipline, assuntos, topicos');
          
        if (error) throw error;
        
        if (data) {
          // Criar mapeamento de disciplinas para assuntos e assuntos para tópicos
          const disciplineToSubjectsMap: Record<string, Set<string>> = {};
          const subjectToTopicsMap: Record<string, Set<string>> = {};
          
          data.forEach(question => {
            const discipline = question.discipline;
            const subjects = Array.isArray(question.assuntos) ? question.assuntos : [];
            const topics = Array.isArray(question.topicos) ? question.topicos : [];
            
            // Mapear disciplina para assuntos
            if (discipline && subjects.length > 0) {
              if (!disciplineToSubjectsMap[discipline]) {
                disciplineToSubjectsMap[discipline] = new Set();
              }
              
              subjects.forEach((subject: string) => {
                if (subject) {
                  disciplineToSubjectsMap[discipline].add(subject);
                  
                  // Mapear assunto para tópicos
                  if (topics.length > 0) {
                    if (!subjectToTopicsMap[subject]) {
                      subjectToTopicsMap[subject] = new Set();
                    }
                    
                    topics.forEach((topic: string) => {
                      if (topic) {
                        subjectToTopicsMap[subject].add(topic);
                      }
                    });
                  }
                }
              });
            }
          });
          
          // Converter Sets para arrays e ordenar
          const formattedSubjectsMap: {[key: string]: string[]} = {};
          Object.keys(disciplineToSubjectsMap).forEach(discipline => {
            formattedSubjectsMap[discipline] = [...disciplineToSubjectsMap[discipline]]
              .filter(Boolean)
              .sort((a, b) => String(a).localeCompare(String(b)));
          });

          const formattedTopicsMap: {[key: string]: string[]} = {};
          Object.keys(subjectToTopicsMap).forEach(subject => {
            formattedTopicsMap[subject] = [...subjectToTopicsMap[subject]]
              .filter(Boolean)
              .sort((a, b) => String(a).localeCompare(String(b)));
          });
          
          setSubjectsByDiscipline(formattedSubjectsMap);
          setTopicsBySubject(formattedTopicsMap);
        }
      } catch (error) {
        console.error('Erro ao carregar questões:', error);
      }
    };
    
    fetchQuestions();
  }, []);

  // Carregar disciplinas, assuntos e tópicos do banco de dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar questões do banco de dados
        const { data: questions, error } = await supabase
          .from('questions')
          .select('disciplina, assunto, topico')
          .not('disciplina', 'is', null);

        if (error) throw error;

        if (questions) {
          // Extrair disciplinas únicas
          const uniqueDisciplines = [...new Set(questions.map(q => q.disciplina))].filter(Boolean);
          // Mapear disciplinas para assuntos
          const subjectsByDiscipline: {[key: string]: string[]} = {};
          // Mapear assuntos para tópicos
          const topicsBySubject: {[key: string]: string[]} = {};

          questions.forEach(q => {
            if (q.disciplina && q.assunto) {
              if (!subjectsByDiscipline[q.disciplina]) {
                subjectsByDiscipline[q.disciplina] = [];
              }
              if (!subjectsByDiscipline[q.disciplina].includes(q.assunto)) {
                subjectsByDiscipline[q.disciplina].push(q.assunto);
              }

              // Associar tópicos aos assuntos
              if (q.assunto && q.topico) {
                if (!topicsBySubject[q.assunto]) {
                  topicsBySubject[q.assunto] = [];
                }
                if (!topicsBySubject[q.assunto].includes(q.topico)) {
                  topicsBySubject[q.assunto].push(q.topico);
                }
              }
            }
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  const handleMultiSelectChange = (
    filterKey: keyof Filters,
    selected: string[]
  ) => {
    setFilters((prev) => {
      return {
        ...prev,
        [filterKey]: {
          ...prev[filterKey],
          value: selected.length > 0 ? JSON.stringify(selected) : "",
          isActive: selected.length > 0,
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

  // Função modificada para converter valores JSON em array
  const getSelectedValues = (filterKey: keyof Filters): string[] => {
    if (!filters[filterKey] || !filters[filterKey].value) {
      return [];
    }
    
    const value = filters[filterKey].value;
    if (typeof value !== 'string') {
      return [];
    }
    
    // Tentar analisar como JSON primeiro (formato novo)
    try {
      return JSON.parse(value);
    } catch (e) {
    // Caso não seja JSON (formato antigo), usar ponto e vírgula como separador
      return value.split(';').filter(v => v !== '');
    }
  };

  // Filtrar assuntos com base nas disciplinas selecionadas
  const filteredSubjects = useMemo(() => {
    const selectedDisciplines = getSelectedValues("disciplina");
    if (selectedDisciplines.length === 0) return [];
    
    const subjectsSet = new Set<string>();
    
    selectedDisciplines.forEach(discipline => {
      const subjects = subjectsByDiscipline[discipline] || [];
      subjects.forEach(subject => subjectsSet.add(subject));
    });
    
    return [...subjectsSet].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
  }, [filters.disciplina, subjectsByDiscipline]);

  // Filtrar tópicos com base nos assuntos selecionados
  const filteredTopics = useMemo(() => {
    const selectedSubjects = getSelectedValues("topicos");
    if (selectedSubjects.length === 0) return [];
    
    const topicsSet = new Set<string>();
    
    selectedSubjects.forEach(subject => {
      const topics = topicsBySubject[subject] || [];
      topics.forEach(topic => topicsSet.add(topic));
    });
    
    return [...topicsSet].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
  }, [filters.topicos, topicsBySubject]);



  const handleDeleteAllQuestionsConfirm = async () => {
    if (!handleDeleteAllQuestions) return;
    
    setIsDeleting(true);
    try {
      await handleDeleteAllQuestions();
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
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
          
          {/* Botão para filtrar questões sem explicações da IA */}
          <Button
            variant={filters.semAIExplanation.isActive ? "default" : "outline"}
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                semAIExplanation: {
                  ...prev.semAIExplanation,
                  isActive: !prev.semAIExplanation.isActive,
                  value: prev.semAIExplanation.isActive ? "" : "true"
                }
              }));
            }}
            className={`flex items-center gap-2 ${
              filters.semAIExplanation.isActive 
                ? "bg-[#5f2ebe] text-white hover:bg-[#4a1f9c]" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>Sem Explicação da IA</span>
            {filters.semAIExplanation.isActive && (
              <XCircle className="h-4 w-4" />
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
          
          {handleDeleteAllQuestions && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Todas Questões
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
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Disciplina</h3>
              <MultiSelect 
                options={dropdownData.disciplines} 
                selected={getSelectedValues("disciplina")} 
                onChange={(selected) => handleMultiSelectChange("disciplina", selected)} 
                placeholder="Selecione as disciplinas"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Assuntos</h3>
              <MultiSelect 
                options={filteredSubjects} 
                selected={getSelectedValues("topicos")} 
                onChange={(selected) => handleMultiSelectChange("topicos", selected)} 
                placeholder={
                  getSelectedValues("disciplina").length === 0 
                    ? "Selecione uma disciplina primeiro" 
                    : "Selecione os assuntos"
                }
                disabled={getSelectedValues("disciplina").length === 0}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tópicos</h3>
              <MultiSelect 
                options={filteredTopics} 
                selected={getSelectedValues("subtopicos")} 
                onChange={(selected) => handleMultiSelectChange("subtopicos", selected)} 
                placeholder={
                  getSelectedValues("disciplina").length === 0
                    ? "Selecione uma disciplina primeiro"
                    : getSelectedValues("topicos").length === 0
                      ? "Selecione um assunto primeiro"
                      : "Selecione os tópicos"
                }
                disabled={getSelectedValues("topicos").length === 0}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Nível</h3>
              <MultiSelect 
                options={dropdownData.levels} 
                selected={getSelectedValues("nivel")} 
                onChange={(selected) => handleMultiSelectChange("nivel", selected)} 
                placeholder="Selecione o nível"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Banca</h3>
              <MultiSelect 
                options={dropdownData.institutions} 
                selected={getSelectedValues("institution")} 
                onChange={(selected) => handleMultiSelectChange("institution", selected)} 
                placeholder="Selecione as bancas"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Órgão</h3>
              <MultiSelect 
                options={dropdownData.organizations} 
                selected={getSelectedValues("organization")} 
                onChange={(selected) => handleMultiSelectChange("organization", selected)} 
                placeholder="Selecione os órgãos"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Cargo</h3>
              <MultiSelect 
                options={dropdownData.roles} 
                selected={getSelectedValues("role")} 
                onChange={(selected) => handleMultiSelectChange("role", selected)} 
                placeholder="Selecione os cargos"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Ano</h3>
              <MultiSelect 
                options={dropdownData.years} 
                selected={getSelectedValues("ano")} 
                onChange={(selected) => handleMultiSelectChange("ano", selected)} 
                placeholder="Selecione os anos"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Dificuldade</h3>
              <MultiSelect 
                options={dropdownData.difficulties} 
                selected={getSelectedValues("dificuldade")} 
                onChange={(selected) => handleMultiSelectChange("dificuldade", selected)} 
                placeholder="Selecione a dificuldade"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tipo de Questão</h3>
              <MultiSelect 
                options={dropdownData.questionTypes} 
                selected={getSelectedValues("questionType")} 
                onChange={(selected) => handleMultiSelectChange("questionType", selected)} 
                placeholder="Selecione o tipo de questão"
              />
            </div>
          </div>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={setShowDeleteConfirm}
        onConfirm={handleDeleteAllQuestionsConfirm}
        title="Excluir Todas as Questões"
        description="Tem certeza que deseja excluir TODAS as questões? Esta ação é irreversível e todos os dados serão perdidos permanentemente."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default QuestionFilters;
