export interface Aula {
  id: string;
  titulo: string;
  descricao: string;
  topicosIds: string[];
  questoesIds: string[];
  selecionada?: boolean;
  totalQuestoes?: number;
}

export interface AulasFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  descricaoFiltro: string;
  setDescricaoFiltro: (descricao: string) => void;
}

export interface AulasTableProps {
  aulas: Aula[];
  todasSelecionadas: boolean;
  handleSelecaoTodas: () => void;
  handleSelecaoAula: (id: string) => void;
  openEditModal: (aula: Aula) => void;
  openDeleteModal: (aula: Aula) => void;
  handleDuplicarAula: (aula: Aula) => void;
}

export interface AulasPageProps {
  tituloNovaDisciplina: string;
  setTituloNovaDisciplina: (titulo: string) => void;
  descricaoNovaDisciplina: string;
  setDescricaoNovaDisciplina: (descricao: string) => void;
  handleAdicionarDisciplina: () => void;
  todasSelecionadas: boolean;
  aulas: Aula[];
  temAulasSelecionadas: boolean;
}

export interface EditAulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  aula: Aula | null;
  onSave: (aula: Aula) => void;
}

export interface DeleteAulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  aula: Aula | null;
  onDelete: (id: string) => void;
}
