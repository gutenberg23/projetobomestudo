import React, { useEffect } from "react";
import Card from "@/components/admin/questions/Card";
import QuestionFilters from "@/components/admin/questions/QuestionFilters";
import QuestionList from "@/components/admin/questions/QuestionList";
import { QuestionForm } from "@/components/admin/questions/QuestionForm";
import { useQuestionsState } from "@/components/admin/questions/hooks/useQuestionsState";
import { useQuestionActions } from "@/components/admin/questions/hooks/useQuestionActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { QuestionItemType, QuestionOption } from "@/components/admin/questions/types";
import { Json } from "@/integrations/supabase/types";
import CriarSimuladoModal from "@/components/admin/questions/modals/CriarSimuladoModal";
import ImportQuestionsCard from "@/components/admin/questions/ImportQuestionsCard";
import ReportedErrorsCard from "@/components/admin/questions/ReportedErrorsCard";
import { Button } from "@/components/ui/button";
import { useFetchQuestionsActions } from '@/components/admin/questions/hooks/actions/useFetchQuestionsActions';
import { useQuestionManagementStore } from '@/stores/questionManagementStore';
import { useFilterActions } from '@/components/admin/questions/hooks/actions/useFilterActions';
import { fetchQuestionById } from '@/services/questoesService';

const ITEMS_PER_PAGE = 10;

const Questoes: React.FC = () => {
  const state = useQuestionsState();
  const actions = useQuestionActions(state);
  const { user } = useAuth();
  const { fetchQuestionsAndRelatedData } = useFetchQuestionsActions();
  const questions = useQuestionManagementStore((state) => state.questions);
  const dropdownData = useQuestionManagementStore((state) => state.dropdownData);
  
  const { filters, setFilters, showFilters, setShowFilters, resetFilters, getFilteredQuestions } = useFilterActions(state);
  
  // Calcular paginação
  const filteredQuestions = getFilteredQuestions(questions);
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (state.currentPage - 1) * ITEMS_PER_PAGE,
    state.currentPage * ITEMS_PER_PAGE
  );

  // Buscar questões e dados relacionados do banco de dados
  useEffect(() => {
    console.log('Buscando questões');
    state.setLoading(true);
    fetchQuestionsAndRelatedData()
      .finally(() => {
        state.setLoading(false);
      });
  }, []);

  const handlePageChange = (newPage: number) => {
    state.updatePage(newPage);
  };

  const handleQuestionsImported = () => {
    console.log('Questões importadas, recarregando página atual');
    state.setLoading(true);
    fetchQuestionsAndRelatedData()
      .finally(() => {
        state.setLoading(false);
      });
  };

  const handleEditFromError = async (questionId: string) => {
    try {
      const questionData = await fetchQuestionById(questionId);
      
      console.log("Dados recebidos para edição:", {
        teacherExplanation: questionData.teacherexplanation,
        expandableContent: questionData.expandablecontent,
        aiExplanation: questionData.aiexplanation
      });

      // Atualizar o estado com os dados da questão
      state.setQuestionId(questionData.id);
      state.setYear(questionData.year || '');
      state.setInstitution(questionData.institution || '');
      state.setOrganization(questionData.organization || '');
      state.setRole(Array.isArray(questionData.role) ? questionData.role : []);
      state.setDiscipline(questionData.discipline || '');
      state.setLevel(questionData.level || '');
      state.setDifficulty(questionData.difficulty || '');
      state.setQuestionType(questionData.questiontype || '');
      state.setQuestionText(questionData.content || '');
      
      // Corrigir os nomes dos campos para exibição nos editores TipTap
      state.setTeacherExplanation(questionData.teacherexplanation || '');
      state.setExpandableContent(questionData.expandablecontent || '');
      state.setAIExplanation(questionData.aiexplanation || '');
      
      state.setOptions(questionData.options);
      state.setAssuntos(questionData.assuntos || []);
      state.setTopicos(questionData.topicos || []);

      // Abrir o card de edição
      state.setIsEditQuestionCardOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Erro ao carregar questão:', error);
      toast.error('Erro ao carregar questão');
    }
  };

  // Renderizar a lista de questões
  const renderQuestionList = () => {
    if (state.loading) {
      return <div className="flex justify-center items-center h-32">Carregando...</div>;
    }

    return (
      <QuestionList
        questions={paginatedQuestions}
        currentPage={state.currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        handleEditQuestion={actions.handleEditQuestion}
        handleRemoveQuestion={actions.handleRemoveQuestion}
        copyToClipboard={actions.copyToClipboard}
        handleClearQuestionStats={actions.handleClearQuestionStats}
      />
    );
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#272f3c]">Questões</h1>
        <p className="text-[#67748a]">Gerenciamento de questões</p>
      </div>

      {state.isEditQuestionCardOpen && (
        <Card title="Editar Questão" description="Edite os dados da questão" defaultOpen={true}>
          <QuestionForm
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
            assuntos={state.assuntos}
            setAssuntos={state.setAssuntos}
            topicos={state.topicos}
            setTopicos={state.setTopicos}
            onSubmit={actions.handleUpdateQuestion}
            submitButtonText="Salvar Modificações"
            isEditing={true}
          />
        </Card>
      )}

      <ImportQuestionsCard onQuestionsImported={handleQuestionsImported} />
      <ReportedErrorsCard onEditQuestion={handleEditFromError} />

      <Card title="Questões Cadastradas" description="Visualize e gerencie as questões cadastradas" defaultOpen={false}>
        <QuestionFilters
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          resetFilters={resetFilters}
          handleClearAllQuestionStats={actions.handleClearAllQuestionStats}
          handleDeleteAllQuestions={actions.handleDeleteAllQuestions}
          dropdownData={dropdownData}
          onChange={() => {}}
          onFiltersClean={() => {}}
        />
        
        {renderQuestionList()}
      </Card>

      <Card title="Nova Questão" description="Crie uma nova questão para suas listas" defaultOpen={false}>
        <QuestionForm
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
          assuntos={state.assuntos}
          setAssuntos={state.setAssuntos}
          topicos={state.topicos}
          setTopicos={state.setTopicos}
          onSubmit={actions.handleSaveQuestion}
          submitButtonText="Criar Questão"
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
