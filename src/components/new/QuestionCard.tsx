
"use client";
import React, { useState } from "react";
import type { Question } from "./types";
import { Heart, X } from "lucide-react";

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
      <header className="flex overflow-hidden flex-wrap justify-between items-center px-3 md:px-5 py-2.5 w-full rounded-xl border border-gray-100 border-solid bg-slate-50 min-h-[74px] text-slate-800">
        <div className="flex overflow-hidden flex-wrap flex-1 shrink gap-2.5 justify-center items-center self-stretch p-2.5 my-auto text-xl font-semibold rounded-md basis-0 min-w-60">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/5b434683a48dcb3ab1d8aa45e0f2b75f8412fa47646fe3db3a95dfcf02b2ae05"
            alt="Question Icon"
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          />
          <p className="flex-1 shrink self-stretch my-auto basis-0">
            <span className="text-sm">Ano: </span>
            <span className="font-normal text-sm">{question.year}</span>
            <span className="text-sm"> Banca: </span>
            <span className="font-normal text-sm">{question.institution}</span>
            <span className="text-sm"> Órgão: </span>
            <span className="font-normal text-sm">{question.organization}</span>
            <span className="text-sm"> Prova: </span>
            <span className="font-normal text-sm">{question.role}</span>
          </p>
        </div>

        <div className="flex overflow-hidden gap-5 justify-center items-center self-stretch p-2.5 my-auto text-xs text-center whitespace-nowrap rounded-md max-sm:mx-auto">
          <span>{question.id}</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/504db5e9b44d4cf7733907a139351e9347df79d27f76a8de1ed62803c89e3f4e"
            alt="Add Question"
            className="object-contain shrink-0 self-stretch my-auto aspect-square w-[30px]"
          />
        </div>
      </header>

      <div className="flex gap-2.5 items-start px-3 md:px-5 py-2.5 w-full text-base text-slate-800">
        <div className="flex flex-1 shrink gap-2.5 items-start px-2.5 py-5 w-full rounded-md basis-0 min-w-60">
          <p className="flex-1 shrink gap-2.5 w-full basis-0 min-w-60">
            {question.content}
          </p>
        </div>
      </div>

      {question.options.map((option, index) => (
        <div
          key={option.id}
          className="flex gap-4 items-center px-3 md:px-5 py-1 w-full rounded-none min-h-16"
        >
          <button
            onClick={(e) => onToggleDisabled(option.id, e)}
            className="flex gap-5 justify-center items-center self-stretch rounded-xl min-h-[30px] w-[30px] hover:bg-slate-50"
          >
            <X className={`w-4 h-4 ${disabledOptions.includes(option.id) ? "text-red-500" : "text-slate-400"}`} />
          </button>
          <button
            onClick={() => handleOptionClick(option.id)}
            className={`flex flex-1 gap-4 items-center self-stretch p-3 text-base whitespace-normal rounded-xl border border-solid ${
              selectedOption === option.id
                ? "bg-[#F6F8FA] border-slate-200"
                : "border-slate-200"
            } ${disabledOptions.includes(option.id) ? "opacity-50 line-through" : ""}`}
            disabled={disabledOptions.includes(option.id)}
          >
            <span
              className={`gap-2.5 self-stretch font-bold text-center rounded border border-solid border-slate-200 min-h-[30px] w-[30px] flex items-center justify-center ${
                selectedOption === option.id && !disabledOptions.includes(option.id)
                  ? "text-white bg-fuchsia-500 border-fuchsia-500"
                  : "text-fuchsia-500"
              }`}
            >
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1 text-slate-800 text-left">
              {option.text}
            </span>
          </button>
        </div>
      ))}

      <footer className="flex flex-wrap justify-between items-center py-5 px-3 md:px-6 w-full text-base font-bold text-center gap-2">
        <button className="flex gap-2.5 justify-center self-stretch px-1 py-1.5 my-auto text-fuchsia-500 whitespace-nowrap rounded-xl border border-fuchsia-500 border-solid max-w-[200px] min-w-[184px] w-[194px]">
          <span className="flex flex-1 shrink gap-2.5 justify-center items-center py-2.5 pr-8 pl-8 basis-0">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/288c66bfe62029abf7528c9022abe131a86bde5c1210391982a321891847fdb8"
              alt="Answer Icon"
              className="object-contain shrink-0 self-stretch my-auto aspect-square w-[19px]"
            />
            <span>RESPONDER</span>
          </span>
        </button>

        <button
          onClick={toggleComments}
          className={`flex flex-1 shrink gap-2.5 justify-center self-stretch px-1 py-1.5 my-auto rounded-xl border border-purple-400 border-solid basis-0 max-w-60 min-w-[194px] ${
            showComments
              ? "text-gray-700 bg-purple-100"
              : "text-purple-400 bg-white"
          }`}
        >
          <span className="flex flex-1 shrink gap-2.5 justify-center items-center px-9 py-2.5 basis-0">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/283f4447cbe56834c54388a50ccfdcc43812b0b2d3ac6dcb10eee6172a18a930"
              alt="Messages Icon"
              className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
            />
            <span>
              MENSAGENS <span className="font-normal text-purple-800">({question.comments.length})</span>
            </span>
          </span>
        </button>

        <button className="flex flex-1 shrink gap-2.5 justify-center self-stretch px-1 py-1.5 my-auto text-purple-400 rounded-xl border border-purple-400 border-solid basis-0 max-w-[300px] min-w-[250px]">
          <span className="flex flex-1 shrink gap-2.5 justify-center items-center px-3 py-2.5 basis-0 min-w-60">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/174f9704483f501cce9c4ad9f0dc87d07a661f005489418fe45e6629b528100c"
              alt="Answer Key Icon"
              className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
            />
            <span>GABARITO COMENTADO</span>
          </span>
        </button>
      </footer>

      {showComments && (
        <section className="py-5 w-full border-t border-gray-100">
          {question.comments.map((comment) => (
            <article
              key={comment.id}
              className="flex flex-col justify-center px-3 md:px-12 py-2.5 w-full"
            >
              <div className="flex flex-wrap justify-between items-start w-full">
                <div className="flex flex-wrap flex-1 shrink items-start basis-0 min-w-60">
                  <img
                    src={comment.avatar}
                    alt={`${comment.author}'s avatar`}
                    className="object-contain w-9 aspect-square rounded-[100px]"
                  />
                  <div className="flex flex-col flex-1 shrink pl-3 basis-0 min-w-60">
                    <div className="flex gap-2.5 items-center self-start text-slate-800">
                      <span className="overflow-hidden self-stretch pr-px my-auto text-base font-extrabold leading-none">
                        {comment.author}
                      </span>
                      <time className="self-stretch my-auto text-xs leading-none text-center">
                        {comment.timestamp}
                      </time>
                    </div>
                    <p className="flex-1 shrink w-full text-base leading-6 basis-0 text-neutral-800">
                      {comment.content}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleLike(comment.id)}
                  className="flex gap-2.5 items-center py-2.5 text-base whitespace-nowrap transition-colors"
                >
                  <span className={likedComments.includes(comment.id) ? "text-fuchsia-500" : "text-slate-500"}>
                    {comment.likes + (likedComments.includes(comment.id) ? 1 : 0)}
                  </span>
                  <Heart
                    className={`w-6 h-6 ${
                      likedComments.includes(comment.id)
                        ? "fill-fuchsia-500 text-fuchsia-500"
                        : "text-slate-500"
                    }`}
                  />
                </button>
              </div>
            </article>
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

