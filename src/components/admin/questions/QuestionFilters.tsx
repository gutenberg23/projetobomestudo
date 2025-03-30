import React, { Dispatch, SetStateAction } from "react";
import { ChevronDown, ChevronUp, Filter, XCircle, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Filters } from './types';

interface FilterItem {
  key: string;
  isActive: boolean;
  value: string;
}

interface QuestionFiltersProps {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  resetFilters: () => void;
  handleClearAllQuestionStats: () => Promise<void>;
  dropdownData: {
    years: string[];
    institutions: string[];
    organizations: string[];
    roles: string[];
    disciplines: string[];
    levels: string[];
    difficulties: string[];
    questionTypes: string[];
  };
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  resetFilters,
  handleClearAllQuestionStats,
  dropdownData
}) => {
  const handleChangeFilter = (
    filterKey: keyof Filters,
    changes: Partial<FilterItem>
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        ...changes,
      },
    }));
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {handleClearAllQuestionStats && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-amber-500 text-amber-500 hover:bg-amber-50"
                >
                  <Eraser className="h-4 w-4" />
                  Limpar Todas Estatísticas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar estatísticas de todas as questões</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover permanentemente todas as estatísticas de respostas dos usuários para todas as questões. 
                    Essa ação não pode ser desfeita. Tem certeza que deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllQuestionStats} className="bg-amber-500 hover:bg-amber-600">
                    Sim, limpar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {showFilters && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
          {/* Disciplina */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Disciplina</label>
              <Switch
                checked={filters.disciplina.isActive}
                onCheckedChange={(checked) =>
                  handleChangeFilter("disciplina", { isActive: checked })
                }
              />
            </div>
            <Input
              value={filters.disciplina.value}
              onChange={(e) =>
                handleChangeFilter("disciplina", { value: e.target.value })
              }
              disabled={!filters.disciplina.isActive}
              placeholder="Ex: Direito Administrativo"
              className="w-full"
            />
          </div>

          {/* Nível */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Nível</label>
              <Switch
                checked={filters.nivel.isActive}
                onCheckedChange={(checked) =>
                  handleChangeFilter("nivel", { isActive: checked })
                }
              />
            </div>
            <Select
              value={filters.nivel.value}
              onValueChange={(value) =>
                handleChangeFilter("nivel", { value })
              }
              disabled={!filters.nivel.isActive}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Superior">Superior</SelectItem>
                <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instituição */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Instituição</label>
              <Switch
                checked={filters.institution.isActive}
                onCheckedChange={(checked) =>
                  handleChangeFilter("institution", { isActive: checked })
                }
              />
            </div>
            <Input
              value={filters.institution.value}
              onChange={(e) =>
                handleChangeFilter("institution", { value: e.target.value })
              }
              disabled={!filters.institution.isActive}
              placeholder="Ex: CESPE"
              className="w-full"
            />
          </div>

          {/* Organização */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Organização</label>
              <Switch
                checked={filters.organization.isActive}
                onCheckedChange={(checked) =>
                  handleChangeFilter("organization", { isActive: checked })
                }
              />
            </div>
            <Input
              value={filters.organization.value}
              onChange={(e) =>
                handleChangeFilter("organization", { value: e.target.value })
              }
              disabled={!filters.organization.isActive}
              placeholder="Ex: TRT"
              className="w-full"
            />
          </div>

          {/* Cargo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Cargo</label>
              <Switch
                checked={filters.role.isActive}
                onCheckedChange={(checked) =>
                  handleChangeFilter("role", { isActive: checked })
                }
              />
            </div>
            <Input
              value={filters.role.value}
              onChange={(e) =>
                handleChangeFilter("role", { value: e.target.value })
              }
              disabled={!filters.role.isActive}
              placeholder="Ex: Analista Judiciário"
              className="w-full"
            />
          </div>

          {/* Ano */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Ano</label>
              <Switch
                checked={filters.ano.isActive}
                onCheckedChange={(checked) =>
                  handleChangeFilter("ano", { isActive: checked })
                }
              />
            </div>
            <Input
              value={filters.ano.value}
              onChange={(e) =>
                handleChangeFilter("ano", { value: e.target.value })
              }
              disabled={!filters.ano.isActive}
              placeholder="Ex: 2022"
              className="w-full"
            />
          </div>

          {/* Dificuldade */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Dificuldade</label>
              <Switch
                checked={filters.dificuldade.isActive}
                onCheckedChange={(checked) =>
                  handleChangeFilter("dificuldade", { isActive: checked })
                }
              />
            </div>
            <Select
              value={filters.dificuldade.value}
              onValueChange={(value) =>
                handleChangeFilter("dificuldade", { value })
              }
              disabled={!filters.dificuldade.isActive}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fácil">Fácil</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Difícil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Questão */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Tipo de Questão</label>
              <Switch
                checked={filters.questionType.isActive}
                onCheckedChange={(checked) =>
                  handleChangeFilter("questionType", { isActive: checked })
                }
              />
            </div>
            <Select
              value={filters.questionType.value}
              onValueChange={(value) =>
                handleChangeFilter("questionType", { value })
              }
              disabled={!filters.questionType.isActive}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Múltipla escolha">Múltipla escolha</SelectItem>
                <SelectItem value="Verdadeiro ou falso">Verdadeiro ou falso</SelectItem>
                <SelectItem value="Discursiva">Discursiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionFilters;
