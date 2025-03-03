
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
  comments: Array<{
    id: string;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
  }>;
  additionalContent?: string;
  images?: string[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}
