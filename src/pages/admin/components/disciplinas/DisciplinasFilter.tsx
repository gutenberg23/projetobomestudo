
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { DisciplinasFilterProps } from "./DisciplinasTypes";

export const DisciplinasFilter: React.FC<DisciplinasFilterProps> = ({
  searchTerm,
  setSearchTerm,
  descricaoFiltro,
  setDescricaoFiltro
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-lg font-medium mb-3 text-[#272f3c]">Filtros</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="search" className="text-[#67748a]">Buscar por título</Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div>
          <Label htmlFor="descricao-filtro" className="text-[#67748a]">Descrição</Label>
          <Input
            id="descricao-filtro"
            placeholder="Digite para filtrar..."
            value={descricaoFiltro}
            onChange={(e) => setDescricaoFiltro(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
