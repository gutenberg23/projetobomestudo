import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export const usePermissions = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        console.log("usePermissions: Nenhum usuário logado");
        setRoles([]);
        setLoading(false);
        return;
      }

      console.log("usePermissions: Buscando roles para usuário:", user.id);
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error("usePermissions: Erro ao buscar roles:", error);
          setRoles([]);
        } else {
          console.log("usePermissions: Roles encontradas:", data);
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
    console.log("usePermissions: isAdmin() =", result, "Roles atuais:", roles);
    return result;
  };
  
  const isProfessor = () => {
    const result = roles.includes('professor');
    console.log("usePermissions: isProfessor() =", result);
    return result;
  };
  
  const isAssistente = () => {
    const result = roles.includes('assistente');
    console.log("usePermissions: isAssistente() =", result);
    return result;
  };
  
  const isJornalista = () => {
    const result = roles.includes('jornalista');
    console.log("usePermissions: isJornalista() =", result);
    return result;
  };
  
  const isStaff = () => {
    const result = ['admin', 'professor', 'assistente'].some(r => roles.includes(r));
    console.log("usePermissions: isStaff() =", result);
    return result;
  };
  
  const canAccessAdminArea = () => {
    const result = isStaff() || isJornalista();
    console.log("usePermissions: canAccessAdminArea() =", result);
    return result;
  };
  
  const canOnlyAccessPosts = () => {
    const result = isJornalista() && !isStaff();
    console.log("usePermissions: canOnlyAccessPosts() =", result);
    return result;
  };
  
  const hasRole = (role: string) => {
    const result = roles.includes(role);
    console.log("usePermissions: hasRole(", role, ") =", result);
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