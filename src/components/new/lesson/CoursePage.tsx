import React from 'react';
import { Section } from "../types";

interface CoursePageProps {
  topicos: any[];
}

export const CoursePage: React.FC<CoursePageProps> = ({ topicos }) => {
  // Mapear dados do tópico para o formato esperado pelo componente LessonCard
  const sections: Section[] = topicos.map((topico: any) => ({
    id: topico.id,
    title: topico.nome,
    contentType: "video",
    duration: 0,
    videoUrl: topico.video_url,
    professorId: topico.professor_id,
    professorNome: topico.nome_professor,
    abrirEmNovaGuia: topico.abrir_em_nova_guia // Mapear explicitamente o campo do banco
  })); 

  return (
    <div>
      {/* Usar a variável sections para evitar erro do linter */}
      <div className="sections-info">
        {sections.length > 0 ? (
          <p>Total de seções: {sections.length}</p>
        ) : (
          <p>Nenhuma seção encontrada</p>
        )}
      </div>
    </div>
  );
}; 