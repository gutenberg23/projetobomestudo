
export interface Simulado {
  id: string;
  titulo: string;
  descricao: string;
  questoesIds: string[];
  cursosIds: string[];
  ativo: boolean;
}

export interface SimuladosTableProps {
  simulados: Simulado[];
  handleToggleSelection: (id: string) => void;
  handleVincularCurso: (simuladoId: string) => void;
  handleToggleAtivo: (simuladoId: string) => void;
  handleExcluir: (simuladoId: string) => void;
  selectedSimulados: string[];
}

export interface VincularCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  simuladoId: string;
  onVincular: (simuladoId: string, cursoId: string) => void;
}
