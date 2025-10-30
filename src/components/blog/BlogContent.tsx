import React, { useEffect, useRef } from "react";
import { prepareHtmlContent } from "@/utils/text-utils";

interface BlogContentProps {
  content: string;
  className?: string;
  highlights?: Array<{id: string, text: string, html?: string, color: string, note?: string}>;
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
      applyHighlightToText(highlight);
    });
  };
  
  const applyHighlightToText = (highlight: {id: string, text: string, color: string, note?: string}) => {
    if (!contentRef.current) return;
    
    // Normalizar o texto do highlight
    const normalizedHighlightText = highlight.text
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Obter todo o conteúdo de texto do elemento
    const fullText = contentRef.current.textContent || '';
    
    // Se o texto não estiver presente no conteúdo, retornar
    if (!fullText.includes(normalizedHighlightText)) return;
    
    // Aplicar highlight a cada nó de texto que contenha parte do texto
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const nodesToProcess: {node: Text, text: string}[] = [];
    let node;
    
    // Coletar todos os nós de texto
    while (node = walker.nextNode()) {
      const textNode = node as Text;
      if (textNode.textContent) {
        nodesToProcess.push({
          node: textNode,
          text: textNode.textContent
        });
      }
    }
    
    // Processar cada nó para encontrar e aplicar highlights
    nodesToProcess.forEach(({node, text}) => {
      if (text.includes(normalizedHighlightText)) {
        // Se o nó contém o texto completo, aplicar highlight diretamente
        const index = text.indexOf(normalizedHighlightText);
        if (index !== -1) {
          const before = text.substring(0, index);
          const highlighted = text.substring(index, index + normalizedHighlightText.length);
          const after = text.substring(index + normalizedHighlightText.length);
          
          const parent = node.parentNode;
          if (parent) {
            if (before) {
              parent.insertBefore(document.createTextNode(before), node);
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
            parent.insertBefore(markElement, node);
            
            if (after) {
              parent.insertBefore(document.createTextNode(after), node);
            }
            
            parent.removeChild(node);
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