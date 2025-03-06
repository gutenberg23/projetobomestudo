
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  // Se o usuário já estiver logado, redirecionar para a página inicial
  if (user && !loading) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl mb-6 text-[#272f3c] font-extrabold md:text-3xl text-center">
            Acesse sua conta
          </h1>
          
          <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onLogin={signIn} />
            </TabsContent>
            
            <TabsContent value="cadastro">
              <SignUpForm onSignUp={signUp} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onLogin(email, password);
      // Redirecionamento será feito automaticamente pelo Navigate no componente Auth
    } catch (error) {
      // Erro já tratado no contexto de autenticação
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Button
            variant="link"
            className="px-0 font-normal h-auto text-sm"
            onClick={() => navigate("/esqueci-senha")}
            type="button"
          >
            Esqueceu a senha?
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
};

interface SignUpFormProps {
  onSignUp: (email: string, password: string, nome: string) => Promise<void>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("As senhas não conferem");
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSignUp(email, password, nome);
      // Redirecionamento será feito automaticamente pelo Navigate no componente Auth
    } catch (error) {
      // Erro já tratado no contexto de autenticação
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input
          id="nome"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input
          id="email-signup"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-signup">Senha</Label>
        <Input
          id="password-signup"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirme a senha</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {passwordError && (
          <p className="text-sm text-red-500 mt-1">{passwordError}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cadastrando...
          </>
        ) : (
          "Cadastrar"
        )}
      </Button>
    </form>
  );
};

export default Auth;
