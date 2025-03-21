
import { calculateSubjectTotals } from '../utils/statsCalculations';

export const useSubjectStats = (subject: any, lessons: any[]) => {
  const getSubjectStats = () => {
    const lessonStats = {
      questionsTotal: 0,
      questionsCorrect: 0,
      questionsWrong: 0
    };
    
    for (const lesson of lessons) {
      if (lesson.stats) {
        lessonStats.questionsTotal += (lesson.stats.total || 0);
        lessonStats.questionsCorrect += (lesson.stats.hits || 0);
        lessonStats.questionsWrong += (lesson.stats.errors || 0);
      }
      
      if ('total' in lesson && 'hits' in lesson && 'errors' in lesson) {
        const total = Number((lesson as any).total) || 0;
        const hits = Number((lesson as any).hits) || 0;
        const errors = Number((lesson as any).errors) || 0;
        
        lessonStats.questionsTotal += total;
        lessonStats.questionsCorrect += hits;
        lessonStats.questionsWrong += errors;
      }
    }
    
    console.log(`Estatísticas das aulas para ${subject.name || subject.titulo}:`, lessonStats);
    
    if (subject.questionsTotal !== undefined && 
        subject.questionsCorrect !== undefined && 
        subject.questionsWrong !== undefined) {
      
      const questionsTotal = Number(subject.questionsTotal) || 0;
      const questionsCorrect = Number(subject.questionsCorrect) || 0;
      const questionsWrong = Number(subject.questionsWrong) || 0;
      
      console.log(`Usando estatísticas do subject para ${subject.name || subject.titulo}:`, {
        questionsTotal,
        questionsCorrect,
        questionsWrong
      });
      
      return {
        progress: subject.progress || 0,
        questionsTotal: questionsTotal,
        questionsCorrect: questionsCorrect,
        questionsWrong: questionsWrong,
        aproveitamento: questionsTotal > 0 
          ? Math.round((questionsCorrect / questionsTotal) * 100) 
          : 0
      };
    }
    
    if (subject.progress !== undefined && 
        subject.questionsTotal !== undefined && 
        subject.questionsCorrect !== undefined && 
        subject.questionsWrong !== undefined) {
      
      const questionsTotal = Number(subject.questionsTotal) || 0;
      const questionsCorrect = Number(subject.questionsCorrect) || 0;
      const questionsWrong = Number(subject.questionsWrong) || 0;
      
      console.log(`Usando estatísticas do subject para ${subject.name || subject.titulo}:`, {
        questionsTotal,
        questionsCorrect,
        questionsWrong
      });
      
      return {
        progress: subject.progress,
        questionsTotal: questionsTotal,
        questionsCorrect: questionsCorrect,
        questionsWrong: questionsWrong,
        aproveitamento: questionsTotal > 0 
          ? Math.round((questionsCorrect / questionsTotal) * 100) 
          : 0
      };
    }
    
    if (subject.topics) {
      const stats = calculateSubjectTotals(subject.topics);
      
      const combinedStats = {
        totalTopics: stats.totalTopics,
        completedTopics: stats.completedTopics,
        exercisesDone: stats.exercisesDone + lessonStats.questionsTotal,
        hits: stats.hits + lessonStats.questionsCorrect,
        errors: stats.errors + lessonStats.questionsWrong
      };
      
      return {
        progress: combinedStats.totalTopics > 0 
          ? Math.round((combinedStats.completedTopics / combinedStats.totalTopics) * 100) 
          : 0,
        questionsTotal: combinedStats.exercisesDone,
        questionsCorrect: combinedStats.hits,
        questionsWrong: combinedStats.errors,
        aproveitamento: combinedStats.exercisesDone > 0 
          ? Math.round((combinedStats.hits / combinedStats.exercisesDone) * 100) 
          : 0
      };
    }
    
    if (subject.stats) {
      const combinedStats = {
        totalTopics: subject.stats.totalTopics || 0,
        completedTopics: subject.stats.completedTopics || 0,
        exercisesDone: (subject.stats.exercisesDone || 0) + lessonStats.questionsTotal,
        hits: (subject.stats.hits || 0) + lessonStats.questionsCorrect,
        errors: (subject.stats.errors || 0) + lessonStats.questionsWrong
      };
      
      return {
        progress: combinedStats.totalTopics > 0 
          ? Math.round((combinedStats.completedTopics / combinedStats.totalTopics) * 100) 
          : 0,
        questionsTotal: combinedStats.exercisesDone,
        questionsCorrect: combinedStats.hits,
        questionsWrong: combinedStats.errors,
        aproveitamento: combinedStats.exercisesDone > 0 
          ? Math.round((combinedStats.hits / combinedStats.exercisesDone) * 100) 
          : 0
      };
    }
    
    if (lessonStats.questionsTotal > 0) {
      return {
        progress: 0,
        questionsTotal: lessonStats.questionsTotal,
        questionsCorrect: lessonStats.questionsCorrect,
        questionsWrong: lessonStats.questionsWrong,
        aproveitamento: Math.round((lessonStats.questionsCorrect / lessonStats.questionsTotal) * 100)
      };
    }
    
    return {
      progress: 0,
      questionsTotal: 0,
      questionsCorrect: 0,
      questionsWrong: 0,
      aproveitamento: 0
    };
  };

  return { getSubjectStats };
};
