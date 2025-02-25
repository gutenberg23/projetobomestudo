"use client";
import React from "react";
import type { Comment } from "./types";

interface CommentSectionProps {
  comments: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments }) => {
  return (
    <section className="py-5 w-full border-t border-gray-100">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className="flex flex-col justify-center px-12 py-2.5 w-full"
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
            <div className="flex gap-2.5 items-center py-2.5 text-base text-fuchsia-500 whitespace-nowrap">
              <span>{comment.likes}</span>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/68137af7ca7df9722098a91678797416217c8385c509a18c9d370f7facac12c7?placeholderIfAbsent=true"
                alt="Like"
                className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
              />
            </div>
          </div>
        </article>
      ))}

      <div className="flex justify-center items-start px-12 py-1.5 mt-2.5 w-full text-base leading-none text-slate-800">
        <div className="flex overflow-hidden flex-1 shrink justify-center items-start px-2.5 py-1.5 w-full rounded-3xl basis-0 bg-white bg-opacity-0 min-w-60">
          <input
            type="text"
            placeholder="Escreva uma mensagem"
            className="overflow-hidden flex-1 shrink p-2.5 w-full bg-white rounded-3xl basis-0 min-w-60"
          />
        </div>
      </div>
    </section>
  );
};
