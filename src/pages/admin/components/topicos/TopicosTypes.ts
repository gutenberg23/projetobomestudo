
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
  professor_id: string;
  professor_nome: string;
  selecionado?: boolean;
  abrirVideoEm?: "site" | "destino";
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
  handleEditTopico: (topico: Topico) => void;
  handleDeleteTopico: (id: string) => void;
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
