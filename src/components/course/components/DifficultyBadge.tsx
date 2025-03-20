
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DifficultyBadgeProps {
  difficulty: string;
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, className }) => {
  const getColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'muito fácil':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'fácil':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'médio':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'difícil':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'muito difícil':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Badge className={`${getColor(difficulty)} ${className || ''}`} variant="outline">
      {difficulty}
    </Badge>
  );
};
