import React from "react";
import { QuestionCard } from "@/components/new/QuestionCard";
import QuestionPagination from "./QuestionPagination";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionResultsProps {
  questions: any[];
  disabledOptions: { [key: string]: string[] };
  onToggleDisabled: (questionId: string, optionId: string, event: React.MouseEvent) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasFilters: boolean;
  loading?: boolean;
}

const QuestionResults: React.FC<QuestionResultsProps> = ({
  questions,
  disabledOptions,
  onToggleDisabled,
  currentPage,
  totalPages,
  onPageChange,
  hasFilters,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-8 mt-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center mt-8">
        <h3 className="text-xl font-semibold text-[#272f3c] mb-2">
          {hasFilters ? "Nenhuma questão corresponde aos filtros selecionados" : "Nenhuma questão disponível"}
        </h3>
        <p className="text-[#67748a]">
          {hasFilters 
            ? "Tente ajustar seus filtros para ver mais resultados." 
            : "Não há questões disponíveis no momento."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      {questions.map(question => (
        <QuestionCard
          key={question.id}
          question={question}
          disabledOptions={disabledOptions[question.id] || []}
          onToggleDisabled={(optionId, event) => onToggleDisabled(question.id, optionId, event)}
        />
      ))}
      
      {totalPages > 1 && (
        <QuestionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default QuestionResults;
