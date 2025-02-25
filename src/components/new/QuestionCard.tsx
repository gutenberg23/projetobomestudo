
"use client";
import React, { useState } from "react";
import type { Question } from "./types";
import { QuestionHeader } from "./question/QuestionHeader";
import { QuestionOption } from "./question/QuestionOption";
import { QuestionComment } from "./question/QuestionComment";
import { QuestionFooter } from "./question/QuestionFooter";
import { Send } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  disabledOptions: string[];
  onToggleDisabled: (optionId: string, event: React.MouseEvent) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  disabledOptions,
  onToggleDisabled,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showOfficialAnswer, setShowOfficialAnswer] = useState(false);
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleOfficialAnswer = () => {
    setShowOfficialAnswer(!showOfficialAnswer);
  };

  const toggleLike = (commentId: string) => {
    setLikedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleOptionClick = (optionId: string) => {
    if (!disabledOptions.includes(optionId)) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmitComment = () => {
    setComment("");
  };

  return (
    <article className="w-full rounded-xl border border-solid border-slate-200 mb-5">
      <QuestionHeader
        year={question.year}
        institution={question.institution}
        organization={question.organization}
        role={question.role}
        id={question.id}
      />

      <div className="flex gap-2.5 items-start px-3 md:px-5 py-2.5 w-full text-base text-slate-800">
        <div className="flex flex-1 shrink gap-2.5 items-start px-2.5 py-5 w-full rounded-md basis-0 min-w-60">
          <p className="flex-1 shrink gap-2.5 w-full basis-0 min-w-60">
            {question.content}
          </p>
        </div>
      </div>

      {question.options.map((option, index) => (
        <QuestionOption
          key={option.id}
          id={option.id}
          text={option.text}
          index={index}
          isDisabled={disabledOptions.includes(option.id)}
          isSelected={selectedOption === option.id}
          isCorrect={index === 3} // Letra 'D' é a resposta correta (índice 3)
          onToggleDisabled={onToggleDisabled}
          onSelect={handleOptionClick}
          showAnswer={showAnswer}
        />
      ))}

      <QuestionFooter
        commentsCount={question.comments.length}
        showComments={showComments}
        showAnswer={showAnswer}
        showOfficialAnswer={showOfficialAnswer}
        onToggleComments={toggleComments}
        onToggleAnswer={toggleAnswer}
        onToggleOfficialAnswer={toggleOfficialAnswer}
      />

      {showOfficialAnswer && (
        <section className="py-5 w-full border-t border-gray-100">
          <QuestionComment
            comment={{
              id: "answer",
              author: "Professor",
              avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
              content: "Esta é a resposta comentada da questão. Aqui o professor explica detalhadamente a resolução.",
              timestamp: "Gabarito oficial",
              likes: 0
            }}
            isLiked={likedComments.includes("answer")}
            onToggleLike={toggleLike}
          />
        </section>
      )}

      {showComments && (
        <section className="py-5 w-full border-t border-gray-100">
          {question.comments.map((comment) => (
            <QuestionComment
              key={comment.id}
              comment={comment}
              isLiked={likedComments.includes(comment.id)}
              onToggleLike={toggleLike}
            />
          ))}

          <div className="flex justify-center items-center px-3 md:px-12 py-1.5 mt-2.5 w-full text-base leading-none text-slate-800 gap-2">
            <div className="flex overflow-hidden flex-1 shrink justify-center items-start w-full basis-0 min-w-60">
              <input
                type="text"
                placeholder="Escreva uma mensagem"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="overflow-hidden flex-1 shrink p-2.5 w-full rounded-3xl basis-0 min-w-60 border border-purple-300 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <button 
              onClick={handleSubmitComment}
              className="p-2.5 rounded-full hover:bg-purple-50"
            >
              <Send className="w-5 h-5 text-purple-500" />
            </button>
          </div>
        </section>
      )}
    </article>
  );
};
