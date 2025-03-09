
export interface Question {
  id: string;
  content: string;
  additionalContent?: string;
  teacherExplanation?: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  options: QuestionOption[];
  comments: Comment[];
  images?: string[];
  aiExplanation?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
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
}
