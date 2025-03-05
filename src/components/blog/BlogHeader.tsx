
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BlogHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#272f3c]">Blog BomEstudo</h1>
        <p className="text-[#67748a] mt-2">
          Notícias, dicas e atualizações sobre concursos públicos e preparação para suas provas
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex max-w-xl">
        <div className="relative flex-grow">
          <Input 
            type="text" 
            placeholder="Pesquisar artigos, notícias, concursos..." 
            className="h-12 pl-12 pr-4 border-[#5f2ebe]/30 focus-visible:ring-[#5f2ebe]" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#67748a]" />
        </div>
        <Button 
          type="submit" 
          className="ml-2 h-12 bg-[#5f2ebe] hover:bg-[#5021a5]"
        >
          Buscar
        </Button>
      </form>
    </div>
  );
};
