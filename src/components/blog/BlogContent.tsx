import React, { useEffect, useRef } from "react";
import { prepareHtmlContent } from "@/utils/text-utils";

interface BlogContentProps {
  content: string;
  className?: string;
  highlights?: Array<{id: string, text: string, html?: string, color: string, note?: string}>;
  showQuestionTags?: boolean; // New prop to control question tag display
}

export const BlogContent: React.FC<BlogContentProps> = ({ 
  content, 
  className = "",
  highlights = [],
  showQuestionTags = false // Default to false to preserve existing behavior
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (contentRef.current && highlights.length > 0) {
      // Aplicar highlights diretamente no DOM após o render
      applyHighlights();
    }
    
    // Apply table header styling
    if (contentRef.current) {
      applyTableHeaderStyling();
    }
  }, [content, highlights]);
  
  const applyTableHeaderStyling = () => {
    if (!contentRef.current) return;
    
    // Find all table header elements
    const thElements = contentRef.current.querySelectorAll('th');
    thElements.forEach(th => {
      // Apply background color and text styling
      th.style.backgroundColor = 'rgb(95, 46, 190)';
      th.style.color = 'white';
      th.style.fontWeight = 'bold';
      th.style.padding = '8px';
    });
  };
  
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
    
    if (!normalizedHighlightText) return;
    
    // Função para coletar todos os nós de texto recursivamente
    const collectTextNodes = (node: Node): Text[] => {
      const textNodes: Text[] = [];
      
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node as Text);
      } else {
        node.childNodes.forEach(child => {
          textNodes.push(...collectTextNodes(child));
        });
      }
      
      return textNodes;
    };
    
    // Coletar todos os nós de texto
    const textNodes = collectTextNodes(contentRef.current);
    
    if (textNodes.length === 0) return;
    
    // Construir texto completo e mapa de nós
    let fullText = '';
    const nodeMap: Array<{
      node: Text;
      startIndex: number;
      endIndex: number;
      originalText: string;
      normalizedText: string;
    }> = [];
    
    textNodes.forEach(node => {
      const originalText = node.textContent || '';
      const normalizedText = originalText.normalize('NFC').replace(/\s+/g, ' ');
      
      const startIndex = fullText.length;
      const endIndex = startIndex + normalizedText.length;
      
      nodeMap.push({
        node,
        startIndex,
        endIndex,
        originalText,
        normalizedText
      });
      
      fullText += normalizedText;
    });
    
    // Encontrar a posição do texto a destacar
    const highlightStartIndex = fullText.indexOf(normalizedHighlightText);
    
    if (highlightStartIndex === -1) {
      console.warn('Texto não encontrado para highlight:', normalizedHighlightText);
      return;
    }
    
    const highlightEndIndex = highlightStartIndex + normalizedHighlightText.length;
    
    // Encontrar nós afetados
    const affectedNodes = nodeMap.filter(nodeInfo => 
      nodeInfo.startIndex < highlightEndIndex && nodeInfo.endIndex > highlightStartIndex
    );
    
    if (affectedNodes.length === 0) return;
    
    // Aplicar highlight de trás para frente para não afetar índices
    for (let i = affectedNodes.length - 1; i >= 0; i--) {
      const nodeInfo = affectedNodes[i];
      const { node, startIndex, originalText, normalizedText } = nodeInfo;
      
      // Calcular posições relativas ao nó
      const relativeStart = Math.max(0, highlightStartIndex - startIndex);
      const relativeEnd = Math.min(normalizedText.length, highlightEndIndex - startIndex);
      
      // Mapear posições normalizadas para texto original
      const originalStart = mapNormalizedToOriginal(originalText, relativeStart);
      const originalEnd = mapNormalizedToOriginal(originalText, relativeEnd);
      
      const before = originalText.substring(0, originalStart);
      const highlighted = originalText.substring(originalStart, originalEnd);
      const after = originalText.substring(originalEnd);
      
      // Pular se o highlight estiver vazio
      if (!highlighted.trim()) continue;
      
      const parent = node.parentNode;
      if (!parent) continue;
      
      // Criar fragmento com o novo conteúdo
      const fragment = document.createDocumentFragment();
      
      if (before) {
        fragment.appendChild(document.createTextNode(before));
      }
      
      const mark = document.createElement('mark');
      mark.style.backgroundColor = highlight.color;
      mark.style.padding = '2px 4px';
      mark.style.borderRadius = '2px';
      mark.setAttribute('data-highlight-id', highlight.id);
      if (highlight.note) {
        mark.setAttribute('data-note', highlight.note);
      }
      mark.textContent = highlighted;
      fragment.appendChild(mark);
      
      if (after) {
        fragment.appendChild(document.createTextNode(after));
      }
      
      // Substituir nó original
      parent.replaceChild(fragment, node);
    }
  };
  
  // Função auxiliar para mapear posição normalizada para original
  const mapNormalizedToOriginal = (originalText: string, normalizedPosition: number): number => {
    let normalizedIndex = 0;
    let originalIndex = 0;
    
    while (originalIndex < originalText.length && normalizedIndex < normalizedPosition) {
      const char = originalText[originalIndex];
      
      if (/\s/.test(char)) {
        // Espaço em branco conta como 1 no texto normalizado
        normalizedIndex++;
      } else {
        normalizedIndex++;
      }
      
      originalIndex++;
    }
    
    return originalIndex;
  };
  
  // Process content to handle question nodes
  const processedContent = showQuestionTags 
    ? content // Show tags as-is in edit mode
    : content
        // Substituir as tags de questões por placeholders visuais
        .replace(/<div[^>]*data-question-id="([^"]+)"[^>]*data-question-node="true"[^>]*><\/div>/g, '[question:$1]')
        // Substituir as tags de questões antigas também
        .replace(/\[question:([a-f0-9-]+)\]/g, '<div class="p-4 my-4 bg-blue-50 border border-blue-200 rounded-lg text-center"><p class="text-blue-800 font-medium">Questão incorporada neste ponto</p><p class="text-sm text-blue-600 mt-1">[question:$1]</p></div>');
  
  return (
    <div 
      ref={contentRef}
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: prepareHtmlContent(processedContent) }}
    />
  );
};