export interface Professor {
  id: string;
  nome: string;
  email: string;
  disciplina: string;
  youtube: string;
  instagram: string;
  twitter: string;
  facebook: string;
  website: string;
  foto: string;
  rating: number;
  /** ISO */
  criadoEm: string;
}

export type FormProfessor = Omit<Professor, "id" | "criadoEm">;

export interface NotaProfessor {
  id: string;
  conteudo: string;
  data_criacao: string | null;
}

/** Aceita "@perfil", "site.com" ou a URL completa. */
export const urlRede = (valor: string, base?: string) => {
  const v = (valor || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (base && v.startsWith("@")) return `${base}${v.slice(1)}`;
  return `https://${v.replace(/^\/+/, "")}`;
};
