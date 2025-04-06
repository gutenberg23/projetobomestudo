import React, { createContext, useContext, useEffect, useState } from "react";
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      if (event === 'SIGNED_IN' && session) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          nome: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(userData);
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }
    });

    const fetchUserData = async () => {
      try {
        console.log("Verificando sessão existente...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Sessão existente:", session?.user?.id);
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            nome: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(userData);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Buscando perfil do usuário:", userId);
      const { data: userProfile, error } = await supabase.from('profiles')
        .select('id, email, nome, sobrenome, role, foto_url')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return;
      }
        
      if (userProfile) {
        console.log("Perfil encontrado:", userProfile);
        const profile = userProfile as unknown as DatabaseUser;
        setProfile(profile);
        setUser(prev => {
          if (!prev) return null;
          const updatedUser: User = {
            ...prev,
            nome: profile.nome || prev.nome,
            sobrenome: profile.sobrenome || undefined,
            foto_url: profile.foto_url || undefined,
            role: profile.role,
          };
          return updatedUser;
        });
      } else {
        console.warn("Perfil do usuário não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando login com email:", email);
      
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
      
      console.log("Resposta de login:", data ? "Dados recebidos" : "Sem dados", error);
      
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
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta ao BomEstudo!",
      });
      
      navigate("/");
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
      console.log("Tentando criar conta com:", email, nome, sobrenome);
      
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
      
      console.log("Resposta de cadastro:", data ? "Dados recebidos" : "Sem dados", error);

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
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("Solicitando redefinição de senha para:", email);
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
      console.log("Atualizando perfil do usuário:", user.id, data);
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
      console.log("Iniciando login com Google");
      
      // URL de retorno corrigida para corresponder ao domínio atual
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log("URL de redirecionamento:", redirectTo);
      
      // Verificar se temos o domínio correto na lista de domínios permitidos
      if (window.location.hostname === 'localhost') {
        console.log("Usando localhost - certifique-se de que http://localhost:8080 está na lista de sites permitidos no Supabase");
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      
      console.log("Resposta do login com Google:", data ? "Dados recebidos" : "Sem dados", error);

      if (error) {
        console.error("Erro detalhado:", error);
        toast({
          title: "Erro ao fazer login com Google",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
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
