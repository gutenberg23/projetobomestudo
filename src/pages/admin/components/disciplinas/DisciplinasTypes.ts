export interface Disciplina {
  id: string;
  titulo: string;
  descricao: string;
  aulasIds: string[];
  topicosIds?: string[];
  questoesIds?: string[];
  selecionada?: boolean;
  informacoesCurso?: string;
  favoritos?: number;
}

export interface DisciplinasFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  descricaoFiltro: string;
  setDescricaoFiltro: (descricao: string) => void;
}

export interface DisciplinasTableProps {
  disciplinas: Disciplina[];
  todasSelecionadas: boolean;
  handleSelecaoTodas: () => void;
  handleSelecaoDisciplina: (id: string) => void;
  openEditModal: (disciplina: Disciplina) => void;
  openDeleteModal: (disciplina: Disciplina) => void;
}

export interface DisciplinasPageProps {
  tituloNovaDisciplina: string;
  setTituloNovaDisciplina: (titulo: string) => void;
  descricaoNovaDisciplina: string;
  setDescricaoNovaDisciplina: (descricao: string) => void;
  informacoesCurso: string;
  setInformacoesCurso: (informacoes: string) => void;
  handleAdicionarDisciplina: () => void;
  todasSelecionadas: boolean;
  disciplinas: Disciplina[];
}

export interface EditDisciplinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplina: Disciplina | null;
  onSave: (disciplina: Disciplina) => void;
}

export interface DeleteDisciplinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplina: Disciplina | null;
  onDelete: (id: string) => void;
}
