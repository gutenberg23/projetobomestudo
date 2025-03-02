
export interface Topico {
  id: string;
  titulo: string;
  thumbnail: string;
  patrocinador: string;
  disciplina: string;
  videoUrl: string;
  pdfUrl: string;
  mapaUrl: string;
  resumoUrl: string;
  questoesIds: string[];
  selecionado?: boolean;
  abrirVideoEm?: "site" | "destino";
}

export interface TopicosFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  disciplinaFiltro: string;
  setDisciplinaFiltro: (disciplina: string) => void;
  patrocinadorFiltro: string;
  setPatrocinadorFiltro: (patrocinador: string) => void;
  disciplinas: string[];
  patrocinadores: string[];
}

export interface TopicosTableProps {
  topicos: Topico[];
  todosSelecionados: boolean;
  handleSelecaoTodos: () => void;
  handleSelecaoTopico: (id: string) => void;
  openEditModal: (topico: Topico) => void;
  openDeleteModal: (topico: Topico) => void;
}

export interface TopicosModalsProps {
  isOpenCreate: boolean;
  setIsOpenCreate: (open: boolean) => void;
  isOpenEdit: boolean;
  setIsOpenEdit: (open: boolean) => void;
  isOpenDelete: boolean;
  setIsOpenDelete: (open: boolean) => void;
  currentTopico: Topico | null;
  setCurrentTopico: React.Dispatch<React.SetStateAction<Topico | null>>;
  newTopico: Omit<Topico, 'id'>;
  setNewTopico: React.Dispatch<React.SetStateAction<Omit<Topico, 'id'>>>;
  newQuestaoId: string;
  setNewQuestaoId: (id: string) => void;
  editQuestaoId: string;
  setEditQuestaoId: (id: string) => void;
  handleCreateTopico: () => void;
  handleEditTopico: () => void;
  handleDeleteTopico: () => void;
  addQuestaoId: () => void;
  removeQuestaoId: (index: number) => void;
  addQuestaoIdToEdit: () => void;
  removeQuestaoIdFromEdit: (index: number) => void;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => void;
  disciplinas: string[];
}

export interface TopicosPageProps {
  tituloAula: string;
  setTituloAula: (titulo: string) => void;
  descricaoAula: string;
  setDescricaoAula: (descricao: string) => void;
  temTopicosSelecionados: boolean;
  handleCriarAula: () => void;
}
