import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Maximize2, Check, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreCounterProps {
  onClose: () => void;
}

export function ScoreCounter({ onClose }: ScoreCounterProps) {
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const total = correct + incorrect;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Função para ser chamada quando o usuário responde uma questão
  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setLastUpdate('correct');
    } else {
      setIncorrect(prev => prev + 1);
      setLastUpdate('incorrect');
    }
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
  };

  // Expor a função handleAnswer globalmente para ser acessada pelo QuestionCard
  useEffect(() => {
    (window as any).handleQuestionAnswer = handleAnswer;
    return () => {
      delete (window as any).handleQuestionAnswer;
    };
  }, []);

  return (
    <>
      {/* Animação de feedback */}
      {showAnimation && lastUpdate && (
        <div className={cn(
          "fixed inset-0 pointer-events-none flex items-center justify-center z-50",
          "animate-in fade-in-0 duration-300"
        )}>
          <div className={cn(
            "rounded-full p-8 flex items-center justify-center",
            "animate-in zoom-in-50 duration-300",
            lastUpdate === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'
          )}>
            {lastUpdate === 'correct' ? (
              <Check className="w-24 h-24 text-green-500" />
            ) : (
              <XIcon className="w-24 h-24 text-red-500" />
            )}
          </div>
        </div>
      )}

      {/* Contador */}
      <Card className={`fixed bottom-4 right-4 bg-white shadow-lg rounded-lg z-40 transition-all duration-300 ${isMinimized ? 'w-auto' : 'w-64'}`}>
        <div className="flex justify-between items-center p-4">
          <h3 className="font-medium">
            {isMinimized ? `${correct}/${total} (${percentage}%)` : 'Seu Progresso'}
          </h3>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-4 pt-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Acertos</span>
              <span className="font-medium">{correct}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">Erros</span>
              <span className="font-medium">{incorrect}</span>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Aproveitamento</span>
              <span className="font-medium">{percentage}%</span>
            </div>
          </div>
        )}
      </Card>
    </>
  );
} 