import { useAuth } from "@/contexts/AuthContext";
import { UserRole, UserNivel } from "@/types/user";

export const usePermissions = () => {
  const { user } = useAuth();

  const isAdmin = () => {
    return user?.role === 'admin' || user?.nivel === 'admin';
  };

  const isProfessor = () => {
    return user?.role === 'professor' || user?.nivel === 'professor';
  };

  const isAssistente = () => {
    return user?.role === 'assistente' || user?.nivel === 'assistente';
  };

  const isJornalista = () => {
    return user?.role === ('jornalista' as UserRole) || user?.nivel === ('jornalista' as UserNivel);
  };

  const isStaff = () => {
    return isAdmin() || isProfessor() || isAssistente();
  };

  const canAccessAdminArea = () => {
    return isStaff() || isJornalista();
  };

  return {
    isAdmin,
    isProfessor,
    isAssistente,
    isJornalista,
    isStaff,
    canAccessAdminArea
  };
}; 