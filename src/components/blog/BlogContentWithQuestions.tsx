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
    if (!contentRef.current) return;
    
    console.log('[BlogContentWithQuestions] Applying highlights:', highlights.length);
    
    // Remover highlights antigos
    const existingMarks = contentRef.current.querySelectorAll('mark[data-highlight-id]');
    console.log('[BlogContentWithQuestions] Removing existing marks:', existingMarks.length);
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
      }
    });
    
    // Normalizar o DOM após remoção (juntar text nodes adjacentes)
    contentRef.current.normalize();
    
    // Aplicar novos highlights
    highlights.forEach(highlight => {
      console.log('[BlogContentWithQuestions] Applying highlight:', highlight.text.substring(0, 50));
      applyHighlightToText(highlight);
    });
  };
  
  const applyHighlightToText = (highlight: {id: string, text: string, color: string, note?: string}) => {
    if (!contentRef.current) return;
    
    // Normalizar o texto buscado
    const searchText = highlight.text
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!searchText) return;
    
    // Criar TreeWalker para percorrer todos os text nodes
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Ignorar text nodes dentro de elementos mark existentes
          let parent = node.parentElement;
          while (parent && parent !== contentRef.current) {
            if (parent.tagName === 'MARK') {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    // Coletar todos os text nodes
    const textNodes: Text[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }
    
    if (textNodes.length === 0) return;
    
    // Construir mapa de texto
    let fullText = '';
    const nodeMap: Array<{
      node: Text;
      startOffset: number;
      endOffset: number;
    }> = [];
    
    textNodes.forEach(node => {
      const text = (node.textContent || '').normalize('NFC').replace(/\s+/g, ' ');
      const startOffset = fullText.length;
      fullText += text;
      const endOffset = fullText.length;
      
      nodeMap.push({
        node,
        startOffset,
        endOffset
      });
    });
    
    console.log('[BlogContentWithQuestions] Full text length:', fullText.length);
    
    // Encontrar todas as ocorrências do texto
    let searchIndex = 0;
    const occurrences: Array<{ start: number; end: number }> = [];
    
    while ((searchIndex = fullText.indexOf(searchText, searchIndex)) !== -1) {
      occurrences.push({
        start: searchIndex,
        end: searchIndex + searchText.length
      });
      searchIndex += searchText.length;
    }
    
    if (occurrences.length === 0) {
      console.warn('[BlogContentWithQuestions] Text not found:', searchText.substring(0, 100));
      return;
    }
    
    console.log('[BlogContentWithQuestions] Found', occurrences.length, 'occurrence(s)');
    
    // Aplicar highlight em todas as ocorrências (de trás para frente)
    occurrences.reverse().forEach(occurrence => {
      applyHighlightToRange(occurrence.start, occurrence.end, highlight, nodeMap);
    });
  };
  
  const applyHighlightToRange = (
    startIndex: number,
    endIndex: number,
    highlight: {id: string, color: string, note?: string},
    nodeMap: Array<{ node: Text; startOffset: number; endOffset: number }>
  ) => {
    // Encontrar nodes afetados
    const affectedNodes = nodeMap.filter(
      info => info.startOffset < endIndex && info.endOffset > startIndex
    );
    
    if (affectedNodes.length === 0) return;
    
    // Processar de trás para frente para não afetar índices
    for (let i = affectedNodes.length - 1; i >= 0; i--) {
      const nodeInfo = affectedNodes[i];
      const { node, startOffset, endOffset } = nodeInfo;
      
      // Calcular posições relativas no texto normalizado do node
      const relativeStart = Math.max(0, startIndex - startOffset);
      const relativeEnd = Math.min(endOffset - startOffset, endIndex - startOffset);
      
      // Converter posições normalizadas para posições no texto original
      const originalText = node.textContent || '';
      const normalizedText = originalText.normalize('NFC').replace(/\s+/g, ' ');
      
      const originalStart = mapToOriginalPosition(originalText, normalizedText, relativeStart);
      const originalEnd = mapToOriginalPosition(originalText, normalizedText, relativeEnd);
      
      // Dividir o text node e envolver a parte destacada
      const before = originalText.substring(0, originalStart);
      const highlighted = originalText.substring(originalStart, originalEnd);
      const after = originalText.substring(originalEnd);
      
      if (!highlighted.trim()) continue;
      
      const parent = node.parentNode;
      if (!parent) continue;
      
      // Criar elementos
      const fragment = document.createDocumentFragment();
      
      if (before) {
        fragment.appendChild(document.createTextNode(before));
      }
      
      const mark = document.createElement('mark');
      mark.style.backgroundColor = highlight.color;
      mark.style.padding = '2px 4px';
      mark.style.borderRadius = '2px';
      mark.style.transition = 'all 0.2s ease';
      mark.setAttribute('data-highlight-id', highlight.id);
      if (highlight.note) {
        mark.setAttribute('data-note', highlight.note);
        mark.title = highlight.note;
      }
      mark.textContent = highlighted;
      fragment.appendChild(mark);
      
      if (after) {
        fragment.appendChild(document.createTextNode(after));
      }
      
      // Substituir o node original
      parent.replaceChild(fragment, node);
    }
  };
  
  const mapToOriginalPosition = (
    originalText: string,
    normalizedText: string,
    normalizedPosition: number
  ): number => {
    let normIdx = 0;
    let origIdx = 0;
    
    while (origIdx < originalText.length && normIdx < normalizedPosition) {
      const origChar = originalText[origIdx];
      const normChar = normalizedText[normIdx];
      
      if (/\s/.test(origChar)) {
        // Espaços consecutivos no original mapeiam para um único espaço normalizado
        let wsCount = 0;
        while (origIdx < originalText.length && /\s/.test(originalText[origIdx])) {
          origIdx++;
          wsCount++;
        }
        normIdx++; // Um espaço normalizado
        continue;
      }
      
      origIdx++;
      normIdx++;
    }
    
    return origIdx;
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
                  onRemove={async () => {}}
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