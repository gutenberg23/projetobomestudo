
import { Subject, Topic, SubjectStats, OverallStats } from "../types/editorialized";

export const calculateErrors = (exercisesDone: number, hits: number) => {
  return exercisesDone - hits;
};

export const calculatePerformance = (hits: number, exercisesDone: number) => {
  if (exercisesDone === 0) return 0;
  return Math.round((hits / exercisesDone) * 100);
};

export const calculateSubjectTotals = (topics: Topic[]): SubjectStats => {
  return topics.reduce((acc, topic) => ({
    exercisesDone: acc.exercisesDone + topic.exercisesDone,
    hits: acc.hits + topic.hits,
    errors: acc.errors + calculateErrors(topic.exercisesDone, topic.hits),
    completedTopics: acc.completedTopics + (topic.isDone ? 1 : 0),
    totalTopics: acc.totalTopics + 1
  }), {
    exercisesDone: 0,
    hits: 0,
    errors: 0,
    completedTopics: 0,
    totalTopics: 0
  });
};

export const calculateOverallStats = (subjects: Subject[]): OverallStats => {
  return subjects.reduce((acc, subject) => {
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
};
