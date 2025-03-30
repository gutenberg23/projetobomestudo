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
import ImportQuestionsCard from "@/components/admin/questions/ImportQuestionsCard";

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
    actions.fetchQuestionsAndRelatedData();
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

      <ImportQuestionsCard onQuestionsImported={actions.fetchQuestionsAndRelatedData} />

      <Card title="Questões Cadastradas" description="Visualize e gerencie as questões cadastradas" defaultOpen={false}>
        <QuestionFilters
          filters={state.filters}
          setFilters={state.setFilters}
          showFilters={state.showFilters}
          setShowFilters={state.setShowFilters}
          resetFilters={actions.resetFilters}
          handleClearAllQuestionStats={actions.handleClearAllQuestionStats}
        />
        
        <QuestionList
          filteredQuestions={filteredQuestions}
          selectedQuestions={state.selectedQuestions}
          toggleQuestionSelection={actions.toggleQuestionSelection}
          handleCreateSimulado={actions.handleCreateSimulado}
          handleRemoveQuestion={actions.handleRemoveQuestion}
          handleEditQuestion={actions.handleEditQuestion}
          copyToClipboard={actions.copyToClipboard}
          handleClearQuestionStats={actions.handleClearQuestionStats}
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
