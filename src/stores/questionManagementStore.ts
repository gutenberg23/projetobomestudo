import { create } from 'zustand';
import { QuestionItemType } from '@/components/admin/questions/types';

interface DropdownData {
  years: string[];
  institutions: string[];
  organizations: string[];
  roles: string[];
  disciplines: string[];
  levels: string[];
  difficulties: string[];
  questionTypes: string[];
  assuntos: string[];
  topicos: string[];
}

interface QuestionManagementState {
  questions: QuestionItemType[];
  dropdownData: DropdownData;
  setQuestions: (questions: QuestionItemType[]) => void;
  setDropdownData: (data: DropdownData) => void;
}

export const useQuestionManagementStore = create<QuestionManagementState>((set) => ({
  questions: [],
  dropdownData: {
    years: [],
    institutions: [],
    organizations: [],
    roles: [],
    disciplines: [],
    levels: [],
    difficulties: [],
    questionTypes: [],
    assuntos: [],
    topicos: []
  },
  setQuestions: (questions) => set({ questions }),
  setDropdownData: (dropdownData) => {
    console.log("Atualizando dados de dropdown no store:", {
      years: dropdownData.years?.length || 0,
      institutions: dropdownData.institutions?.length || 0,
      organizations: dropdownData.organizations?.length || 0,
      roles: dropdownData.roles?.length || 0,
      disciplines: dropdownData.disciplines?.length || 0,
      levels: dropdownData.levels?.length || 0,
      difficulties: dropdownData.difficulties?.length || 0,
      questionTypes: dropdownData.questionTypes?.length || 0,
      assuntos: dropdownData.assuntos?.length || 0,
      topicos: dropdownData.topicos?.length || 0
    });
    set({ dropdownData });
  }
})); 