
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
      <div className="text-sm text-[#67748a]">
        Mostrando <span className="font-medium">{totalItems > 0 ? startItem : 0}</span> a <span className="font-medium">{endItem}</span> de <span className="font-medium">{totalItems}</span> itens
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </Button>
        
        {totalPages <= 5 ? (
          // Se temos 5 ou menos páginas, mostramos todas
          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={page === currentPage ? "bg-[#ea2be2] hover:bg-[#ea2be2]/90" : ""}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))
        ) : (
          // Se temos mais de 5 páginas, mostramos um conjunto de páginas com elipses
          <>
            {/* Primeira página sempre visível */}
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              className={currentPage === 1 ? "bg-[#ea2be2] hover:bg-[#ea2be2]/90" : ""}
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            
            {/* Elipse se necessário */}
            {currentPage > 3 && (
              <Button variant="outline" size="sm" disabled>
                ...
              </Button>
            )}
            
            {/* Páginas centrais */}
            {Array.from(
              { length: 3 },
              (_, i) => Math.min(
                Math.max(currentPage - 1 + i, 2),
                totalPages - 1
              )
            )
              .filter((page, index, self) => 
                page > 1 && 
                page < totalPages && 
                self.indexOf(page) === index
              )
              .map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className={page === currentPage ? "bg-[#ea2be2] hover:bg-[#ea2be2]/90" : ""}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              ))}
            
            {/* Elipse se necessário */}
            {currentPage < totalPages - 2 && (
              <Button variant="outline" size="sm" disabled>
                ...
              </Button>
            )}
            
            {/* Última página sempre visível */}
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="sm"
              className={currentPage === totalPages ? "bg-[#ea2be2] hover:bg-[#ea2be2]/90" : ""}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
