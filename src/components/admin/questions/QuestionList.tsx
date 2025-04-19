import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash2, BarChart, Eraser, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuestionStats } from "@/components/new/question/QuestionStats";
import { QuestionItemType } from "./types";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import CriarSimuladoModal from "./modals/CriarSimuladoModal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { prepareHtmlContent } from "@/utils/text-utils";

interface QuestionListProps {
  questions: QuestionItemType[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  handleEditQuestion: (question: QuestionItemType) => void;
  handleRemoveQuestion: (id: string) => void;
  copyToClipboard: (text: string) => void;
  handleClearQuestionStats: (id: string) => void;
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
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showCreateSimuladoModal, setShowCreateSimuladoModal] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  const handleCreateSimulado = () => {
    if (selectedQuestions.length === 0) {
      toast.error("Selecione pelo menos uma questão para criar o simulado");
      return;
    }
    setShowCreateSimuladoModal(true);
  };

  const handleCloseCreateSimuladoModal = () => {
    setShowCreateSimuladoModal(false);
    setSelectedQuestions([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {selectedQuestions.length > 0 && (
            <Button
              onClick={handleCreateSimulado}
              className="bg-[#5f2ebe] hover:bg-[#4a1f9c] text-white"
            >
              Registrar Novo Simulado
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-full-content"
            checked={showFullContent}
            onCheckedChange={setShowFullContent}
          />
          <Label htmlFor="show-full-content">
            Mostrar conteúdo completo
          </Label>
        </div>
      </div>

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
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.length === questions.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                  />
                </TableHead>
                <TableHead>Questão</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Banca</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Categorias</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleQuestionSelect(question.id)}
                      className="rounded border-gray-300 text-[#5f2ebe] focus:ring-[#5f2ebe]"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 prose prose-sm max-w-none">
                      {showFullContent ? (
                        <div dangerouslySetInnerHTML={{ __html: prepareHtmlContent(question.content) }} />
                      ) : (
                        <div>
                          <div dangerouslySetInnerHTML={{ 
                            __html: prepareHtmlContent(question.content.substring(0, 100) + '...') 
                          }} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-[#5f2ebe] hover:text-[#4a1f9c]"
                            onClick={() => setShowFullContent(true)}
                          >
                            Ver mais
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{question.discipline}</TableCell>
                  <TableCell>{question.institution}</TableCell>
                  <TableCell>{question.role}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {question.topicos?.join(", ") || "Sem categorias"}
                    </div>
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
                              <PopoverContent className="w-[300px] p-0">
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
          itemsPerPage={10}
          totalItems={questions.length}
        />
      </div>

      {showCreateSimuladoModal && (
        <CriarSimuladoModal
          isOpen={showCreateSimuladoModal}
          onClose={handleCloseCreateSimuladoModal}
          selectedQuestions={selectedQuestions}
        />
      )}
    </div>
  );
};

export default QuestionList;

