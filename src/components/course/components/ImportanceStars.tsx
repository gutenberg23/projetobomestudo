
import React from 'react';
import { Star } from 'lucide-react';

export interface ImportanceStarsProps {
  value: number;
  max?: number;
  size?: string;
  className?: string;
}

export const ImportanceStars: React.FC<ImportanceStarsProps> = ({
  value,
  max = 5,
  size = 'sm',
  className = ''
}) => {
  // Determinar tamanho com base no prop size
  const starSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  
  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className={`${starSize} ${
            index < value
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};
