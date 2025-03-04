
export interface QuestionItemType {
  id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  discipline: string;
  level: string;
  difficulty: string;
  questionType: string;
  content: string;
  teacherExplanation: string;
  aiExplanation?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export interface FiltersType {
  id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  discipline: string;
  level: string;
  difficulty: string;
  questionType: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
