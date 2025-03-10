
import React, { useEffect } from "react";
import Card from "@/components/admin/questions/Card";
import QuestionFilters from "@/components/admin/questions/QuestionFilters";
import QuestionList from "@/components/admin/questions/QuestionList";
import QuestionForm from "@/components/admin/questions/QuestionForm";
import { useQuestionsState } from "@/components/admin/questions/hooks/useQuestionsState";
import { useQuestionActions } from "@/components/admin/questions/hooks/useQuestionActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { QuestionItemType, QuestionOption } from "@/components/admin/questions/types";
import { Json } from "@/integrations/supabase/types";
import CriarSimuladoModal from "@/components/admin/questions/modals/CriarSimuladoModal";

const Questoes: React.FC = () => {
  const state = useQuestionsState();
  const actions = useQuestionActions(state);
  const { user } = useAuth();
  
  const filteredQuestions = actions.getFilteredQuestions();

  // Função para converter options do banco para o formato esperado
  const parseOptions = (options: Json | null): QuestionOption[] => {
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

  // Buscar questões e dados relacionados do banco de dados
  useEffect(() => {
    const fetchQuestionsAndRelatedData = async () => {
      try {
        // Buscar todas as questões
        const { data, error } = await supabase
          .from('questoes')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Transformar os dados para o formato esperado pelo componente
        const formattedQuestions: QuestionItemType[] = data.map(q => ({
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
        
        state.setQuestions(formattedQuestions);
        
        // Extrair valores únicos para cada dropdown
        const institutions = [...new Set(data.map(q => q.institution))].filter(Boolean).sort();
        const organizations = [...new Set(data.map(q => q.organization))].filter(Boolean).sort();
        const roles = [...new Set(data.map(q => q.role))].filter(Boolean).sort();
        const disciplines = [...new Set(data.map(q => q.discipline))].filter(Boolean).sort();
        const levels = [...new Set(data.map(q => q.level))].filter(Boolean).sort();
        const difficulties = [...new Set(data.map(q => q.difficulty))].filter(Boolean).sort();
        const questionTypes = [...new Set(data.map(q => q.questiontype))].filter(Boolean).sort();
        const years = [...new Set(data.map(q => q.year))].filter(Boolean).sort((a, b) => b.localeCompare(a));

        // Atualizar o estado com os valores extraídos
        state.setInstitutions(institutions);
        state.setOrganizations(organizations);
        state.setRoles(roles);
        state.setDisciplines(disciplines);
        state.setLevels(levels);
        state.setDifficulties(difficulties);
        state.setQuestionTypes(questionTypes);
        state.setYears(years);
      } catch (error) {
        console.error('Erro ao carregar questões:', error);
        toast.error('Erro ao carregar questões. Tente novamente.');
      }
    };
    
    fetchQuestionsAndRelatedData();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#272f3c]">Questões</h1>
        <p className="text-[#67748a]">Gerenciamento de questões</p>
      </div>

      {state.isEditQuestionCardOpen && (
        <Card title="Editar Questão" description="Edite os dados da questão" defaultOpen={true}>
          <QuestionForm
            questionId={state.questionId}
            year={state.year}
            setYear={state.setYear}
            institution={state.institution}
            setInstitution={state.setInstitution}
            organization={state.organization}
            setOrganization={state.setOrganization}
            role={state.role}
            setRole={state.setRole}
            discipline={state.discipline}
            setDiscipline={state.setDiscipline}
            level={state.level}
            setLevel={state.setLevel}
            difficulty={state.difficulty}
            setDifficulty={state.setDifficulty}
            questionType={state.questionType}
            setQuestionType={state.setQuestionType}
            questionText={state.questionText}
            setQuestionText={state.setQuestionText}
            teacherExplanation={state.teacherExplanation}
            setTeacherExplanation={state.setTeacherExplanation}
            expandableContent={state.expandableContent}
            setExpandableContent={state.setExpandableContent}
            aiExplanation={state.aiExplanation}
            setAIExplanation={state.setAIExplanation}
            options={state.options}
            setOptions={state.setOptions}
            topicos={state.topicos}
            setTopicos={state.setTopicos}
            institutions={state.institutions}
            setInstitutions={state.setInstitutions}
            organizations={state.organizations}
            setOrganizations={state.setOrganizations}
            roles={state.roles}
            setRoles={state.setRoles}
            disciplines={state.disciplines}
            setDisciplines={state.setDisciplines}
            levels={state.levels}
            setLevels={state.setLevels}
            difficulties={state.difficulties}
            setDifficulties={state.setDifficulties}
            questionTypes={state.questionTypes}
            setQuestionTypes={state.setQuestionTypes}
            years={state.years}
            setYears={state.setYears}
            onSubmit={actions.handleUpdateQuestion}
            submitButtonText="Salvar Modificações"
            isEditing={true}
          />
        </Card>
      )}

      <Card title="Questões Cadastradas" description="Visualize e gerencie as questões cadastradas" defaultOpen={false}>
        <QuestionFilters
          filters={state.filters}
          setFilters={state.setFilters}
          showFilters={state.showFilters}
          setShowFilters={state.setShowFilters}
          resetFilters={actions.resetFilters}
        />
        
        <QuestionList
          filteredQuestions={filteredQuestions}
          selectedQuestions={state.selectedQuestions}
          toggleQuestionSelection={actions.toggleQuestionSelection}
          handleCreateSimulado={actions.handleCreateSimulado}
          handleRemoveQuestion={actions.handleRemoveQuestion}
          handleEditQuestion={actions.handleEditQuestion}
          copyToClipboard={actions.copyToClipboard}
        />
      </Card>

      <Card title="Nova Questão" description="Crie uma nova questão para suas listas" defaultOpen={false}>
        <QuestionForm
          questionId={state.questionId}
          year={state.year}
          setYear={state.setYear}
          institution={state.institution}
          setInstitution={state.setInstitution}
          organization={state.organization}
          setOrganization={state.setOrganization}
          role={state.role}
          setRole={state.setRole}
          discipline={state.discipline}
          setDiscipline={state.setDiscipline}
          level={state.level}
          setLevel={state.setLevel}
          difficulty={state.difficulty}
          setDifficulty={state.setDifficulty}
          questionType={state.questionType}
          setQuestionType={state.setQuestionType}
          questionText={state.questionText}
          setQuestionText={state.setQuestionText}
          teacherExplanation={state.teacherExplanation}
          setTeacherExplanation={state.setTeacherExplanation}
          expandableContent={state.expandableContent}
          setExpandableContent={state.setExpandableContent}
          aiExplanation={state.aiExplanation}
          setAIExplanation={state.setAIExplanation}
          options={state.options}
          setOptions={state.setOptions}
          topicos={state.topicos}
          setTopicos={state.setTopicos}
          institutions={state.institutions}
          setInstitutions={state.setInstitutions}
          organizations={state.organizations}
          setOrganizations={state.setOrganizations}
          roles={state.roles}
          setRoles={state.setRoles}
          disciplines={state.disciplines}
          setDisciplines={state.setDisciplines}
          levels={state.levels}
          setLevels={state.setLevels}
          difficulties={state.difficulties}
          setDifficulties={state.setDifficulties}
          questionTypes={state.questionTypes}
          setQuestionTypes={state.setQuestionTypes}
          years={state.years}
          setYears={state.setYears}
          onSubmit={actions.handleSaveQuestion}
          submitButtonText="Salvar Questão"
        />
      </Card>

      {/* Modal para criar simulado */}
      <CriarSimuladoModal
        isOpen={state.isSimuladoModalOpen}
        onClose={() => state.setIsSimuladoModalOpen(false)}
        selectedQuestions={state.selectedQuestions}
      />
    </div>
  );
};

export default Questoes;
