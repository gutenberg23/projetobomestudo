
import React from "react";
import { QuestionCard } from "@/components/new/QuestionCard";
import QuestionPagination from "@/components/questions/QuestionPagination";
import QuestionListSummary from "@/components/questions/QuestionListSummary";
import { Question } from "@/components/new/types";

interface QuestionResultsProps {
  questions: Question[];
  disabledOptions: string[];
  onToggleDisabled: (optionId: string, event: React.MouseEvent) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  hasFilters: boolean;
}

const QuestionResults: React.FC<QuestionResultsProps> = ({
  questions,
  disabledOptions,
  onToggleDisabled,
  currentPage,
  totalPages,
  handlePageChange,
  hasFilters
}) => {
  return (
    <>
      <QuestionListSummary count={questions.length} hasFilters={hasFilters} />
      
      <hr className="border-t border-gray-200 w-full mb-6" />
      
      <div className="space-y-6 mb-8">
        {questions.map(question => (
          <QuestionCard 
            key={question.id} 
            question={question} 
            disabledOptions={disabledOptions} 
            onToggleDisabled={onToggleDisabled} 
          />
        ))}
      </div>
      
      <QuestionPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        handlePageChange={handlePageChange} 
      />
    </>
  );
};

export default QuestionResults;
