export interface Question {
  id: string;
  number: number;
  content: string;
  command: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  year?: string;
  institution?: string;
  organization?: string;
  role?: string;
  educationLevel?: string;
  discipline?: string;
  topics?: string[];
  assunto?: string;
  assuntos?: string[];
  expandableContent?: string;
  teacherExplanation?: string;
  aiExplanation?: string;
  questionType?: string;
  comments: Array<{
    id: string;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    userId?: string;
  }>;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  userId?: string;
}

export interface Section {
  id: string;
  title: string;
  contentType: "video" | "text" | "quiz";
  duration?: number;
  videoUrl?: string;
  textContent?: string;
  isActive?: boolean;
  professorId?: string;
  professorNome?: string;
  abrirEmNovaGuia?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  sections: Section[];
  duration?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  instructor?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: string;
  question?: Question;
}

export interface QuestionHeaderProps {
  year?: string;
  institution?: string;
  organization?: string;
  role?: string;
  educationLevel?: string;
  discipline?: string;
  topics?: string[];
  assunto?: string;
  questionId: string;
  hideInfo?: boolean;
}

export interface QuestionBook {
  id: string;
  nome: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
