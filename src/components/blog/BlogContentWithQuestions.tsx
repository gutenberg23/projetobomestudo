import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { prepareHtmlContent } from "@/utils/text-utils";
import { QuestionCard } from "@/components/new/QuestionCard";
import { fetchQuestionById } from "@/services/questoesService";

interface BlogContentWithQuestionsProps {
  content: string;
  className?: string;
  highlights?: Array<{id: string, text: string, html?: string, color: string, note?: string}>;
}

export const BlogContentWithQuestions: React.FC<BlogContentWithQuestionsProps> = ({ 
  content, 
  className = "",
  highlights = []
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [questions, setQuestions] = useState<Record<string, any>>({});
  const [loadedQuestions, setLoadedQuestions] = useState<Set<string>>(new Set());
  
  useLayoutEffect(() => {
    // Apply highlights after DOM is ready
    if (contentRef.current && highlights.length > 0) {
      // Small delay to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        applyHighlights();
      });
    }
  }, [content, highlights]);
  
  useEffect(() => {
    // Apply table header styling
    if (contentRef.current) {
      applyTableHeaderStyling();
    }
  }, [content]);
  
  useEffect(() => {
    loadQuestions();
  }, [content]);
  
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
  
  const loadQuestions = async () => {
    // Extrair IDs de questões do conteúdo
    const questionIds = [];
    const questionTagRegex = /\[question:([a-f0-9-]+)\]/g;
    let match;
    
    while ((match = questionTagRegex.exec(content)) !== null) {
      questionIds.push(match[1]);
    }
    
    // Carregar dados das questões que ainda não foram carregadas
    const newQuestions = { ...questions };
    const newLoadedQuestions = new Set(loadedQuestions);
    
    for (const questionId of questionIds) {
      if (!newLoadedQuestions.has(questionId)) {
        try {
          const question = await fetchQuestionById(questionId);
          newQuestions[questionId] = question;
          newLoadedQuestions.add(questionId);
        } catch (error) {
          console.error(`Erro ao carregar questão ${questionId}:`, error);
        }
      }
    }
    
    setQuestions(newQuestions);
    setLoadedQuestions(newLoadedQuestions);
  };
  
  const applyHighlights = () => {
    if (!contentRef.current) {
      console.log('[BlogContentWithQuestions] contentRef.current is null');
      return;
    }
    
    console.log('[BlogContentWithQuestions] Applying highlights:', highlights.length);
    console.log('[BlogContentWithQuestions] contentRef HTML:', contentRef.current.innerHTML.substring(0, 200));
    
    // Limpar highlights antigos
    const existingMarks = contentRef.current.querySelectorAll('mark[data-highlight-id]');
    console.log('[BlogContentWithQuestions] Removing existing marks:', existingMarks.length);
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent?.insertBefore(mark.firstChild, mark);
      }
      parent?.removeChild(mark);
    });
    
    // Aplicar novos highlights
    highlights.forEach(highlight => {
      console.log('[BlogContentWithQuestions] Applying highlight:', highlight.text.substring(0, 50));
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
    
    if (!normalizedHighlightText) {
      console.log('[BlogContentWithQuestions] Empty normalized text');
      return;
    }
    
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
    
    console.log('[BlogContentWithQuestions] Text nodes collected:', textNodes.length);
    
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
    
    console.log('[BlogContentWithQuestions] Full text length:', fullText.length);
    console.log('[BlogContentWithQuestions] Looking for text:', normalizedHighlightText);
    
    // Encontrar a posição do texto a destacar
    const highlightStartIndex = fullText.indexOf(normalizedHighlightText);
    
    if (highlightStartIndex === -1) {
      console.warn('[BlogContentWithQuestions] Text not found:', normalizedHighlightText.substring(0, 100));
      console.log('[BlogContentWithQuestions] Full text sample:', fullText.substring(0, 500));
      return;
    }
    
    console.log('[BlogContentWithQuestions] Text found at index:', highlightStartIndex);
    
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
  
  // Render content with questions embedded
  const renderContentWithQuestions = () => {
    // Split content by question tags
    const parts = content.split(/(\[question:[a-f0-9-]+\])/g);
    
    return parts.map((part, index) => {
      // Check if this part is a question tag
      const questionMatch = part.match(/\[question:([a-f0-9-]+)\]/);
      
      if (questionMatch) {
        const questionId = questionMatch[1];
        const question = questions[questionId];
        
        if (question) {
          return (
            <div key={`question-${index}`} className="my-4 w-full">
              <div className="bg-[rgb(226,232,240)] p-2 w-full rounded-xl">
                <QuestionCard 
                  question={question}
                  disabledOptions={[]}
                  onToggleDisabled={() => {}}
                />
              </div>
            </div>
          );
        } else {
          // Show loading or placeholder if question is not loaded yet
          return (
            <div key={`question-${index}`} className="my-4 w-full">
              <div className="bg-[rgb(226,232,240)] p-2 w-full rounded-xl text-center">
                <p>Carregando questão...</p>
              </div>
            </div>
          );
        }
      } else {
        // Regular content part
        return (
          <span 
            key={`content-${index}`} 
            dangerouslySetInnerHTML={{ __html: prepareHtmlContent(part) }} 
          />
        );
      }
    });
  };
  
  return (
    <div ref={contentRef} className={`prose max-w-none ${className}`}>
      {renderContentWithQuestions()}
    </div>
  );
};