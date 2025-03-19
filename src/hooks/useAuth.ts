
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export interface UserProfile {
  id: string;
  nome?: string;
  email?: string;
  role?: string;
  foto_perfil?: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Verificar se há um usuário autenticado
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const user = session?.user || null;
        
        let profile: UserProfile | null = null;
        
        if (user) {
          // Buscar o perfil do usuário
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!profileError && profileData) {
            profile = {
              id: profileData.id,
              nome: profileData.nome,
              email: profileData.email,
              role: profileData.role,
              foto_perfil: profileData.foto_perfil
            };
          }
        }

        setAuthState({
          user,
          profile,
          loading: false,
          error: null,
        });

        // Configurar listener para mudanças de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            const user = session?.user || null;
            
            let profile: UserProfile | null = null;
            
            if (user) {
              // Buscar o perfil do usuário
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
              if (!profileError && profileData) {
                profile = {
                  id: profileData.id,
                  nome: profileData.nome,
                  email: profileData.email,
                  role: profileData.role,
                  foto_perfil: profileData.foto_perfil
                };
              }
            }
            
            setAuthState({
              user,
              profile,
              loading: false,
              error: null,
            });
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
  };
};
