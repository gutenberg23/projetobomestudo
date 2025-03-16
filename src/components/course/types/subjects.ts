
export interface Subject {
  id: string;
  name: string;
  rating?: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
}
