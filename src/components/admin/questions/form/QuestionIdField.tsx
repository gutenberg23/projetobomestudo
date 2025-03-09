
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, BarChart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuestionStats } from "@/components/new/question/QuestionStats";

interface QuestionIdFieldProps {
  questionId: string;
  copyToClipboard: (text: string) => void;
}

const QuestionIdField: React.FC<QuestionIdFieldProps> = ({
  questionId,
  copyToClipboard,
}) => {
  return (
    <div>
      <Label htmlFor="question-id">ID da Questão</Label>
      <div className="flex items-center gap-2">
        <Input 
          id="question-id" 
          value={questionId} 
          className="bg-gray-50"
          readOnly
        />
        <Button variant="outline" size="icon" onClick={() => copyToClipboard(questionId)}>
          <Copy className="h-4 w-4" />
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <BarChart className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[700px] p-0">
                  <QuestionStats questionId={questionId} />
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>Estatísticas da Questão</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default QuestionIdField;
