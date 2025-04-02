export type UserRole = 'aluno' | 'professor' | 'admin';

export interface DatabaseUser {
  id: string;
  email: string | null;
  nome: string | null;
  created_at: string;
  updated_at: string;
  role?: UserRole;
  foto_perfil: string | null;
  sobrenome: string | null;
  nome_social: string | null;
  nascimento: string | null;
  sexo: string | null;
  escolaridade: string | null;
  estado_civil: string | null;
  celular: string | null;
  telefone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  estado: string | null;
  cidade: string | null;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  created_at: string;
  updated_at: string;
  role?: UserRole;
  foto_perfil?: string | null;
  sobrenome?: string | null;
  nome_social?: string | null;
  nascimento?: string | null;
  sexo?: string | null;
  escolaridade?: string | null;
  estado_civil?: string | null;
  celular?: string | null;
  telefone?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  complemento?: string | null;
  estado?: string | null;
  cidade?: string | null;
} 