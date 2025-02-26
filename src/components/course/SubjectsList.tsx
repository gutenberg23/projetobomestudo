import React from 'react';
import { SubjectLessons } from './components/SubjectLessons';
import { Subject } from './types/subjects';
import { subjects } from './data/subjects-data';

export const SubjectsList = () => {
  return (
    <div>
      {subjects.map((subject, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{subject.name}</h2>
          <SubjectLessons lessons={subject.lessons} />
        </div>
      ))}
    </div>
  );
};
