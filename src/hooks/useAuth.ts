
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  nome?: string;
  role?: string;
  foto_perfil?: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
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
        
        // Se temos um usuário, buscar seu perfil
        let userProfile: UserProfile | null = null;
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileData) {
            userProfile = {
              id: user.id,
              email: user.email || '',
              nome: profileData.nome,
              role: profileData.role,
              foto_perfil: profileData.foto_perfil
            };
          } else {
            userProfile = {
              id: user.id,
              email: user.email || ''
            };
          }
        }

        setAuthState({
          user,
          userProfile,
          loading: false,
          error: null,
        });

        // Configurar listener para mudanças de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            const updatedUser = session?.user || null;
            
            // Atualizar o perfil do usuário se necessário
            let updatedProfile: UserProfile | null = null;
            if (updatedUser) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', updatedUser.id)
                .single();
                
              if (profileData) {
                updatedProfile = {
                  id: updatedUser.id,
                  email: updatedUser.email || '',
                  nome: profileData.nome,
                  role: profileData.role,
                  foto_perfil: profileData.foto_perfil
                };
              } else {
                updatedProfile = {
                  id: updatedUser.id,
                  email: updatedUser.email || ''
                };
              }
            }
            
            setAuthState({
              user: updatedUser,
              userProfile: updatedProfile,
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
          userProfile: null,
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
    user: authState.userProfile,
    supabaseUser: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
  };
};
