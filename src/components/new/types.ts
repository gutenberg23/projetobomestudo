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
  expandableContent?: string;
  teacherExplanation?: string;
  aiExplanation?: string;
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
  questionNumber: number;
  year: string;
  institution: string;
  organization: string;
  role: string;
  educationLevel: string;
  discipline: string;
  topics: string[];
  questionId: string;
}
