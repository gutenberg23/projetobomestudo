
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash, BarChart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuestionStats } from "@/components/new/question/QuestionStats";
import { QuestionItemType } from "./types";

interface QuestionListProps {
  filteredQuestions: QuestionItemType[];
  selectedQuestions: string[];
  toggleQuestionSelection: (id: string) => void;
  handleCreateSimulado: () => void;
  handleRemoveQuestion: (id: string) => void;
  handleEditQuestion: (question: QuestionItemType) => void;
  copyToClipboard: (text: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  filteredQuestions,
  selectedQuestions,
  toggleQuestionSelection,
  handleCreateSimulado,
  handleRemoveQuestion,
  handleEditQuestion,
  copyToClipboard,
}) => {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-4">
        {filteredQuestions.length} questões encontradas
      </div>
      
      {filteredQuestions.length === 0 ? (
        <p className="text-[#67748a] text-center py-6">Nenhuma questão cadastrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={filteredQuestions.length > 0 && selectedQuestions.length === filteredQuestions.length} 
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // Selecionar todas as questões
                        const allIds = filteredQuestions.map(q => q.id);
                        toggleQuestionSelection(allIds.join(','));
                      } else {
                        // Desmarcar todas
                        toggleQuestionSelection('');
                      }
                    }} 
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Banca</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedQuestions.includes(question.id)} 
                      onCheckedChange={() => toggleQuestionSelection(question.id)} 
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {question.id}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <BarChart className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[700px] p-0">
                                <QuestionStats />
                              </PopoverContent>
                            </Popover>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Estatísticas da Questão</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>{question.year}</TableCell>
                  <TableCell>{question.institution}</TableCell>
                  <TableCell>{question.discipline}</TableCell>
                  <TableCell>{question.questionType}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(question.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditQuestion(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRemoveQuestion(question.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleCreateSimulado}
          className="bg-[#272f3c] hover:bg-[#1a1f28] text-white"
          disabled={selectedQuestions.length === 0}
        >
          Criar Simulado ({selectedQuestions.length} questões selecionadas)
        </Button>
      </div>
    </div>
  );
};

export default QuestionList;
