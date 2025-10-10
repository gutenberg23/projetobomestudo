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
        setRoles([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      setRoles(data?.map(r => r.role) || []);
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const isAdmin = () => roles.includes('admin');
  const isProfessor = () => roles.includes('professor');
  const isAssistente = () => roles.includes('assistente');
  const isJornalista = () => roles.includes('jornalista');
  const isStaff = () => ['admin', 'professor', 'assistente'].some(r => roles.includes(r));
  const canAccessAdminArea = () => isStaff() || isJornalista();
  const canOnlyAccessPosts = () => isJornalista() && !isStaff();
  const hasRole = (role: string) => roles.includes(role);

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