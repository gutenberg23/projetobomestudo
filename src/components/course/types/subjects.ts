
export interface Subject {
  id: string;
  name: string;
  rating: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  rating: string;
  sections: Section[];
  question: Question;
}

export interface Section {
  id: string;
  title: string;
  isActive: boolean;
  contentType?: "video" | "text" | "quiz";
  duration?: number;
  videoUrl?: string;
  textContent?: string;
}

export interface Question {
  id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  content: string;
  options: QuestionOption[];
  comments: Comment[];
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
}
