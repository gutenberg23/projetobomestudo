export type UserRole = 'admin' | 'professor' | 'aluno' | 'assistente' | 'jornalista';
export type UserNivel = 'admin' | 'professor' | 'usuario' | 'assistente' | 'jornalista';
export type UserStatus = 'ativo' | 'inativo' | 'pendente' | 'bloqueado';

export interface User {
  id: string;
  email: string;
  nome?: string;
  sobrenome?: string;
  foto_url?: string;
  role?: UserRole;
  nivel?: UserNivel;
  status?: UserStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: string;
  email: string;
  nome: string;
  sobrenome?: string;
  foto_url?: string;
  role?: UserRole;
  nivel?: UserNivel;
  status?: UserStatus;
  data_cadastro?: string;
  ultimo_login?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
} 