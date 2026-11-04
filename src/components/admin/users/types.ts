export type UserType = "aluno" | "professor" | "administrador" | "assistente" | "jornalista";
export type UserStatus = "ativo" | "inativo";

export interface UserData {
  id: string;
  nome: string;
  email: string;
  tipo: UserType;
  status: UserStatus;
  /** ISO, ou "" quando não há registro */
  criadoEm: string;
  ultimoLogin: string;
  fotoPerfil: string;
  assinante: boolean;
  /** yyyy-mm-dd, ou "" */
  inicioAssinatura: string;
  terminoAssinatura: string;
}

export interface FormUsuario {
  nome: string;
  email: string;
  senha: string;
  tipo: UserType;
  status: UserStatus;
  assinante: boolean;
  inicioAssinatura: string;
  terminoAssinatura: string;
}

export interface UserNote {
  id: string;
  usuario_id: string;
  conteudo: string;
  data_criacao: string;
  criado_por?: string;
}

export const TIPOS: { id: UserType; label: string; descricao: string }[] = [
  { id: "aluno", label: "Aluno", descricao: "Estuda no site." },
  { id: "professor", label: "Professor", descricao: "Pode ter conteúdo e créditos de contribuição." },
  { id: "assistente", label: "Assistente", descricao: "Ajuda a cuidar do conteúdo no painel." },
  { id: "jornalista", label: "Jornalista", descricao: "Escreve e publica posts do blog." },
  { id: "administrador", label: "Administrador", descricao: "Acesso total ao painel." },
];

export const rotuloTipo = (t: UserType) => TIPOS.find((x) => x.id === t)?.label || "Aluno";

/** Converte nivel/role do perfil no tipo mostrado no painel. */
export const tipoDoPerfil = (nivel?: string | null, role?: string | null): UserType => {
  if (nivel === "assistente" || role === "assistente") return "assistente";
  if (nivel === "admin" || role === "admin") return "administrador";
  if (nivel === "professor" || role === "professor") return "professor";
  if (nivel === "jornalista" || role === "jornalista") return "jornalista";
  return "aluno";
};

export const NIVEL_POR_TIPO: Record<UserType, string> = {
  aluno: "usuario",
  professor: "professor",
  administrador: "admin",
  assistente: "assistente",
  jornalista: "usuario",
};

export const ROLE_POR_TIPO: Record<UserType, string> = {
  aluno: "aluno",
  professor: "professor",
  administrador: "admin",
  assistente: "assistente",
  jornalista: "jornalista",
};

/** yyyy-mm-dd de hoje no fuso local */
export const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** "ativo" | "vencido" | "nao" para a assinatura premium */
export const situacaoPremium = (u: Pick<UserData, "assinante" | "terminoAssinatura">) => {
  if (!u.assinante) return "nao" as const;
  if (u.terminoAssinatura && u.terminoAssinatura < hojeISO()) return "vencido" as const;
  return "ativo" as const;
};

export const dataBR = (iso: string) => {
  if (!iso) return "";
  // Datas puras (yyyy-mm-dd) não passam por Date para não voltar um dia no fuso do Brasil
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
};

/** "há 3 dias", "hoje", "há 2 meses" */
export const tempoRelativo = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "";
  const dias = Math.floor((Date.now() - d) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
  const anos = Math.floor(meses / 12);
  return anos === 1 ? "há 1 ano" : `há ${anos} anos`;
};
