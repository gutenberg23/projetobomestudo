import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuestionStats {
  totalQuestions: number;
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export const useQuestionStatsFromLink = (link: string | undefined, userId: string | undefined) => {
  const [stats, setStats] = useState<QuestionStats>({
    totalQuestions: 0,
    totalAttempts: 0,
    correctAnswers: 0,
    wrongAnswers: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!link || !userId) {
      setStats({
        totalQuestions: 0,
        totalAttempts: 0,
        correctAnswers: 0,
        wrongAnswers: 0
      });
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Extrair filtros da URL
        const url = new URL(link);
        const searchParams = url.searchParams;
        
        console.log('Processando link:', link);
        console.log('Parâmetros da URL:', Array.from(searchParams.entries()));
        
        // Construir query baseada nos filtros
        let query = supabase.from('questoes').select('id');

        // Aplicar filtros baseados nos parâmetros da URL
        if (searchParams.has('disciplines')) {
          const disciplines = JSON.parse(decodeURIComponent(searchParams.get('disciplines') || '[]'));
          if (disciplines.length > 0) {
            query = query.in('discipline', disciplines);
          }
        }

        if (searchParams.has('years')) {
          const years = JSON.parse(decodeURIComponent(searchParams.get('years') || '[]'));
          if (years.length > 0) {
            query = query.in('year', years);
          }
        }

        if (searchParams.has('institutions')) {
          const institutions = JSON.parse(decodeURIComponent(searchParams.get('institutions') || '[]'));
          if (institutions.length > 0) {
            query = query.in('institution', institutions);
          }
        }

        if (searchParams.has('organizations')) {
          const organizations = JSON.parse(decodeURIComponent(searchParams.get('organizations') || '[]'));
          if (organizations.length > 0) {
            query = query.in('organization', organizations);
          }
        }

        if (searchParams.has('roles')) {
          const roles = JSON.parse(decodeURIComponent(searchParams.get('roles') || '[]'));
          if (roles.length > 0) {
            query = query.contains('role', roles);
          }
        }

        if (searchParams.has('levels')) {
          const levels = JSON.parse(decodeURIComponent(searchParams.get('levels') || '[]'));
          if (levels.length > 0) {
            query = query.in('level', levels);
          }
        }

        if (searchParams.has('difficulties')) {
          const difficulties = JSON.parse(decodeURIComponent(searchParams.get('difficulties') || '[]'));
          if (difficulties.length > 0) {
            query = query.in('difficulty', difficulties);
          }
        }

        if (searchParams.has('subjects')) {
          const subjects = JSON.parse(decodeURIComponent(searchParams.get('subjects') || '[]'));
          if (subjects.length > 0) {
            query = query.overlaps('assuntos', subjects);
          }
        }

        if (searchParams.has('topics')) {
          const topics = JSON.parse(decodeURIComponent(searchParams.get('topics') || '[]'));
          if (topics.length > 0) {
            query = query.overlaps('assuntos', topics);
          }
        }

        if (searchParams.has('subtopics')) {
          const subtopics = JSON.parse(decodeURIComponent(searchParams.get('subtopics') || '[]'));
          if (subtopics.length > 0) {
            query = query.overlaps('topicos', subtopics);
          }
        }

        if (searchParams.has('educationLevels')) {
          const educationLevels = JSON.parse(decodeURIComponent(searchParams.get('educationLevels') || '[]'));
          if (educationLevels.length > 0) {
            query = query.in('level', educationLevels);
          }
        }

        // Buscar questões que correspondem aos filtros
        const { data: questions, error: questionsError } = await query;

        if (questionsError) {
          console.error('Erro ao buscar questões:', questionsError);
          return;
        }

        console.log('Questões encontradas:', questions?.length || 0);

        if (!questions || questions.length === 0) {
          console.log('Nenhuma questão encontrada com os filtros aplicados');
          setStats({
            totalQuestions: 0,
            totalAttempts: 0,
            correctAnswers: 0,
            wrongAnswers: 0
          });
          return;
        }

        const questionIds = questions.map(q => q.id);
        console.log('IDs das questões:', questionIds.slice(0, 5), '...'); // Mostra apenas as primeiras 5

        // Buscar tentativas do usuário para essas questões
        const { data: attempts, error: attemptsError } = await supabase
          .from('user_question_attempts')
          .select('question_id, is_correct')
          .eq('user_id', userId)
          .in('question_id', questionIds);

        if (attemptsError) {
          console.error('Erro ao buscar tentativas:', attemptsError);
          return;
        }

        console.log('Tentativas encontradas:', attempts?.length || 0);

        // Calcular estatísticas
        const totalAttempts = attempts?.length || 0;
        const correctAnswers = attempts?.filter(a => a.is_correct).length || 0;
        const wrongAnswers = totalAttempts - correctAnswers;

        console.log('Estatísticas calculadas:', {
          totalQuestions: questions.length,
          totalAttempts,
          correctAnswers,
          wrongAnswers
        });

        setStats({
          totalQuestions: questions.length,
          totalAttempts,
          correctAnswers,
          wrongAnswers
        });

      } catch (error) {
        console.error('Erro ao processar link:', error);
        setStats({
          totalQuestions: 0,
          totalAttempts: 0,
          correctAnswers: 0,
          wrongAnswers: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [link, userId]);

  return { stats, isLoading };
};