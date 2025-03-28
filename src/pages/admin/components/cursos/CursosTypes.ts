
export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  disciplinasIds: string[];
  aulasIds?: string[];
  topicosIds?: string[];
  questoesIds?: string[];
  selecionada?: boolean;
  favoritos?: number;
  informacoesCurso?: string;
}

export interface CursosFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  descricaoFiltro: string;
  setDescricaoFiltro: (descricao: string) => void;
}

export interface CursosTableProps {
  cursos: Curso[];
  openEditModal: (curso: Curso) => void;
  openDeleteModal: (curso: Curso) => void;
}

export interface CursosPageProps {
  tituloNovoCurso: string;
  setTituloNovoCurso: (titulo: string) => void;
  descricaoNovoCurso: string;
  setDescricaoNovoCurso: (descricao: string) => void;
  informacoesCurso: string;
  setInformacoesCurso: (informacoes: string) => void;
  handleAdicionarCurso: () => void;
  temDisciplinasSelecionadas: boolean;
}

export interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  onSave: (curso: Curso) => void;
}

export interface DeleteCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  onDelete: (id: string) => void;
}
