import React from "react";
import { Heart } from "lucide-react";
import type { Comment } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuestionCommentProps {
  comment: Comment;
  isLiked: boolean;
  onToggleLike: (commentId: string) => void;
}

export const QuestionComment: React.FC<QuestionCommentProps> = ({
  comment,
  isLiked,
  onToggleLike,
}) => {
  return (
    <article className="flex flex-col justify-center px-5 py-2.5 w-full">
      <div className="flex flex-wrap justify-between items-start w-full">
        <div className="flex flex-wrap flex-1 shrink items-start basis-0 min-w-60">
          <div className="hidden md:block">
            <Avatar className="w-9 h-9">
              <AvatarImage src={comment.avatar} alt={`${comment.author}'s avatar`} />
              <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col flex-1 shrink pl-0 md:pl-3 basis-0 min-w-60">
            <div className="flex gap-2.5 items-center self-start text-slate-800">
              <span className="overflow-hidden self-stretch pr-px my-auto text-base font-extrabold leading-none">
                {comment.author}
              </span>
              <time className="self-stretch my-auto text-xs leading-none text-center">
                {comment.timestamp}
              </time>
            </div>
            <div 
              className="flex-1 shrink w-full text-base leading-6 basis-0 text-neutral-800"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
        </div>
        <button
          onClick={() => onToggleLike(comment.id)}
          className={`flex items-center gap-1 text-sm ${
            isLiked ? 'text-[#5f2ebe]' : 'text-gray-500 hover:text-[#5f2ebe]'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{comment.likes}</span>
        </button>
      </div>
    </article>
  );
};
