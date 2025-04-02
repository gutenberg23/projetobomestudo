import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, DatabaseUser } from "@/types/user";

interface AuthContextType {
  user: User | null;
  profile: DatabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Configurar o Supabase para persistir a sessão entre abas
    supabase.auth.onAuthStateChange((event, session) => {
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
      }
    });

    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userProfile && !error) {
        const profile = userProfile as DatabaseUser;
        setProfile(profile);
        setUser(prev => {
          if (!prev) return null;
          const updatedUser: User = {
            ...prev,
            nome: profile.nome || prev.nome,
            sobrenome: profile.sobrenome || undefined,
            nome_social: profile.nome_social || undefined,
            nascimento: profile.nascimento || undefined,
            sexo: profile.sexo || undefined,
            escolaridade: profile.escolaridade || undefined,
            estado_civil: profile.estado_civil || undefined,
            celular: profile.celular || undefined,
            telefone: profile.telefone || undefined,
            cep: profile.cep || undefined,
            endereco: profile.endereco || undefined,
            numero: profile.numero || undefined,
            bairro: profile.bairro || undefined,
            complemento: profile.complemento || undefined,
            estado: profile.estado || undefined,
            cidade: profile.cidade || undefined,
            foto_perfil: profile.foto_perfil || undefined,
            role: profile.role,
          };
          return updatedUser;
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
      });
      
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
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
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
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
      toast({
        title: "Erro ao criar conta",
        description: error.message,
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
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
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
      toast({
        title: "Erro ao resetar senha",
        description: error.message,
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
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Atualizar estado local
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        toast({
          title: "Erro ao fazer login com Google",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message,
        variant: "destructive",
      });
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
      signInWithGoogle
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
