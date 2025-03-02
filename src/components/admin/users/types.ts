
export type UserType = "aluno" | "professor" | "administrador";
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
  filtroStatus: string;
  filtroTipo: string;
}

// Hook related types 
export interface UseUsersStateReturn {
  usuarios: UserData[];
  usuariosFiltrados: UserData[];
  usuariosPaginados: UserData[];
  filtros: UserFiltersState;
  paginaAtual: number;
  totalPaginas: number;
  indiceInicial: number;
  indiceFinal: number;
  dialogEditarUsuario: boolean;
  dialogNovoUsuario: boolean;
  dialogExcluirUsuario: boolean;
  dialogAlterarSenha: boolean;
  dialogEnviarMensagem: boolean;
  dialogVerHistorico: boolean;
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
  setDialogAlterarSenha: (open: boolean) => void;
  setDialogEnviarMensagem: (open: boolean) => void;
  setDialogVerHistorico: (open: boolean) => void;
  setUsuarioSelecionado: (usuario: UserData | null) => void;
  setNovoUsuario: (usuario: Partial<UserData>) => void;
}
