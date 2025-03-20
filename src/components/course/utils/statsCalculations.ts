
import { Subject, Topic, SubjectStats, OverallStats } from "../types/editorialized";

export const calculateErrors = (exercisesDone: number, hits: number) => {
  return exercisesDone - hits;
};

export const calculatePerformance = (hits: number, exercisesDone: number) => {
  if (exercisesDone === 0) return 0;
  return Math.round((hits / exercisesDone) * 100);
};

export const calculateSubjectTotals = (topics: Topic[]): SubjectStats => {
  const exercisesDone = topics.reduce((acc, topic) => acc + topic.exercisesDone, 0);
  const hits = topics.reduce((acc, topic) => acc + topic.hits, 0);
  const errors = topics.reduce((acc, topic) => acc + calculateErrors(topic.exercisesDone, topic.hits), 0);
  const completedTopics = topics.filter(topic => topic.isDone).length;
  const totalTopics = topics.length;
  const hitRate = exercisesDone > 0 ? Math.round((hits / exercisesDone) * 100) : 0;
  const completionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return {
    subjectId: '',  // This will be filled by caller if needed
    subjectName: '', // This will be filled by caller if needed
    exercisesDone,
    hits,
    errors,
    completedTopics,
    totalTopics,
    total: exercisesDone,
    hitRate,
    completionRate
  };
};

export const calculateOverallStats = (subjects: Subject[]): OverallStats => {
  const stats = subjects.reduce((acc, subject) => {
    const subjectTotals = calculateSubjectTotals(subject.topics);
    return {
      totalExercises: acc.totalExercises + subjectTotals.exercisesDone,
      totalHits: acc.totalHits + subjectTotals.hits,
      totalErrors: acc.totalErrors + subjectTotals.errors,
      completedTopics: acc.completedTopics + subjectTotals.completedTopics,
      totalTopics: acc.totalTopics + subjectTotals.totalTopics
    };
  }, {
    totalExercises: 0,
    totalHits: 0,
    totalErrors: 0,
    completedTopics: 0,
    totalTopics: 0
  });

  const hitRate = stats.totalExercises > 0 
    ? Math.round((stats.totalHits / stats.totalExercises) * 100) 
    : 0;
  
  const completionRate = stats.totalTopics > 0 
    ? Math.round((stats.completedTopics / stats.totalTopics) * 100) 
    : 0;

  return {
    hits: stats.totalHits,
    errors: stats.totalErrors,
    total: stats.totalExercises,
    hitRate,
    completedTopics: stats.completedTopics,
    totalTopics: stats.totalTopics,
    completionRate,
    totalHits: stats.totalHits,
    totalErrors: stats.totalErrors,
    totalExercises: stats.totalExercises
  };
};
