import React from "react";
import { prepareHtmlContent } from "@/utils/text-utils";

interface BlogContentProps {
  content: string;
  className?: string;
}

export const BlogContent: React.FC<BlogContentProps> = ({ 
  content, 
  className = ""
}) => {
  return (
    <div 
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: prepareHtmlContent(content) }}
    />
  );
};