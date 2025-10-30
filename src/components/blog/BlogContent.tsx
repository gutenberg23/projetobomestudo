import React, { useEffect, useRef } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (contentRef.current && highlights.length > 0) {
      // Aplicar highlights diretamente no DOM após o render
      applyHighlights();
    }
  }, [content, highlights]);
  
  const applyHighlights = () => {
    if (!contentRef.current) return;
    
    // Limpar highlights antigos
    const existingMarks = contentRef.current.querySelectorAll('mark[data-highlight-id]');
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent?.insertBefore(mark.firstChild, mark);
      }
      parent?.removeChild(mark);
    });
    
    // Aplicar novos highlights
    highlights.forEach(highlight => {
      const walker = document.createTreeWalker(
        contentRef.current!,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let node;
      while (node = walker.nextNode()) {
        const textNode = node as Text;
        if (textNode.textContent && textNode.textContent.includes(highlight.text)) {
          const text = textNode.textContent;
          const index = text.indexOf(highlight.text);
          
          if (index !== -1) {
            // Dividir o texto em três partes: antes, highlight e depois
            const before = text.substring(0, index);
            const highlighted = text.substring(index, index + highlight.text.length);
            const after = text.substring(index + highlight.text.length);
            
            // Criar os elementos
            const parent = textNode.parentNode;
            if (parent) {
              if (before) {
                parent.insertBefore(document.createTextNode(before), textNode);
              }
              
              const markElement = document.createElement('mark');
              markElement.style.backgroundColor = highlight.color;
              markElement.style.padding = '2px 4px';
              markElement.style.borderRadius = '2px';
              markElement.setAttribute('data-highlight-id', highlight.id);
              if (highlight.note) {
                markElement.setAttribute('data-note', highlight.note);
              }
              markElement.textContent = highlighted;
              parent.insertBefore(markElement, textNode);
              
              if (after) {
                parent.insertBefore(document.createTextNode(after), textNode);
              }
              
              parent.removeChild(textNode);
            }
          }
        }
      }
    });
  };
  
  return (
    <div 
      ref={contentRef}
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: prepareHtmlContent(content) }}
    />
  );
};