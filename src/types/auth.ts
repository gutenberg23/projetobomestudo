export type UserRole = 'ADMIN' | 'USER' | 'PROFESSOR';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nome?: string;
  sobrenome?: string;
  foto_url?: string;
  nivel?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
} 