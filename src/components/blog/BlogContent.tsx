import React from "react";
import { prepareHtmlContent } from "@/utils/text-utils";

interface BlogContentProps {
  content: string;
  className?: string;
  highlights?: Array<{id: string, text: string, color: string, note?: string}>;
}

export const BlogContent: React.FC<BlogContentProps> = ({ 
  content, 
  className = "",
  highlights = []
}) => {
  return (
    <div 
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: prepareHtmlContent(content, highlights) }}
    />
  );
};