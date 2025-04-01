export interface SimuladoSupabase {
  id: string;
  titulo: string;
  descricao: string;
  questoes_ids: string[];
  curso_id: string;
  data_fim: string | null;
  ativo: boolean;
  curso: {
    titulo: string;
  };
}

export interface Simulado {
  id: string;
  titulo: string;
  descricao: string;
  questoes_ids: string[];
  curso_id: string;
  data_fim: string | null;
  ativo: boolean;
  curso: {
    titulo: string;
  };
  questoesIds: string[];
  cursosIds: string[];
}

export interface SimuladosTableProps {
  simulados: Simulado[];
  onRefresh: () => void;
  handleToggleAtivo: (id: string) => void;
  handleExcluir: (id: string) => void;
}

export interface VincularCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  simuladoId: string;
}

export interface EditarSimuladoModalProps {
  isOpen: boolean;
  onClose: () => void;
  simuladoId: string;
}
