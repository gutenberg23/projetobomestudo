import { supabase } from '@/lib/supabase';

// Tipos de eventos de atividade
export type ActivityEventType = 
  | 'page_view'        // Visualização de página
  | 'login'            // Login (já registrado pelo trigger)
  | 'logout'           // Logout (já registrado pelo trigger)
  | 'profile_update'   // Atualização de perfil
  | 'question_answer'  // Resposta a uma questão
  | 'notebook_create'  // Criação de caderno
  | 'notebook_delete'  // Exclusão de caderno
  | 'comment_create'   // Criação de comentário
  | 'comment_like'     // Curtida em comentário
  | 'course_favorite'  // Favoritar curso
  | 'subject_favorite' // Favoritar disciplina
  | 'exam_complete';   // Completar simulado

// Interface para log de atividade
interface ActivityLog {
  user_id: string;
  event_type: ActivityEventType;
  page?: string;
  description?: string;
  resource_id?: string;
  resource_type?: string;
  metadata?: Record<string, any>;
}

// Serviço para registrar atividades do usuário
export const ActivityLogger = {
  /**
   * Registra uma atividade do usuário
   */
  async logActivity(activity: Omit<ActivityLog, 'user_id'>) {
    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }
      
      // Registrar atividade
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          event_type: activity.event_type,
          page: activity.page,
          description: activity.description,
          resource_id: activity.resource_id,
          resource_type: activity.resource_type,
          metadata: activity.metadata || {}
        });
      
      if (error) {
        console.error('Erro ao registrar atividade:', error);
      }
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  },
  
  /**
   * Registra visualização de página
   */
  async logPageView(page: string, description?: string) {
    return this.logActivity({
      event_type: 'page_view',
      page,
      description: description || `Acessou a página ${page}`
    });
  },
  
  /**
   * Registra atualização de perfil
   */
  async logProfileUpdate(description?: string) {
    return this.logActivity({
      event_type: 'profile_update',
      description: description || 'Atualizou dados do perfil'
    });
  },
  
  /**
   * Registra resposta a uma questão
   */
  async logQuestionAnswer(questionId: string, metadata?: Record<string, any>) {
    return this.logActivity({
      event_type: 'question_answer',
      resource_id: questionId,
      resource_type: 'question',
      description: `Respondeu à questão ${questionId}`,
      metadata
    });
  },
  
  /**
   * Registra criação de caderno
   */
  async logNotebookCreate(notebookId: string, notebookName: string) {
    return this.logActivity({
      event_type: 'notebook_create',
      resource_id: notebookId,
      resource_type: 'notebook',
      description: `Criou o caderno "${notebookName}"`
    });
  },
  
  /**
   * Registra exclusão de caderno
   */
  async logNotebookDelete(notebookId: string, notebookName: string) {
    return this.logActivity({
      event_type: 'notebook_delete',
      resource_id: notebookId,
      resource_type: 'notebook',
      description: `Excluiu o caderno "${notebookName}"`
    });
  },
  
  /**
   * Registra criação de comentário
   */
  async logCommentCreate(commentId: string, resourceId: string, resourceType: string) {
    return this.logActivity({
      event_type: 'comment_create',
      resource_id: commentId,
      resource_type: 'comment',
      description: `Comentou em ${resourceType} ${resourceId}`,
      metadata: {
        target_resource_id: resourceId,
        target_resource_type: resourceType
      }
    });
  },
  
  /**
   * Registra curtida em comentário
   */
  async logCommentLike(commentId: string) {
    return this.logActivity({
      event_type: 'comment_like',
      resource_id: commentId,
      resource_type: 'comment',
      description: `Curtiu o comentário ${commentId}`
    });
  },
  
  /**
   * Registra favoritar curso
   */
  async logCourseFavorite(courseId: string, courseName: string) {
    return this.logActivity({
      event_type: 'course_favorite',
      resource_id: courseId,
      resource_type: 'course',
      description: `Favoritou o curso "${courseName}"`
    });
  },
  
  /**
   * Registra favoritar disciplina
   */
  async logSubjectFavorite(subjectId: string, subjectName: string) {
    return this.logActivity({
      event_type: 'subject_favorite',
      resource_id: subjectId,
      resource_type: 'subject',
      description: `Favoritou a disciplina "${subjectName}"`
    });
  },
  
  /**
   * Registra conclusão de simulado
   */
  async logExamComplete(examId: string, examName: string, metadata?: Record<string, any>) {
    return this.logActivity({
      event_type: 'exam_complete',
      resource_id: examId,
      resource_type: 'exam',
      description: `Concluiu o simulado "${examName}"`,
      metadata
    });
  }
}; 