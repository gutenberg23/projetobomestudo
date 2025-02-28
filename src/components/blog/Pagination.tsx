
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = [];
  
  // Lógica para exibir números de página
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4 && totalPages > 5) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-md text-[#67748a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ea2be2] hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex mx-2">
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`w-10 h-10 mx-1 flex items-center justify-center rounded-md hover:bg-[#ea2be2] hover:text-white transition-colors ${
                currentPage === 1 ? "bg-[#ea2be2] text-white" : "text-[#67748a] bg-white"
              }`}
            >
              1
            </button>
            
            {startPage > 2 && (
              <span className="w-10 h-10 mx-1 flex items-center justify-center">
                ...
              </span>
            )}
          </>
        )}
        
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`w-10 h-10 mx-1 flex items-center justify-center rounded-md hover:bg-[#ea2be2] hover:text-white transition-colors ${
              currentPage === number ? "bg-[#ea2be2] text-white" : "text-[#67748a] bg-white"
            }`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="w-10 h-10 mx-1 flex items-center justify-center">
                ...
              </span>
            )}
            
            <button
              onClick={() => onPageChange(totalPages)}
              className={`w-10 h-10 mx-1 flex items-center justify-center rounded-md hover:bg-[#ea2be2] hover:text-white transition-colors ${
                currentPage === totalPages ? "bg-[#ea2be2] text-white" : "text-[#67748a] bg-white"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md text-[#67748a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ea2be2] hover:text-white transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
