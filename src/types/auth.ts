
import { Session, User } from "@supabase/supabase-js";

export type UserRole = "aluno" | "professor" | "admin";

export interface UserProfile {
  id: string;
  nome: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  foto_perfil: string | null;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}
