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
  handleVincularCurso: (id: string) => void;
  handleToggleAtivo: (id: string) => void;
  handleExcluir: (id: string) => void;
}

export interface VincularCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  simuladoId: string;
}
