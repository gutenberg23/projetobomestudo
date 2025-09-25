import { useClipboardActions } from "./actions/useClipboardActions";
import { useSaveQuestionActions } from "./actions/useSaveQuestionActions";
import { useSearchQuestionActions } from "./actions/useSearchQuestionActions";
import { useUpdateQuestionActions } from "./actions/useUpdateQuestionActions";
import { useQuestionSelectionActions } from "./actions/useQuestionSelectionActions";
import { useQuestionManagementActions } from "./actions/useQuestionManagementActions";
import { useFilterActions } from "./actions/useFilterActions";
import { useFetchQuestionsActions } from "./actions/useFetchQuestionsActions";

export const useQuestionActions = (state: ReturnType<typeof import("./useQuestionsState").useQuestionsState>) => {
  const { copyToClipboard } = useClipboardActions();
  const { handleSaveQuestion } = useSaveQuestionActions(state);
  const { handleSearchQuestion } = useSearchQuestionActions(state);
  const { handleUpdateQuestion } = useUpdateQuestionActions(state);
  const { toggleQuestionSelection, handleCreateSimulado } = useQuestionSelectionActions(state);
  const { 
    handleRemoveQuestion, 
    handleEditQuestion, 
    handleClearQuestionStats,
    handleClearAllQuestionStats,
    handleDeleteAllQuestions
  } = useQuestionManagementActions(state);
  const { getFilteredQuestions, resetFilters } = useFilterActions(state);
  const { fetchQuestionsAndRelatedData } = useFetchQuestionsActions(state);

  return {
    copyToClipboard,
    handleSaveQuestion,
    handleSearchQuestion,
    handleUpdateQuestion,
    toggleQuestionSelection,
    handleCreateSimulado,
    handleRemoveQuestion,
    handleEditQuestion,
    getFilteredQuestions,
    resetFilters,
    handleClearQuestionStats,
    handleClearAllQuestionStats,
    handleDeleteAllQuestions,
    fetchQuestionsAndRelatedData
  };
};
