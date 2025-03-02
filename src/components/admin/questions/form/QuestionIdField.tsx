
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

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
      </div>
    </div>
  );
};

export default QuestionIdField;
