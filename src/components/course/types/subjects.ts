
export interface Subject {
  id: string;
  name: string;
  rating?: any;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string | number; // Aceita string ou número
  description?: string;
  sections?: Section[];
  question?: any;
  rating?: string;
}

export interface Section {
  id: string;
  title: string;
  isActive?: boolean;
  contentType: "video" | "text" | "quiz";
  duration: number;
  videoUrl?: string;
  textContent?: string;
  professorId?: string;
  professorNome?: string;
}
