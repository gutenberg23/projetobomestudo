
"use client";
import React, { useState } from "react";
import type { Question } from "./types";
import { QuestionHeader } from "./question/QuestionHeader";
import { QuestionOption } from "./question/QuestionOption";
import { QuestionComment } from "./question/QuestionComment";
import { QuestionFooter } from "./question/QuestionFooter";

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
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const toggleComments = () => {
    setShowComments(!showComments);
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

  return (
    <article className="w-full rounded-xl border border-solid border-slate-200">
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
          onToggleDisabled={onToggleDisabled}
          onSelect={handleOptionClick}
        />
      ))}

      <QuestionFooter
        commentsCount={question.comments.length}
        showComments={showComments}
        onToggleComments={toggleComments}
      />

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

          <div className="flex justify-center items-start px-3 md:px-12 py-1.5 mt-2.5 w-full text-base leading-none text-slate-800">
            <div className="flex overflow-hidden flex-1 shrink justify-center items-start px-2.5 py-1.5 w-full rounded-3xl basis-0 bg-white bg-opacity-0 min-w-60">
              <input
                type="text"
                placeholder="Escreva uma mensagem"
                className="overflow-hidden flex-1 shrink p-2.5 w-full bg-white rounded-3xl basis-0 min-w-60"
              />
            </div>
          </div>
        </section>
      )}
    </article>
  );
};
