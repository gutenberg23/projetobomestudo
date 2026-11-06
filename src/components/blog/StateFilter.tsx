import React from "react";
import { StateFilter as StateFilterType } from "./types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StateFilterProps {
  states: StateFilterType[];
  activeState: string | null;
  onSelectState: (state: string | null) => void;
}

export const StateFilter: React.FC<StateFilterProps> = ({ 
  states, 
  activeState, 
  onSelectState
}) => {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setScrollPosition(containerRef.current.scrollLeft - 200);
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setScrollPosition(containerRef.current.scrollLeft + 200);
    }
  };

  return (
    <div className="relative w-full">
      <button 
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
        aria-label="Rolar para a esquerda"
      >
        <ChevronLeft className="h-5 w-5 text-[#67748a]" />
      </button>
      
      <div 
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-8 gap-2 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {states.map((state) => (
          <button
            key={state.id}
            onClick={() => onSelectState(activeState === state.id ? null : state.id)}
            title={state.value}
            aria-pressed={activeState === state.id}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors min-w-[40px] text-center border",
              activeState === state.id
                ? "bg-[#ede7f9] text-[#5f2ebe] border-[#5f2ebe]"
                : "bg-white border-gray-200 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe] text-[#67748a]"
            )}
          >
            {state.name}
          </button>
        ))}
      </div>
      
      <button 
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
        aria-label="Rolar para a direita"
      >
        <ChevronRight className="h-5 w-5 text-[#67748a]" />
      </button>
    </div>
  );
};
