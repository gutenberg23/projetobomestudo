
export interface Question {
  id: string;
  content: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
  comments: Array<Comment>;
  additionalContent?: string;
  images?: string[];
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
