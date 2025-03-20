
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

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
  
  // Para armazenar o status da conexão
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Verificar o status da conexão
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    // Verificar estado inicial
    setIsOffline(!navigator.onLine);
    
    // Adicionar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Verificar se há um usuário autenticado
    const checkUser = async () => {
      try {
        // Verificar se estamos offline
        if (isOffline) {
          console.log('Modo offline detectado, tentando carregar usuário do localStorage');
          
          try {
            // Carregar dados de sessão do localStorage
            const storedUser = localStorage.getItem('bom_estudo_user');
            const storedProfile = localStorage.getItem('bom_estudo_profile');
            
            if (storedUser && storedProfile) {
              setAuthState({
                user: JSON.parse(storedUser),
                profile: JSON.parse(storedProfile),
                loading: false,
                error: null,
              });
              
              console.log('Usuário carregado do localStorage com sucesso');
              return;
            }
          } catch (e) {
            console.error('Erro ao carregar usuário do localStorage:', e);
          }
          
          // Se não conseguiu carregar do localStorage, continua como deslogado
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
          
          return;
        }
        
        // Verificar sessão no Supabase
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
            
            // Armazenar localmente para uso offline
            try {
              localStorage.setItem('bom_estudo_user', JSON.stringify(user));
              localStorage.setItem('bom_estudo_profile', JSON.stringify(profile));
            } catch (e) {
              console.warn('Não foi possível salvar a sessão no localStorage:', e);
            }
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
                
                // Atualizar o localStorage
                try {
                  localStorage.setItem('bom_estudo_user', JSON.stringify(user));
                  localStorage.setItem('bom_estudo_profile', JSON.stringify(profile));
                } catch (e) {
                  console.warn('Não foi possível atualizar a sessão no localStorage:', e);
                }
              }
            } else {
              // Se o usuário deslogou, limpar localStorage
              try {
                localStorage.removeItem('bom_estudo_user');
                localStorage.removeItem('bom_estudo_profile');
              } catch (e) {
                console.warn('Não foi possível limpar a sessão no localStorage:', e);
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
        console.error('Erro ao verificar autenticação:', error);
        
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    checkUser();
  }, [isOffline]);

  const signIn = async (email: string, password: string) => {
    try {
      // Verificar se estamos offline
      if (isOffline) {
        toast({
          title: "Modo offline",
          description: "Não é possível fazer login sem conexão com a internet.",
          variant: "destructive"
        });
        throw new Error("Não é possível fazer login em modo offline");
      }
      
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
      // Verificar se estamos offline
      if (isOffline) {
        toast({
          title: "Modo offline",
          description: "Não é possível criar conta sem conexão com a internet.",
          variant: "destructive"
        });
        throw new Error("Não é possível criar conta em modo offline");
      }
      
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
      // Verificar se estamos offline
      if (isOffline) {
        // Apenas limpar dados locais
        try {
          localStorage.removeItem('bom_estudo_user');
          localStorage.removeItem('bom_estudo_profile');
          
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
          
          toast({
            title: "Deslogado em modo offline",
            description: "Seus dados locais foram removidos, mas a sessão completa será encerrada quando você estiver online.",
          });
          
          return;
        } catch (e) {
          console.error('Erro ao remover dados locais:', e);
          throw new Error("Erro ao fazer logout em modo offline");
        }
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Limpar localStorage
      try {
        localStorage.removeItem('bom_estudo_user');
        localStorage.removeItem('bom_estudo_profile');
      } catch (e) {
        console.warn('Não foi possível limpar a sessão no localStorage:', e);
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
    isOffline,
    signIn,
    signUp,
    signOut,
  };
};
