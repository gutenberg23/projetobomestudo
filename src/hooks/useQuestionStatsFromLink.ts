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
        console.log('Processando link para usuário:', { link, userId });
        
        // Extrair filtros da URL
        const url = new URL(link);
        const searchParams = url.searchParams;
        
        console.log('Parâmetros da URL:', Array.from(searchParams.entries()));
        
        // Construir query baseada nos filtros
        let query = supabase.from('questoes').select('id');

        // Aplicar filtros baseados nos parâmetros da URL
        if (searchParams.has('disciplines')) {
          const disciplines = JSON.parse(decodeURIComponent(searchParams.get('disciplines') || '[]'));
          if (disciplines.length > 0) {
            console.log('Filtro disciplines:', disciplines);
            query = query.in('discipline', disciplines);
          }
        }

        if (searchParams.has('years')) {
          const years = JSON.parse(decodeURIComponent(searchParams.get('years') || '[]'));
          if (years.length > 0) {
            console.log('Filtro years:', years);
            query = query.in('year', years);
          }
        }

        if (searchParams.has('institutions')) {
          const institutions = JSON.parse(decodeURIComponent(searchParams.get('institutions') || '[]'));
          if (institutions.length > 0) {
            console.log('Filtro institutions:', institutions);
            query = query.in('institution', institutions);
          }
        }

        if (searchParams.has('organizations')) {
          const organizations = JSON.parse(decodeURIComponent(searchParams.get('organizations') || '[]'));
          if (organizations.length > 0) {
            console.log('Filtro organizations:', organizations);
            query = query.in('organization', organizations);
          }
        }

        if (searchParams.has('roles')) {
          const roles = JSON.parse(decodeURIComponent(searchParams.get('roles') || '[]'));
          if (roles.length > 0) {
            console.log('Filtro roles:', roles);
            query = query.contains('role', roles);
          }
        }

        if (searchParams.has('levels')) {
          const levels = JSON.parse(decodeURIComponent(searchParams.get('levels') || '[]'));
          if (levels.length > 0) {
            console.log('Filtro levels:', levels);
            query = query.in('level', levels);
          }
        }

        if (searchParams.has('difficulties')) {
          const difficulties = JSON.parse(decodeURIComponent(searchParams.get('difficulties') || '[]'));
          if (difficulties.length > 0) {
            console.log('Filtro difficulties:', difficulties);
            query = query.in('difficulty', difficulties);
          }
        }

        if (searchParams.has('subjects')) {
          const subjects = JSON.parse(decodeURIComponent(searchParams.get('subjects') || '[]'));
          if (subjects.length > 0) {
            console.log('Filtro subjects:', subjects);
            query = query.overlaps('assuntos', subjects);
          }
        }

        if (searchParams.has('topics')) {
          const topics = JSON.parse(decodeURIComponent(searchParams.get('topics') || '[]'));
          if (topics.length > 0) {
            console.log('Filtro topics:', topics);
            query = query.overlaps('assuntos', topics);
          }
        }

        if (searchParams.has('subtopics')) {
          const subtopics = JSON.parse(decodeURIComponent(searchParams.get('subtopics') || '[]'));
          if (subtopics.length > 0) {
            console.log('Filtro subtopics:', subtopics);
            query = query.overlaps('topicos', subtopics);
          }
        }

        if (searchParams.has('educationLevels')) {
          const educationLevels = JSON.parse(decodeURIComponent(searchParams.get('educationLevels') || '[]'));
          if (educationLevels.length > 0) {
            console.log('Filtro educationLevels:', educationLevels);
            query = query.in('level', educationLevels);
          }
        }

        // Buscar questões que correspondem aos filtros
        console.log('Query construída, buscando questões...');
        const { data: questions, error: questionsError } = await query;

        if (questionsError) {
          console.error('Erro ao buscar questões:', questionsError);
          setStats({
            totalQuestions: 0,
            totalAttempts: 0,
            correctAnswers: 0,
            wrongAnswers: 0
          });
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
        console.log('IDs das questões (primeiras 5):', questionIds.slice(0, 5));

        // Buscar tentativas do usuário para essas questões usando uma consulta que respeita RLS
        console.log('Buscando tentativas para', questionIds.length, 'questões');
        
        const { data: attempts, error: attemptsError } = await supabase
          .from('user_question_attempts')
          .select('question_id, is_correct')
          .eq('user_id', userId)
          .in('question_id', questionIds);

        if (attemptsError) {
          console.error('Erro ao buscar tentativas:', attemptsError);
          
          // Fallback: tentar buscar de respostas_alunos caso haja erro com user_question_attempts
          console.log('Tentando fallback com respostas_alunos...');
          const { data: fallbackAttempts, error: fallbackError } = await supabase
            .from('respostas_alunos')
            .select('questao_id, is_correta')
            .eq('aluno_id', userId)
            .in('questao_id', questionIds)
            .order('created_at', { ascending: false });

          if (fallbackError) {
            console.error('Erro no fallback também:', fallbackError);
            setStats({
              totalQuestions: questions.length,
              totalAttempts: 0,
              correctAnswers: 0,
              wrongAnswers: 0
            });
            return;
          }

          // Processar dados do fallback (removendo duplicatas - apenas a última resposta por questão)
          const uniqueAttempts = new Map();
          fallbackAttempts?.forEach(attempt => {
            if (!uniqueAttempts.has(attempt.questao_id)) {
              uniqueAttempts.set(attempt.questao_id, {
                question_id: attempt.questao_id,
                is_correct: attempt.is_correta
              });
            }
          });

          const processedAttempts = Array.from(uniqueAttempts.values());
          const totalAttempts = processedAttempts.length;
          const correctAnswers = processedAttempts.filter(a => a.is_correct).length;
          const wrongAnswers = totalAttempts - correctAnswers;

          console.log('Estatísticas do fallback calculadas:', {
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