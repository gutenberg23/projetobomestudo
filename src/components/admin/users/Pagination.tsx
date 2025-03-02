
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  indiceInicial: number;
  indiceFinal: number;
  totalItens: number;
  onPageChange: (pagina: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  paginaAtual,
  totalPaginas,
  indiceInicial,
  indiceFinal,
  totalItens,
  onPageChange
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-[#67748a]">
        Mostrando <span className="font-medium">{indiceInicial + 1}</span> a <span className="font-medium">{Math.min(indiceFinal, totalItens)}</span> de <span className="font-medium">{totalItens}</span> resultados
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(paginaAtual - 1, 1))}
          disabled={paginaAtual === 1}
        >
          <ChevronLeft size={16} />
        </Button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
          <Button
            key={pagina}
            variant={pagina === paginaAtual ? "default" : "outline"}
            size="sm"
            className={pagina === paginaAtual ? "bg-[#ea2be2] hover:bg-[#ea2be2]/90" : ""}
            onClick={() => onPageChange(pagina)}
          >
            {pagina}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(paginaAtual + 1, totalPaginas))}
          disabled={paginaAtual === totalPaginas}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
