export type Estado = 
  | "AC" | "AL" | "AM" | "AP" | "BA" | "CE" | "DF" | "ES" | "GO" 
  | "MA" | "MG" | "MS" | "MT" | "PA" | "PB" | "PE" | "PI" | "PR" 
  | "RJ" | "RN" | "RO" | "RR" | "RS" | "SC" | "SE" | "SP" | "TO"
  | "Federal" | "Nacional";

export type NivelEnsino = "Ensino Fundamental" | "Ensino Médio" | "Ensino Superior";

export type Cargo = string | {
  nome: string;
  [key: string]: any;
};

export interface Concurso {
  id: string;
  titulo: string;
  dataInicioInscricao: string;
  dataFimInscricao: string;
  prorrogado: boolean;
  niveis: NivelEnsino[];
  cargos: Cargo[];
  vagas: number;
  salario: string; // Usando string para permitir valores formatados como "Até R$ 10.450,00"
  estados: Estado[];
  postId?: string; // ID do post relacionado no blog
  createdAt: string;
  updatedAt: string;
}

export interface ConcursoFormData {
  titulo: string;
  dataInicioInscricao: string;
  dataFimInscricao: string;
  prorrogado: boolean;
  niveis: NivelEnsino[];
  cargos: Cargo[];
  vagas: number;
  salario: string;
  estados: Estado[];
  postId?: string;
}

export interface ConcursoFilter {
  estado?: Estado;
  nivel?: NivelEnsino;
} 