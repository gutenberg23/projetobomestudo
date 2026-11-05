import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { User, DatabaseUser } from "@/types/user";

interface AuthContextType {
  user: User | null;
  profile: DatabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome?: string, sobrenome?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  clearAuthSession: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Adicionar refs para controlar atualizações desnecessárias
  const profileFetchedRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  const authChangeHandlerRef = useRef<boolean>(false);
  // Nova ref para rastrear se a autenticação inicial já foi feita
  const initialAuthDoneRef = useRef<boolean>(false);
  // Ref para armazenar a função de cancelamento da inscrição
  const unsubscribeRef = useRef<(() => void) | null>(null);
  // Ref para controlar recargas de página vs nova autenticação
  const isPageReloadRef = useRef<boolean>(false);
  // Ref para preservar URL durante recargas de página
  const currentPageUrlRef = useRef<string>('');

  useEffect(() => {
    // Armazenar a URL atual para referência durante recargas
    currentPageUrlRef.current = window.location.pathname;
  }, []);

  const clearAuthSession = () => {
    localStorage.removeItem('bomestudo-auth-v2');
    localStorage.removeItem('bomestudo-auth-token');
    localStorage.removeItem('supabase.auth.token');
    
    supabase.auth.signOut().catch(err => console.error("Erro ao fazer logout:", err));
    
    setUser(null);
    setProfile(null);
    
    navigate("/login");
    
    toast({
      title: "Sessão limpa",
      description: "Sua sessão foi limpa. Por favor, faça login novamente.",
    });
  };

