import type { FlashcardRascunho } from "@/lib/flashcards";

export interface Topico {
  id: string;
  titulo: string;
  thumbnail: string;
  patrocinador: string;
  disciplina: string;
  videoUrl: string;
  pdfUrl: string;
  /** Teoria do site usada como "aula em texto" (substitui o PDF nos tópicos novos) */
  teoriaId?: string | null;
  mapaUrl: string;
  resumoUrl: string;
  musicaUrl: string | string[];
  resumoAudioUrl: string | string[];
  cadernoQuestoesUrl: string;
  questoesIds: string[];
  professor_id: string;
  professor_nome: string;
  selecionado?: boolean;
  abrirVideoEm?: "site" | "destino";
  abrirEmNovaGuia?: boolean;
  /** Flashcards do tópico (só no formulário; undefined = não carregados) */
  flashcards?: FlashcardRascunho[];
}

/** Campos editáveis de um tópico (formulários de criação e edição). */
export type TopicoFormValues = Omit<Topico, 'id' | 'selecionado' | 'thumbnail' | 'abrirVideoEm'>;

export const topicoFormVazio = (base: Partial<TopicoFormValues> = {}): TopicoFormValues => ({
  titulo: "",
  disciplina: "",
  patrocinador: "",
  questoesIds: [],
  professor_id: "",
  professor_nome: "",
  videoUrl: "",
  pdfUrl: "",
  teoriaId: null,
  mapaUrl: "",
  resumoUrl: "",
  musicaUrl: [],
  resumoAudioUrl: [],
  cadernoQuestoesUrl: "",
  abrirEmNovaGuia: false,
  flashcards: [],
  ...base,
});

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
