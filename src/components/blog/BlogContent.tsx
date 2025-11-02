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
    
    // Coletar todos os nós de texto
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes: Text[] = [];
    let node;
    
    while (node = walker.nextNode()) {
      const textNode = node as Text;
      if (textNode.textContent && textNode.textContent.trim()) {
        textNodes.push(textNode);
      }
    }
    
    // Construir um mapa de posição de cada nó de texto no contexto completo
    let currentPosition = 0;
    const nodeMap: Array<{node: Text, start: number, end: number, text: string}> = [];
    
    textNodes.forEach(node => {
      const text = node.textContent || '';
      const normalizedText = text.normalize('NFC');
      nodeMap.push({
        node,
        start: currentPosition,
        end: currentPosition + normalizedText.length,
        text: normalizedText
      });
      currentPosition += normalizedText.length;
    });
    
    // Encontrar a posição do texto a ser destacado no contexto completo
    const fullNormalizedText = nodeMap.map(n => n.text).join('');
    const startIndex = fullNormalizedText.indexOf(normalizedHighlightText);
    
    if (startIndex === -1) return;
    
    const endIndex = startIndex + normalizedHighlightText.length;
    
    // Encontrar quais nós de texto contêm partes do texto a ser destacado
    const affectedNodes = nodeMap.filter(nodeInfo => {
      return nodeInfo.start < endIndex && nodeInfo.end > startIndex;
    });
    
    // Aplicar highlight em cada nó afetado
    affectedNodes.forEach((nodeInfo, index) => {
      const node = nodeInfo.node;
      const nodeText = nodeInfo.text;
      
      // Calcular os índices dentro deste nó específico
      const highlightStart = Math.max(0, startIndex - nodeInfo.start);
      const highlightEnd = Math.min(nodeText.length, endIndex - nodeInfo.start);
      
      const before = nodeText.substring(0, highlightStart);
      const highlighted = nodeText.substring(highlightStart, highlightEnd);
      const after = nodeText.substring(highlightEnd);
      
      const parent = node.parentNode;
      if (!parent) return;
      
      const fragment = document.createDocumentFragment();
      
      if (before) {
        fragment.appendChild(document.createTextNode(before));
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
      fragment.appendChild(markElement);
      
      if (after) {
        fragment.appendChild(document.createTextNode(after));
      }
      
      parent.insertBefore(fragment, node);
      parent.removeChild(node);
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