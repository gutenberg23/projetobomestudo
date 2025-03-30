import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuestionListSummaryProps {
  count: number;
  hasFilters: boolean;
  questionsPerPage: string;
  setQuestionsPerPage: (value: string) => void;
}

const QuestionListSummary: React.FC<QuestionListSummaryProps> = ({
  count,
  hasFilters,
  questionsPerPage,
  setQuestionsPerPage
}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Mostrando <strong>{count}</strong> questões
        {hasFilters && " com filtros aplicados"}
      </p>
      <div className="flex items-center gap-4">
        <span className="text-sm whitespace-nowrap">Questões por página:</span>
        <Select value={questionsPerPage} onValueChange={value => setQuestionsPerPage(value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuestionListSummary;
