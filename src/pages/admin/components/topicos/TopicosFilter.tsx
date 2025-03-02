
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { TopicosFilterProps } from "./TopicosTypes";

export const TopicosFilter: React.FC<TopicosFilterProps> = ({
  searchTerm,
  setSearchTerm,
  disciplinaFiltro,
  setDisciplinaFiltro,
  patrocinadorFiltro,
  setPatrocinadorFiltro,
  disciplinas,
  patrocinadores
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-lg font-medium mb-3 text-[#272f3c]">Filtros</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Label htmlFor="disciplina-filtro" className="text-[#67748a]">Descrição / Disciplina</Label>
          <Input
            id="disciplina-filtro"
            placeholder="Digite para filtrar..."
            value={disciplinaFiltro}
            onChange={(e) => setDisciplinaFiltro(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="patrocinador-filtro" className="text-[#67748a]">Patrocinador</Label>
          <Select value={patrocinadorFiltro} onValueChange={setPatrocinadorFiltro}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os patrocinadores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os patrocinadores</SelectItem>
              {patrocinadores.map((patrocinador, index) => (
                <SelectItem key={index} value={patrocinador}>
                  {patrocinador}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
