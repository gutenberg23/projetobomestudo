
import React, { useState } from "react";
import { Subject as SubjectComponent } from "./components/Subject";
import { subjects } from "./data/subjects-data";

export const SubjectsList = () => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const toggleExpand = (subjectName: string) => {
    setExpandedSubject(expandedSubject === subjectName ? null : subjectName);
  };

  return (
    <div className="bg-white rounded-[10px] mb-10">
      {subjects.map(subject => (
        <SubjectComponent
          key={subject.name}
          subject={subject}
          isExpanded={expandedSubject === subject.name}
          onToggle={() => toggleExpand(subject.name)}
        />
      ))}
    </div>
  );
};

