
import React from "react";
import { SubjectCard } from "./components/SubjectCard";

interface SubjectsListProps {
  courseId?: string;
}

export const SubjectsList: React.FC<SubjectsListProps> = ({ courseId }) => {
  // Aqui poderíamos fazer uma chamada para API para buscar as disciplinas do curso
  console.log("Carregando disciplinas para o curso:", courseId);
  
  // Dados fictícios para demonstração
  const subjects = [
    {
      id: "1",
      title: "Português",
      description: "Gramática, interpretação de texto e redação.",
      lessonsCount: 12,
      progress: 75
    },
    {
      id: "2",
      title: "Matemática",
      description: "Aritmética, álgebra e geometria.",
      lessonsCount: 15,
      progress: 40
    },
    {
      id: "3",
      title: "Direito Constitucional",
      description: "Princípios fundamentais e direitos básicos.",
      lessonsCount: 10,
      progress: 20
    },
    {
      id: "4",
      title: "Raciocínio Lógico",
      description: "Lógica proposicional e argumentação.",
      lessonsCount: 8,
      progress: 0
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
      {subjects.map((subject) => (
        <SubjectCard 
          key={subject.id}
          title={subject.title}
          description={subject.description}
          lessonsCount={subject.lessonsCount}
          progress={subject.progress}
          courseId={courseId}
          subjectId={subject.id}
        />
      ))}
    </div>
  );
};
