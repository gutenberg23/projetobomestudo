export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  rating: string;
  sections: Array<{
    id: string;
    title: string;
    isActive: boolean;
  }>;
}

export interface Question {
  id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  content: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  comments: Comment[];
}
