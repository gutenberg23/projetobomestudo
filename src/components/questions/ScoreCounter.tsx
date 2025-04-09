import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Maximize2, Check, X as XIcon, Play, Pause, RotateCcw } from 'lucide-react';
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
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const total = correct + incorrect;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Formatar o tempo em HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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

  // Controles do cronômetro
  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
  };

  // Efeito para atualizar o cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

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
            {isMinimized ? (
              <div className="flex items-center gap-2">
                <span>{`${correct}/${total} (${percentage}%)`}</span>
                <span className="text-gray-600">{formatTime(time)}</span>
              </div>
            ) : (
              'Seu Progresso'
            )}
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

            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Tempo</span>
                <span className="font-medium">{formatTime(time)}</span>
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTimer}
                  className="h-8 px-3"
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTimer}
                  className="h-8 px-3"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
} 