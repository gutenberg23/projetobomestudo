export type UserType = "aluno" | "professor" | "administrador" | "assistente" | "jornalista";
export type UserStatus = "ativo" | "inativo";

export interface UserData {
  id: string;
  nome: string;
  email: string;
  tipo: UserType;
  status: UserStatus;
  dataCadastro: string;
  ultimoLogin: string;
  fotoPerfil: string;
  assinante: boolean;
  inicioAssinatura: string;
  terminoAssinatura: string;
}

export interface UserFiltersState {
  termoPesquisa: string;
  filtroStatus: "todos" | UserStatus;
  filtroTipo: "todos" | UserType;
}

export interface UserNote {
  id: string;
  usuario_id: string;
  conteudo: string;
  data_criacao: string;
  criado_por?: string;
}

// Hook related types 
export interface UseUsersStateReturn {
  usuarios: UserData[];
  usuariosFiltrados: UserData[];
  usuariosPaginados: UserData[];
  isLoading: boolean;
  filtros: UserFiltersState;
  paginaAtual: number;
  totalPaginas: number;
  indiceInicial: number;
  indiceFinal: number;
  dialogEditarUsuario: boolean;
  dialogNovoUsuario: boolean;
  dialogExcluirUsuario: boolean;
  dialogEnviarMensagem: boolean;
  dialogVerHistorico: boolean;
  dialogNotasUsuario: boolean;
  usuarioSelecionado: UserData | null;
  novoUsuario: Partial<UserData>;
  itensPorPagina: number;
  setUsuarios: (usuarios: UserData[]) => void;
  setUsuariosFiltrados: (usuarios: UserData[]) => void;
  setFiltros: (filtros: UserFiltersState) => void;
  setPaginaAtual: (pagina: number) => void;
  setDialogEditarUsuario: (open: boolean) => void;
  setDialogNovoUsuario: (open: boolean) => void;
  setDialogExcluirUsuario: (open: boolean) => void;
  setDialogEnviarMensagem: (open: boolean) => void;
  setDialogVerHistorico: (open: boolean) => void;
  setDialogNotasUsuario: (open: boolean) => void;
  setUsuarioSelecionado: (usuario: UserData | null) => void;
  setNovoUsuario: (usuario: Partial<UserData>) => void;
}
