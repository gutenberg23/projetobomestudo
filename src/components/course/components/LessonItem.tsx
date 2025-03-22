
import React from 'react';
import { CheckIcon, XIcon } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';

interface LessonItemProps {
  title: string;
  isCompleted?: boolean;
  stats?: {
    total: number;
    hits: number;
    errors: number;
  };
  questoesIds?: string[];
  onToggleComplete?: () => void;
  lessonId?: string;
}

export const LessonItem: React.FC<LessonItemProps> = ({
  title,
  isCompleted = false,
  stats = { total: 0, hits: 0, errors: 0 },
  questoesIds = [],
  onToggleComplete,
  lessonId
}) => {
  const aproveitamento = stats.total > 0 
    ? Math.round((stats.hits / stats.total) * 100) 
    : 0;
  
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();

  const handleToggleComplete = async () => {
    if (onToggleComplete) {
      onToggleComplete();
    }
    
    // Se temos um ID de aula e o usuário está logado, salvar no banco
    if (lessonId && user && courseId) {
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        // Buscar progresso atual
        const { data: progress, error: fetchError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', realCourseId)
          .maybeSingle();
          
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso:', fetchError);
          return;
        }
        
        // Preparar dados para salvar
        let subjectsData = progress?.subjects_data || {};
        
        // Garantir que subjectsData é um objeto
        if (typeof subjectsData !== 'object' || Array.isArray(subjectsData)) {
          subjectsData = {};
        }
        
        // Marcar aula como concluída ou não
        if (!subjectsData.completed_lessons) {
          subjectsData.completed_lessons = [];
        }
        
        const completedLessons = subjectsData.completed_lessons as string[];
        
        if (isCompleted) {
          // Remover da lista se já estava concluída
          const index = completedLessons.indexOf(lessonId);
          if (index > -1) {
            completedLessons.splice(index, 1);
          }
        } else {
          // Adicionar à lista se não estava concluída
          if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
          }
        }
        
        // Salvar dados atualizados
        if (progress) {
          const { error: updateError } = await supabase
            .from('user_course_progress')
            .update({
              subjects_data: {
                ...subjectsData,
                completed_lessons: completedLessons
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', progress.id);
            
          if (updateError) {
            console.error('Erro ao atualizar progresso:', updateError);
          } else {
            console.log('Aula marcada com sucesso:', !isCompleted);
            
            // Disparar evento para atualizar outros componentes
            window.dispatchEvent(new CustomEvent('topicCompleted'));
          }
        } else {
          // Criar novo registro de progresso
          const { error: insertError } = await supabase
            .from('user_course_progress')
            .insert({
              user_id: user.id,
              course_id: realCourseId,
              subjects_data: {
                ...subjectsData,
                completed_lessons: completedLessons
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Erro ao inserir progresso:', insertError);
          } else {
            console.log('Progresso criado com sucesso');
            
            // Disparar evento para atualizar outros componentes
            window.dispatchEvent(new CustomEvent('topicCompleted'));
          }
        }
      } catch (error) {
        console.error('Erro ao processar toggle da aula:', error);
      }
    }
  };

  return (
    <div className="bg-gray-50 rounded-md p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-4 rounded-full flex items-center justify-center cursor-pointer ${isCompleted ? 'bg-[#5f2ebe]' : 'bg-[rgba(38,47,60,0.2)]'}`}
            onClick={handleToggleComplete}
          >
            {isCompleted && <CheckIcon className="w-3 h-3 text-white" />}
          </div>
          <span className="font-medium text-sm text-[rgba(38,47,60,1)]">{title}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-[#5f2ebe]">Aprov. (%)</div>
          <div className="font-semibold text-[#5f2ebe]">{aproveitamento}%</div>
        </div>
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-[#5f2ebe]">Acertos</div>
          <div className="font-semibold text-[#5f2ebe]">{stats.hits}</div>
        </div>
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-[#ffac33]">Erros</div>
          <div className="font-semibold text-[#ffac33]">{stats.errors}</div>
        </div>
      </div>
    </div>
  );
};
