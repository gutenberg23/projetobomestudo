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
    set({ dropdownData });
  }
})); 