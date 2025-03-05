
"use client";

import React, { useState } from "react";
import type { Question } from "./types";
import { QuestionHeader } from "./question/QuestionHeader";
import { QuestionOption } from "./question/QuestionOption";
import { QuestionComment } from "./question/QuestionComment";
import { QuestionFooter } from "./question/QuestionFooter";
import { Send, ChevronDown, ChevronUp } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  disabledOptions: string[];
  onToggleDisabled: (optionId: string, event: React.MouseEvent) => void;
}
export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  disabledOptions,
  onToggleDisabled
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showOfficialAnswer, setShowOfficialAnswer] = useState(false);
  const [showAIAnswer, setShowAIAnswer] = useState(false);
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showExpandedContent, setShowExpandedContent] = useState(false);
  
  // Verificar se há conteúdo adicional para mostrar (imagens, textos longos, etc.)
  const hasExpandableContent = question.additionalContent || question.images?.length > 0;
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };
  
  const toggleOfficialAnswer = () => {
    setShowOfficialAnswer(!showOfficialAnswer);
  };
  
  const toggleAIAnswer = () => {
    setShowAIAnswer(!showAIAnswer);
  };
  
  const toggleExpandedContent = () => {
    setShowExpandedContent(!showExpandedContent);
  };
  
  const toggleLike = (commentId: string) => {
    setLikedComments(prev => prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]);
  };
  
  const handleOptionClick = (optionId: string) => {
    if (!disabledOptions.includes(optionId)) {
      setSelectedOption(optionId);
    }
  };
  
  const handleToggleDisabled = (optionId: string, event: React.MouseEvent) => {
    if (selectedOption === optionId) {
      setSelectedOption(null);
    }
    onToggleDisabled(optionId, event);
  };
  
  const handleSubmitComment = () => {
    if (comment.trim() !== "") {
      // Em uma implementação real, aqui seria o código para enviar o comentário ao backend
      console.log("Enviando comentário:", comment);
      setComment("");
    }
  };
  
  return <article className="w-full rounded-xl border border-solid border-gray-100 mb-5 bg-white">
      <header className="overflow-hidden rounded-t-xl rounded-b-none border-b border-gray-100">
        <QuestionHeader year={question.year} institution={question.institution} organization={question.organization} role={question.role} id={question.id} />
      </header>

      <div className="flex gap-2.5 items-start px-3 md:px-5 py-2.5 w-full text-base text-slate-800">
        <div className="flex flex-1 shrink gap-2.5 items-start px-2.5 py-5 w-full rounded-md basis-0 min-w-60 ">
          {hasExpandableContent && (
            <button 
              onClick={toggleExpandedContent} 
              className="flex items-center justify-center p-1 text-[#67748a] hover:text-[#5f2ebe] transition-colors focus:outline-none"
              aria-label={showExpandedContent ? "Recolher conteúdo adicional" : "Expandir conteúdo adicional"}
            >
              {showExpandedContent ? (
                <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </button>
          )}
          
          <div className="flex-1">
            {hasExpandableContent && showExpandedContent && (
              <div className="mb-4 border-b border-gray-100 pb-4">
                {question.images && question.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`Imagem ${index + 1} da questão ${question.id}`} 
                        className="max-w-full h-auto rounded-md"
                      />
                    ))}
                  </div>
                )}
                
                {question.additionalContent && (
                  <div className="text-[#67748a] text-sm md:text-base">
                    {question.additionalContent}
                  </div>
                )}
              </div>
            )}
            
            <p className="text-left text-sm md:text-base">
              {question.content}
            </p>
          </div>
        </div>
      </div>

      {question.options.map((option, index) => <QuestionOption key={option.id} id={option.id} text={option.text} index={index} isDisabled={disabledOptions.includes(option.id)} isSelected={selectedOption === option.id} isCorrect={index === 3} onToggleDisabled={handleToggleDisabled} onSelect={handleOptionClick} showAnswer={showAnswer} />)}

      <QuestionFooter 
        commentsCount={question.comments.length} 
        showComments={showComments} 
        showAnswer={showAnswer} 
        showOfficialAnswer={showOfficialAnswer}
        showAIAnswer={showAIAnswer}
        onToggleComments={toggleComments} 
        onToggleAnswer={toggleAnswer} 
        onToggleOfficialAnswer={toggleOfficialAnswer}
        onToggleAIAnswer={toggleAIAnswer}
        hasSelectedOption={selectedOption !== null} 
      />

      {showOfficialAnswer && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment comment={{
        id: "answer",
        author: "Professor",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: "Esta é a resposta comentada da questão. Aqui o professor explica detalhadamente a resolução.",
        timestamp: "Gabarito oficial",
        likes: 0
      }} isLiked={likedComments.includes("answer")} onToggleLike={toggleLike} />
        </section>}

      {showAIAnswer && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment comment={{
        id: "ai-answer",
        author: "BIA (BomEstudo IA)",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: question.aiExplanation || "Essa questão ainda não possui resposta da BIA.",
        timestamp: "Resposta da IA",
        likes: 0
      }} isLiked={likedComments.includes("ai-answer")} onToggleLike={toggleLike} />
        </section>}

      {showComments && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          {question.comments.map(comment => <QuestionComment key={comment.id} comment={comment} isLiked={likedComments.includes(comment.id)} onToggleLike={toggleLike} />)}

          <div className="flex justify-center items-center px-2 md:px-12 py-1.5 mt-2.5 w-full text-sm md:text-base leading-none text-slate-800 gap-2">
            <div className="flex overflow-hidden flex-1 shrink justify-center items-start w-full basis-0 min-w-0">
              <input type="text" placeholder="Escreva uma mensagem" value={comment} onChange={e => setComment(e.target.value)} className="overflow-hidden flex-1 shrink p-2 md:p-2.5 w-full rounded-3xl basis-0 min-w-0 border border-purple-300 focus:border-purple-500 focus:outline-none text-sm md:text-base" />
            </div>
            <button onClick={handleSubmitComment} className="p-2 md:p-2.5 rounded-full hover:bg-purple-50 flex-shrink-0">
              <Send className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
            </button>
          </div>
        </section>}
    </article>;
};
