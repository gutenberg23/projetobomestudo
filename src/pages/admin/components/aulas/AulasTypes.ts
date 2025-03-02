
export interface Aula {
  id: string;
  titulo: string;
  descricao: string;
  topicosIds: string[];
  questoesIds: string[];
  selecionada?: boolean;
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
}

export interface AulasPageProps {
  tituloNovaDisciplina: string;
  setTituloNovaDisciplina: (titulo: string) => void;
  descricaoNovaDisciplina: string;
  setDescricaoNovaDisciplina: (descricao: string) => void;
  handleAdicionarDisciplina: () => void;
}
