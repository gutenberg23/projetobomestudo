
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TeacherPaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  indiceInicial: number;
  indiceFinal: number;
  totalItens: number;
  onPageChange: (page: number) => void;
}

const TeacherPagination: React.FC<TeacherPaginationProps> = ({
  paginaAtual,
  totalPaginas,
  indiceInicial,
  indiceFinal,
  totalItens,
  onPageChange
}) => {
  return (
    <div className="flex justify-between items-center mt-4 text-sm">
      <div className="text-[#67748a]">
        Mostrando <span className="font-medium">{indiceInicial + 1}</span> a{" "}
        <span className="font-medium">{indiceFinal}</span> de{" "}
        <span className="font-medium">{totalItens}</span> professores
      </div>
      
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          className="border-[#5f2ebe] text-[#5f2ebe] hover:bg-[#f6f8fa] disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={paginaAtual === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={paginaAtual === page 
              ? "bg-[#5f2ebe] hover:bg-[#5f2ebe]/90" 
              : "border-[#5f2ebe] text-[#5f2ebe] hover:bg-[#f6f8fa]"
            }
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          className="border-[#5f2ebe] text-[#5f2ebe] hover:bg-[#f6f8fa] disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TeacherPagination;
