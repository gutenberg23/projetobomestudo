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
    
    // Normalizar o texto do highlight (preservando espaços únicos)
    const normalizedHighlightText = highlight.text
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim();
    
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
      if (textNode.textContent) {
        textNodes.push(textNode);
      }
    }
    
    // Construir um mapa de posição de cada nó de texto no contexto completo
    // Normalizar todos os espaços em branco para um único espaço
    let currentPosition = 0;
    const nodeMap: Array<{node: Text, start: number, end: number, text: string, originalText: string}> = [];
    
    textNodes.forEach(node => {
      const originalText = node.textContent || '';
      const normalizedText = originalText.normalize('NFC').replace(/\s+/g, ' ');
      
      nodeMap.push({
        node,
        start: currentPosition,
        end: currentPosition + normalizedText.length,
        text: normalizedText,
        originalText
      });
      currentPosition += normalizedText.length;
    });
    
    // Construir o texto completo normalizado
    const fullNormalizedText = nodeMap.map(n => n.text).join('');
    
    // Procurar o texto a ser destacado
    const startIndex = fullNormalizedText.indexOf(normalizedHighlightText);
    
    if (startIndex === -1) return;
    
    const endIndex = startIndex + normalizedHighlightText.length;
    
    // Encontrar quais nós de texto contêm partes do texto a ser destacado
    const affectedNodes = nodeMap.filter(nodeInfo => {
      return nodeInfo.start < endIndex && nodeInfo.end > startIndex;
    });
    
    // Aplicar highlight em cada nó afetado (do último para o primeiro para evitar problemas de indexação)
    for (let i = affectedNodes.length - 1; i >= 0; i--) {
      const nodeInfo = affectedNodes[i];
      const node = nodeInfo.node;
      const nodeText = nodeInfo.text;
      const originalText = nodeInfo.originalText;
      
      // Calcular os índices dentro deste nó específico
      const highlightStartInNode = Math.max(0, startIndex - nodeInfo.start);
      const highlightEndInNode = Math.min(nodeText.length, endIndex - nodeInfo.start);
      
      // Mapear os índices normalizados de volta para o texto original
      // Isso é necessário porque o texto original pode ter múltiplos espaços
      let originalStartIdx = 0;
      let normalizedIdx = 0;
      
      // Encontrar o índice inicial no texto original
      for (let j = 0; j < originalText.length && normalizedIdx < highlightStartInNode; j++) {
        const char = originalText[j];
        if (/\s/.test(char)) {
          // Espaço em branco no original corresponde a um espaço único no normalizado
          if (normalizedIdx < highlightStartInNode) {
            normalizedIdx++;
            originalStartIdx = j + 1;
          }
        } else {
          normalizedIdx++;
          originalStartIdx = j + 1;
        }
      }
      
      // Encontrar o índice final no texto original
      let originalEndIdx = originalStartIdx;
      for (let j = originalStartIdx; j < originalText.length && normalizedIdx < highlightEndInNode; j++) {
        const char = originalText[j];
        if (/\s/.test(char)) {
          if (normalizedIdx < highlightEndInNode) {
            normalizedIdx++;
            originalEndIdx = j + 1;
          }
        } else {
          normalizedIdx++;
          originalEndIdx = j + 1;
        }
      }
      
      const before = originalText.substring(0, originalStartIdx);
      const highlighted = originalText.substring(originalStartIdx, originalEndIdx);
      const after = originalText.substring(originalEndIdx);
      
      const parent = node.parentNode;
      if (!parent) continue;
      
      const fragment = document.createDocumentFragment();
      
      if (before) {
        fragment.appendChild(document.createTextNode(before));
      }
      
      if (highlighted) {
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
      }
      
      if (after) {
        fragment.appendChild(document.createTextNode(after));
      }
      
      parent.insertBefore(fragment, node);
      parent.removeChild(node);
    }
  };
  
  return (
    <div 
      ref={contentRef}
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: prepareHtmlContent(content) }}
    />
  );
};