
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthState, UserProfile } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const defaultAuthState: AuthState = {
  session: null,
  user: null,
  profile: null,
  loading: true,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        // Verificar se há uma sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { user } = session;
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          setAuthState({
            session,
            user,
            profile,
            loading: false,
          });
        } else {
          setAuthState({
            ...defaultAuthState,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
        setAuthState({
          ...defaultAuthState,
          loading: false,
        });
      }
    };

    fetchInitialSession();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        const { user } = session;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        setAuthState({
          session,
          user,
          profile,
          loading: false,
        });
      } else if (event === "SIGNED_OUT") {
        setAuthState({
          ...defaultAuthState,
          loading: false,
        });
      }
    });

    // Limpar subscription no unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Login bem-sucedido",
        description: "Você foi conectado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Cadastro realizado",
        description: "Sua conta foi criada com sucesso. Verifique seu email para confirmar o cadastro.",
      });
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível criar sua conta.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Desconectado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao desconectar:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Não foi possível desconectar.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetar-senha`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Um link para redefinir sua senha foi enviado para seu email.",
      });
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      toast({
        title: "Erro ao recuperar senha",
        description: error.message || "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Não foi possível atualizar sua senha.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const contextValue = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
