
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchQuestionProps {
  searchId: string;
  setSearchId: React.Dispatch<React.SetStateAction<string>>;
  handleSearchQuestion: () => void;
}

const SearchQuestion: React.FC<SearchQuestionProps> = ({
  searchId,
  setSearchId,
  handleSearchQuestion,
}) => {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Label htmlFor="search-question">ID da Questão</Label>
        <Input 
          id="search-question" 
          value={searchId} 
          onChange={(e) => setSearchId(e.target.value)} 
          placeholder="Digite o ID da questão"
        />
      </div>
      <Button 
        onClick={handleSearchQuestion}
        className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white"
      >
        <Search className="w-4 h-4 mr-2" />
        Buscar Questão
      </Button>
    </div>
  );
};

export default SearchQuestion;
