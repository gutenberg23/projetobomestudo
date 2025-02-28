
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BlogPagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 my-8">
      <Button 
        variant="outline" 
        onClick={handlePreviousPage} 
        disabled={currentPage === 1}
        className="flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>
      
      <div className="mx-4 text-[#67748a]">
        Página {currentPage} de {totalPages}
      </div>
      
      <Button 
        variant="outline" 
        onClick={handleNextPage} 
        disabled={currentPage === totalPages}
        className="flex items-center"
      >
        Próxima
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};
