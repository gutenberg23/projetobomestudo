
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
