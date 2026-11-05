import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export const usePermissions = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      // Resetar estado de loading quando o usuário mudar
      setLoading(true);
      setRoles([]);
      
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error("usePermissions: Erro ao buscar roles:", error);
          setRoles([]);
        } else {
          setRoles(data?.map(r => r.role) || []);
        }
      } catch (err) {
        console.error("usePermissions: Exceção ao buscar roles:", err);
        setRoles([]);
      }
      
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const isAdmin = () => {
    const result = roles.includes('admin');
    return result;
  };
  
  const isProfessor = () => {
    const result = roles.includes('professor');
    return result;
  };
  
  const isAssistente = () => {
    const result = roles.includes('assistente');
    return result;
  };
  
  const isJornalista = () => {
    const result = roles.includes('jornalista');
    return result;
  };
  
  const isStaff = () => {
    const result = ['admin', 'professor', 'assistente'].some(r => roles.includes(r));
    return result;
  };
  
  const canAccessAdminArea = () => {
    // Verificar também o role do usuário diretamente do perfil, caso as roles não tenham sido carregadas
    const userRole = user?.role;
    const hasDirectAdminAccess = userRole === 'admin' || userRole === 'professor' || userRole === 'assistente' || userRole === 'jornalista';
    
    const result = isStaff() || isJornalista() || hasDirectAdminAccess;
    return result;
  };
  
  const canOnlyAccessPosts = () => {
    const result = isJornalista() && !isStaff();
    return result;
  };
  
  const hasRole = (role: string) => {
    const result = roles.includes(role);
    return result;
  };

  return {
    roles,
    loading,
    isAdmin,
    isProfessor,
    isAssistente,
    isJornalista,
    isStaff,
    canAccessAdminArea,
    canOnlyAccessPosts,
    hasRole
  };
};