
import React from "react";
import Card from "@/components/admin/questions/Card";
import SearchQuestion from "@/components/admin/questions/SearchQuestion";
import QuestionFilters from "@/components/admin/questions/QuestionFilters";
import QuestionList from "@/components/admin/questions/QuestionList";
import QuestionForm from "@/components/admin/questions/QuestionForm";
import { useQuestionsState } from "@/components/admin/questions/hooks/useQuestionsState";
import { useQuestionActions } from "@/components/admin/questions/hooks/useQuestionActions";

const Questoes: React.FC = () => {
  const state = useQuestionsState();
  const actions = useQuestionActions(state);
  
  const filteredQuestions = actions.getFilteredQuestions();

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#272f3c]">Questões</h1>
        <p className="text-[#67748a]">Gerenciamento de questões</p>
      </div>

      <Card title="Buscar Questão" description="Pesquise e edite questões pelo ID" defaultOpen={true}>
        <SearchQuestion 
          searchId={state.searchId} 
          setSearchId={state.setSearchId} 
          handleSearchQuestion={actions.handleSearchQuestion} 
        />
      </Card>

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
            options={state.options}
            setOptions={state.setOptions}
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
          options={state.options}
          setOptions={state.setOptions}
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
    </div>
  );
};

export default Questoes;
