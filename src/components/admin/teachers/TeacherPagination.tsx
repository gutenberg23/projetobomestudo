
import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

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
  // Função para gerar botões de página
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Lógica para mostrar páginas corretas (atual, anterior, próxima e algumas adjacentes)
    let startPage = Math.max(1, paginaAtual - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPaginas, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Adicionar botões das páginas
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={paginaAtual === i}
            className={paginaAtual === i ? "bg-[#2a8e9e] text-white" : ""}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-[#67748a]">
        Mostrando <span className="font-medium">{indiceInicial + 1}</span> a{" "}
        <span className="font-medium">{indiceFinal}</span> de{" "}
        <span className="font-medium">{totalItens}</span> resultados
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => paginaAtual > 1 && onPageChange(paginaAtual - 1)}
              className={paginaAtual === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {renderPaginationItems()}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => paginaAtual < totalPaginas && onPageChange(paginaAtual + 1)}
              className={paginaAtual === totalPaginas ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default TeacherPagination;
