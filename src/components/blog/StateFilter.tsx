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
    <div className="relative mb-6 w-full">
      <button 
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 shadow-md"
        aria-label="Rolar para a esquerda"
      >
        <ChevronLeft className="h-5 w-5 text-[#67748a]" />
      </button>
      
      <div 
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide py-2 px-6 space-x-2 w-full justify-between"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {states.map((state) => (
          <button
            key={state.id}
            onClick={() => onSelectState(activeState === state.id ? null : state.id)}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors min-w-[40px] text-center",
              activeState === state.id
                ? "bg-[#5f2ebe]/20 text-[#5f2ebe] border border-[#5f2ebe]"
                : "bg-gray-100 hover:bg-gray-200 text-[#67748a]"
            )}
          >
            {state.name}
          </button>
        ))}
      </div>
      
      <button 
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 shadow-md"
        aria-label="Rolar para a direita"
      >
        <ChevronRight className="h-5 w-5 text-[#67748a]" />
      </button>
    </div>
  );
};