  useEffect(() => {
    // Evitar configurar múltiplos listeners
    if (authChangeHandlerRef.current) return;
    
    // Função para lidar com mudanças de visibilidade da página
    const handleVisibilityChange = () => {
    };

    // Adicionar ouvinte para mudanças de visibilidade
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Define a flag que indica que o handler foi configurado
    authChangeHandlerRef.current = true;

    // Configurar o listener de mudança de estado de autenticação
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Se já completamos a autenticação inicial e já temos um usuário,
        // cancelar o listener para evitar eventos indesejados ao trocar de aba
        if (initialAuthDoneRef.current && user && event === 'SIGNED_IN') {
          
          // Remover o listener após o primeiro login bem-sucedido
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }
          
          return;
        }
        
        // Evitar várias chamadas simultâneas
        if (isRefreshingRef.current) {
          return;
        }
        
        isRefreshingRef.current = true;
        
        if (event === 'SIGNED_IN' && session) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            nome: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(userData);
          
          // Só buscar o perfil se ainda não foi buscado
          if (!profileFetchedRef.current) {
            fetchUserProfile(session.user.id);
          } else {
            
            // Mesmo com o perfil já buscado, permitir novas atualizações após um tempo
            setTimeout(() => {
              isRefreshingRef.current = false;
            }, 1000);
          }
          
          // Marcar que a autenticação inicial foi concluída
          initialAuthDoneRef.current = true;
          
          // Remover o listener após o primeiro login bem-sucedido
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          profileFetchedRef.current = false;
          isRefreshingRef.current = false;
          initialAuthDoneRef.current = false;
          
          // Reconfigurar o listener após logout
          if (!unsubscribeRef.current) {
            setupAuthListener();
          }
        } else if (event === 'TOKEN_REFRESHED') {
          isRefreshingRef.current = false;
        } else {
          // Para outros eventos, também liberar o bloqueio
          setTimeout(() => {
            isRefreshingRef.current = false;
          }, 1000);
        }
      });
      
      // Armazenar a função de cancelamento da inscrição
      unsubscribeRef.current = () => subscription.unsubscribe();
    };
    
    // Iniciar o listener
    setupAuthListener();

    const fetchUserData = async () => {
      try {
        if (isRefreshingRef.current) {
          return;
        }
        isRefreshingRef.current = true;
        
        // Verificar se já temos um usuário e perfil carregados
        if (user && profile && user.id === profile.id) {
          setLoading(false);
          isRefreshingRef.current = false;
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        // Se encontrar uma sessão ao recarregar a página, marcar como recarga
        if (session?.user && document.referrer && document.referrer.includes(window.location.origin)) {
          isPageReloadRef.current = true;
          
          // Verificar se estamos em uma rota administrativa durante recarga
          const isAdminRoute = currentPageUrlRef.current.startsWith('/admin');
        }
        
        if (session?.user) {
          // Se já temos o usuário com o mesmo ID, não precisamos recarregar os dados
          if (user?.id === session.user.id && profileFetchedRef.current) {
            isRefreshingRef.current = false;
            lastFetchTimeRef.current = Date.now();
            setLoading(false);
            
            // Marcar que a autenticação inicial foi concluída
            initialAuthDoneRef.current = true;
            
            // Remover o listener após verificar que já estamos autenticados
            if (unsubscribeRef.current) {
              unsubscribeRef.current();
              unsubscribeRef.current = null;
            }
            
            return;
          }
          
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            nome: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(userData);
          
          // Só buscar o perfil se ainda não foi buscado
          if (!profileFetchedRef.current) {
            await fetchUserProfile(session.user.id);
          }
          
          // Marcar que a autenticação inicial foi concluída
          initialAuthDoneRef.current = true;
          
          // Remover o listener após verificar que já estamos autenticados
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }
        }
        
        // Atualizar o timestamp da última verificação
        lastFetchTimeRef.current = Date.now();
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
        setTimeout(() => {
          isRefreshingRef.current = false;
        }, 1000);
      }
    };

    fetchUserData();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      authChangeHandlerRef.current = false;
      initialAuthDoneRef.current = false;
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Verificar se o perfil já foi buscado
      if (profileFetchedRef.current && profile?.id === userId) {
        isRefreshingRef.current = false;
        return;
      }
      
      // Verificar se a última busca foi feita há menos de 5 minutos
      const currentTime = Date.now();
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      if (profile?.id === userId && (currentTime - lastFetchTimeRef.current < fiveMinutesInMs)) {
        isRefreshingRef.current = false;
        return;
      }
      
      
      // Buscar TODOS os campos da tabela profiles
      const { data: userProfile, error } = await supabase.from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      
      if (error) {
        console.error("AuthContext: Erro ao buscar perfil:", error);
        
        // Se não encontrou o perfil, tentar criar um básico
        if (error.code === 'PGRST116') { // No rows returned
          
          // Obter dados do usuário da auth
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            
            // Criar perfil básico com dados mínimos
            const basicProfile = {
              id: userId,
              email: authUser.email,
              nome: authUser.user_metadata?.nome || "Usuário",
              sobrenome: authUser.user_metadata?.sobrenome || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            
            // Inserir o perfil básico
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .upsert(basicProfile)
              .select('*')
              .single();
              
            if (createError) {
              console.error("AuthContext: Erro ao criar perfil básico:", createError);
            } else {
              setProfile(newProfile as unknown as DatabaseUser);
              setUser(prev => ({
                ...prev,
                ...newProfile,
                nome: newProfile.nome || prev?.nome || ""
              }));
              profileFetchedRef.current = true;
            }
          }
        }
        isRefreshingRef.current = false;
        return;
      }
      
      if (userProfile) {
        const profileData = userProfile as unknown as DatabaseUser;
        setProfile(profileData);
        
        // Atualizar o usuário com todos os campos do perfil
        setUser(prev => {
          if (!prev) return null;
          
          const updatedUser = {
            ...prev,
            ...profileData, // Copiar todos os campos
            nome: profileData.nome || prev.nome,
            sobrenome: profileData.sobrenome || undefined,
            foto_url: profileData.foto_url || undefined,
            foto_perfil: profileData.foto_perfil || undefined,
            role: profileData.role,
          };
          
          
          return updatedUser;
        });
        
        // Marcar que o perfil foi buscado com sucesso
        profileFetchedRef.current = true;
        // Atualizar timestamp da última busca
        lastFetchTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error("AuthContext: Erro ao buscar perfil do usuário:", error);
    } finally {
      // Liberar o bloqueio após completar a operação
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 1000);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      
      if (!email || !password) {
        const error = new Error("Email e senha são obrigatórios");
        toast({
          title: "Erro ao fazer login",
          description: "Email e senha são obrigatórios",
          variant: "destructive",
        });
        return { error };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      
      if (error) {
        console.error("Erro detalhado:", error);
        
        let errorMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos. Por favor, verifique e tente novamente.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email não confirmado. Por favor, verifique sua caixa de entrada.";
        } else if (error.message.includes("Database error granting user")) {
          errorMessage = "Erro interno do servidor. Tente limpar a sessão e fazer login novamente.";
        }
        
        toast({
          title: "Erro ao fazer login",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }
      
      // Login bem-sucedido - atualizar estados imediatamente
      if (data?.user) {
        
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          nome: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setUser(userData);
        
        // Buscar perfil do usuário
        await fetchUserProfile(data.user.id);
        
        // Marcar a autenticação inicial como concluída
        initialAuthDoneRef.current = true;
        
        // Remover o listener para evitar eventos ao trocar de aba
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta ao BomEstudo!",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Erro não tratado durante login:", error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, nome?: string, sobrenome?: string) => {
    try {
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            sobrenome
          }
        }
      });
      

      if (error) {
        console.error("Erro detalhado:", error);
        
        let errorMessage = error.message;
        if (error.message.includes("already registered")) {
          errorMessage = "Este email já está registrado. Por favor, tente fazer login.";
        }
        
        toast({
          title: "Erro ao criar conta",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Conta criada com sucesso",
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("Erro não tratado durante cadastro:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      
      // Limpar estados locais primeiro
      setUser(null);
      setProfile(null);
      
      // Limpar refs de cache
      profileFetchedRef.current = false;
      isRefreshingRef.current = false;
      initialAuthDoneRef.current = false;
      
      // Fazer logout no Supabase
      await supabase.auth.signOut();
      
      // Redirecionar para login
      navigate("/login");
      
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      
      // Mesmo com erro, limpar estados locais
      setUser(null);
      setProfile(null);
      profileFetchedRef.current = false;
      isRefreshingRef.current = false;
      initialAuthDoneRef.current = false;
      
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao sair, mas sua sessão foi limpa localmente.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error("Erro ao resetar senha:", error);
        toast({
          title: "Erro ao resetar senha",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "E-mail enviado",
        description: "Verifique seu e-mail para redefinir sua senha.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("Erro não tratado ao resetar senha:", error);
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return { error: new Error("Usuário não autenticado") };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setUser(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Erro não tratado ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      
      // URL de retorno corrigida para corresponder ao domínio atual
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      // Verificar se temos o domínio correto na lista de domínios permitidos
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      

      if (error) {
        console.error("Erro detalhado:", error);
        toast({
          title: "Erro ao fazer login com Google",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      // Como o login com Google envolve redirecionamento, vamos marcar para remover o listener
      // quando o usuário retornar (na função fetchUserData)
      initialAuthDoneRef.current = true;
      
      return { error: null };
    } catch (error: any) {
      console.error("Erro não tratado ao login com Google:", error);
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      signInWithGoogle,
      clearAuthSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
