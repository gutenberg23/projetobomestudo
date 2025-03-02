
import React from "react";
import { UserFiltersState } from "./types";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFiltersProps {
  filtros: UserFiltersState;
  onChangeTermoPesquisa: (termo: string) => void;
  onChangeFiltroStatus: (status: string) => void;
  onChangeFiltroTipo: (tipo: string) => void;
  onFilterSubmit: () => void;
  onAddNewUser: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filtros,
  onChangeTermoPesquisa,
  onChangeFiltroStatus,
  onChangeFiltroTipo,
  onFilterSubmit,
  onAddNewUser
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder="Buscar por nome ou email..." 
          className="pl-10"
          value={filtros.termoPesquisa}
          onChange={(e) => onChangeTermoPesquisa(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onFilterSubmit()}
        />
      </div>
      
      <div className="flex items-center">
        <Filter size={18} className="mr-2 text-[#67748a]" />
        <Select 
          value={filtros.filtroStatus} 
          onValueChange={(valor) => {
            onChangeFiltroStatus(valor);
            setTimeout(onFilterSubmit, 100);
          }}
        >
          <SelectTrigger className="w-[150px] h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center">
        <Select 
          value={filtros.filtroTipo} 
          onValueChange={(valor) => {
            onChangeFiltroTipo(valor);
            setTimeout(onFilterSubmit, 100);
          }}
        >
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Tipo de usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="aluno">Alunos</SelectItem>
            <SelectItem value="professor">Professores</SelectItem>
            <SelectItem value="administrador">Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={onFilterSubmit} 
        variant="default" 
        className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
      >
        Filtrar
      </Button>
      
      <Button 
        onClick={onAddNewUser} 
        className="ml-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M16 11h6"/></svg>
        Novo Usuário
      </Button>
    </div>
  );
};

export default UserFilters;
