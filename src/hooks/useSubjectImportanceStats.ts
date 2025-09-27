import { useState, useEffect } from 'react';
import { Subject } from '@/components/course/types/editorialized';
import { supabase } from '@/integrations/supabase/client';

interface ImportanceStats {
  [topicId: number]: {
    questionsCount: number;
    percentage: number;
  };
}

export const useSubjectImportanceStats = (allSubjects: Subject[], currentUserId: string | undefined) => {
  const [importanceStats, setImportanceStats] = useState<ImportanceStats>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId || allSubjects.length === 0) {
      setImportanceStats({});
      return;
    }

    const calculateImportance = async () => {
      setIsLoading(true);
      
      try {
        // Collect all topic stats
        const topicQuestionCounts: { [topicId: number]: number } = {};
        let totalQuestions = 0;

        // Process each topic to get real question counts
        for (const subject of allSubjects) {
          for (const topic of subject.topics) {
            if (topic.link) {
              try {
                const url = new URL(topic.link);
                const searchParams = url.searchParams;
                
                // Build query based on URL filters (same logic as useQuestionStatsFromLink)
                let query = supabase.from('questoes').select('id');

                // Apply filters based on URL parameters
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

                // Get questions count
                const { data: questions, error } = await query;
                
                if (!error && questions) {
                  const count = questions.length;
                  topicQuestionCounts[topic.id] = count;
                  totalQuestions += count;
                } else {
                  topicQuestionCounts[topic.id] = 0;
                }
              } catch (error) {
                console.error('Error processing topic link:', error);
                topicQuestionCounts[topic.id] = 0;
              }
            } else {
              topicQuestionCounts[topic.id] = 0;
            }
          }
        }

        // Calculate percentages
        const stats: ImportanceStats = {};
        Object.entries(topicQuestionCounts).forEach(([topicIdStr, count]) => {
          const topicId = parseInt(topicIdStr);
          const percentage = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0;
          stats[topicId] = {
            questionsCount: count,
            percentage: Math.max(0, percentage) // Garantir que não seja negativo
          };
        });

        console.log('Estatísticas de importância calculadas:', stats);
        console.log('Total de questões para cálculo de percentual:', totalQuestions);

        setImportanceStats(stats);
      } catch (error) {
        console.error('Erro calculating importance stats:', error);
        setImportanceStats({});
      } finally {
        setIsLoading(false);
      }
    };

    calculateImportance();
  }, [allSubjects, currentUserId]);

  return { importanceStats, isLoading };
};