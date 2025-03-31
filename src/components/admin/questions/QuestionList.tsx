import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash2, BarChart, Eraser, Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuestionStats } from "@/components/new/question/QuestionStats";
import { QuestionItemType } from "./types";
import { Pagination } from "@/components/ui/pagination";

interface QuestionListProps {
  questions: QuestionItemType[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  handleEditQuestion: (question: QuestionItemType) => Promise<void>;
  handleRemoveQuestion: (id: string) => Promise<void>;
  copyToClipboard: (text: string) => void;
  handleClearQuestionStats: (id: string) => Promise<void>;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  currentPage,
  totalPages,
  onPageChange,
  handleEditQuestion,
  handleRemoveQuestion,
  copyToClipboard,
  handleClearQuestionStats,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        {questions.length} questões cadastradas
      </div>
      
      {questions.length === 0 ? (
        <p className="text-[#67748a] text-center py-6">Nenhuma questão cadastrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead>Banca</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>IA</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.year}</TableCell>
                  <TableCell>{question.institution}</TableCell>
                  <TableCell>{question.questionType}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center">
                            {question.aiExplanation ? (
                              <Bot className="h-4 w-4 text-green-500" />
                            ) : (
                              <Bot className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{question.aiExplanation ? "Explicação de IA disponível" : "Sem explicação de IA"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(question.id)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copiar ID</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditQuestion(question)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar questão</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleRemoveQuestion(question.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir questão</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleClearQuestionStats(question.id)}
                              className="border-amber-500 text-amber-500 hover:bg-amber-50"
                            >
                              <Eraser className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Limpar estatísticas</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <BarChart className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[700px] p-0">
                                <QuestionStats questionId={question.id} />
                              </PopoverContent>
                            </Popover>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Estatísticas da questão</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default QuestionList;

