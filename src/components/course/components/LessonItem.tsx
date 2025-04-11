import React, { useEffect, useState } from 'react';
import { CheckIcon } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';
import { Percent, CheckCircle, XCircle } from 'lucide-react';

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
  onToggleComplete,
  lessonId
}) => {
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const [isSaving, setIsSaving] = useState(false);
  const aproveitamento = stats.total > 0 
    ? Math.round((stats.hits / stats.total) * 100) 
    : 0;

  useEffect(() => {
    setLocalCompleted(isCompleted);
  }, [isCompleted]);

  const handleToggleComplete = async () => {
    if (!user) {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado para marcar aulas como concluídas.",
        variant: "destructive"
      });
      return;
    }

    if (isSaving || !courseId || !lessonId) return;

    try {
      setIsSaving(true);
      setLocalCompleted(!localCompleted);
      
      // Log para acompanhamento
      console.log(`[${new Date().toISOString()}] Alternando conclusão da aula: ${title}, novo estado: ${!localCompleted}`);
      
      // Salvar estado no banco de dados
      if (courseId && lessonId) {
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        const { data: existingProgress, error: fetchError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', realCourseId)
          .maybeSingle();
          
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso do usuário:', fetchError);
          setIsSaving(false);
          return;
        }
        
        // Garantir que subjects_data é um objeto
        let subjectsData: Record<string, any> = {};
        
        if (existingProgress?.subjects_data) {
          if (typeof existingProgress.subjects_data === 'object' && !Array.isArray(existingProgress.subjects_data)) {
            // Se for um objeto, usar diretamente
            subjectsData = existingProgress.subjects_data as Record<string, any>;
          }
        }
        
        // Garantir que completed_lessons existe dentro de subjectsData
        if (!subjectsData.completed_lessons) {
          subjectsData.completed_lessons = {};
        }
        
        if (!localCompleted) {
          // Marcar como concluída
          subjectsData.completed_lessons[lessonId] = true;
        } else {
          // Marcar como não concluída
          if (subjectsData.completed_lessons) {
            delete subjectsData.completed_lessons[lessonId];
          }
        }
        
        // Lógica adicional para contar o total de lições e lições completadas para atualizar o progresso
        let totalCompletedLessons = 0;
        let totalLessons = 0;
        
        // Contar lições concluídas
        if (subjectsData.completed_lessons) {
          totalCompletedLessons = Object.keys(subjectsData.completed_lessons).length;
        }
        
        // Buscar total de lições no curso
        try {
          const { data: courseData, error: courseError } = await supabase
            .from('cursos')
            .select('aulas_ids')
            .eq('id', realCourseId)
            .single();
            
          if (!courseError && courseData?.aulas_ids) {
            totalLessons = Array.isArray(courseData.aulas_ids) ? courseData.aulas_ids.length : 0;
          }
        } catch (error) {
          console.error('Erro ao buscar total de lições:', error);
        }
        
        if (existingProgress) {
          const { error: updateError } = await supabase
            .from('user_course_progress')
            .update({
              subjects_data: subjectsData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);
            
          if (updateError) {
            console.error('Erro ao atualizar progresso do usuário:', updateError);
          } else {
            console.log('Progresso atualizado com sucesso');
          }
        } else {
          const { error: insertError } = await supabase
            .from('user_course_progress')
            .insert({
              user_id: user.id,
              course_id: realCourseId,
              subjects_data: subjectsData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Erro ao inserir progresso do usuário:', insertError);
          } else {
            console.log('Progresso inserido com sucesso');
          }
        }
        
        // Disparar evento para atualizar o progresso global no painel
        const topicCompletedEvent = new CustomEvent('topicCompleted', {
          detail: { 
            title, 
            completed: !localCompleted,
            totalCompletedLessons,
            totalLessons
          }
        });
        document.dispatchEvent(topicCompletedEvent);
        
        // Emitir evento para atualizar o progresso global
        const event = new CustomEvent('questionAnswered', {
          detail: { 
            courseId, 
            lessonId, 
            completed: !localCompleted,
            totalCompletedLessons,
            totalLessons
          }
        });
        window.dispatchEvent(event);
      }
      
      if (onToggleComplete) {
        onToggleComplete();
      }
    } catch (error) {
      console.error('Erro ao alterar estado de conclusão:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-md p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-4 rounded-full flex items-center justify-center cursor-pointer ${localCompleted ? 'bg-[#5f2ebe]' : 'bg-[rgba(38,47,60,0.2)]'}`}
            onClick={handleToggleComplete}
          >
            {localCompleted && <CheckIcon className="w-3 h-3 text-white" />}
          </div>
          <span className="font-medium text-sm text-[rgba(38,47,60,1)]">{title}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
        <div className="bg-white p-1.5 rounded text-center">
          <div className="flex items-center justify-center gap-1">
            <Percent className="w-4 h-4 text-[#5f2ebe]" />
            <div className="font-semibold text-[#5f2ebe]">{aproveitamento}%</div>
          </div>
        </div>
        <div className="bg-white p-1.5 rounded text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4 text-[#5f2ebe]" />
            <div className="font-semibold text-[#5f2ebe]">{stats.hits}</div>
          </div>
        </div>
        <div className="bg-white p-1.5 rounded text-center">
          <div className="flex items-center justify-center gap-1">
            <XCircle className="w-4 h-4 text-[#ffac33]" />
            <div className="font-semibold text-[#ffac33]">{stats.errors}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
