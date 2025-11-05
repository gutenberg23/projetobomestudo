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
    // Highlights are now applied directly in TeoriaPost.tsx using Range API
    // This component only needs to preserve existing marks
  }, [content]);
  
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
  
  // Highlights are now applied directly via Range API in TeoriaPost
  // This component no longer needs to reapply highlights
  
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