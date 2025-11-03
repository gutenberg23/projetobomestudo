import React, { useEffect, useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { supabase } from '@/integrations/supabase/client';
import { QuestionCard } from '@/components/new/QuestionCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const QuestionNode = ({ node }: NodeViewProps) => {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuestion = async () => {
      const questionId = node.attrs.questionId;
      if (!questionId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('questoes')
          .select('*')
          .eq('id', questionId)
          .single();

        if (error) throw error;
        
        if (data) {
          // Formatar os dados da questão para o componente QuestionCard
          const formattedQuestion = {
            id: data.id,
            year: data.year || '',
            institution: data.institution || '',
            organization: data.organization || '',
            role: Array.isArray(data.role) ? data.role : [],
            discipline: data.discipline || '',
            level: data.level || '',
            difficulty: data.difficulty || '',
            questionType: data.questiontype || '',
            content: data.content || '',
            teacherExplanation: data.teacherexplanation || '',
            aiExplanation: data.aiexplanation || '',
            expandableContent: data.expandablecontent || '',
            options: data.options || [],
            assuntos: data.assuntos || [],
            topics: data.topicos || [],
            createdAt: data.created_at
          };
          
          setQuestion(formattedQuestion);
        }
      } catch (err) {
        console.error('Erro ao carregar questão:', err);
        setError('Não foi possível carregar a questão.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [node.attrs.questionId]);

  const handleToggleDisabled = (optionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDisabledOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId) 
        : [...prev, optionId]
    );
  };

  const handleRemove = async (questionId: string) => {
    // Função vazia para satisfazer a interface do QuestionCard
    console.log('Remover questão:', questionId);
  };

  if (loading) {
    return (
      <NodeViewWrapper className="question-node-wrapper p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Carregando questão...</span>
        </div>
      </NodeViewWrapper>
    );
  }

  if (error) {
    return (
      <NodeViewWrapper className="question-node-wrapper p-4 border rounded-lg bg-red-50">
        <div className="text-red-600">{error}</div>
      </NodeViewWrapper>
    );
  }

  if (!question) {
    return (
      <NodeViewWrapper className="question-node-wrapper p-4 border rounded-lg bg-yellow-50">
        <div className="text-yellow-600">Questão não encontrada</div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="question-node-wrapper my-4">
      <div className="border rounded-lg overflow-hidden">
        <QuestionCard 
          question={question}
          disabledOptions={disabledOptions}
          onToggleDisabled={handleToggleDisabled}
          onRemove={handleRemove}
        />
      </div>
    </NodeViewWrapper>
  );
};