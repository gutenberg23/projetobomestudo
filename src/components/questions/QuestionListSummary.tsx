import React from "react";

interface QuestionListSummaryProps {
  count: number;
  hasFilters: boolean;
}

const QuestionListSummary: React.FC<QuestionListSummaryProps> = ({
  count,
  hasFilters
}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm text-gray-600">
        {hasFilters ? `${count} resultados com os filtros aplicados` : `${count} questões encontradas`}
      </p>
    </div>
  );
};

export default QuestionListSummary;
