import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSessionClearButton, setShowSessionClearButton] = useState(false);
  const [showAdminMode, setShowAdminMode] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, user, loading, clearAuthSession } = useAuth();
  const navigate = useNavigate();
  
  const toggleAdminMode = () => {
    setShowAdminMode(!showAdminMode);
  };
  
  const createTestUser = async () => {
    try {
      setIsSubmitting(true);
      
      await supabase.rpc('admin_create_test_user', {
        test_email: 'teste@bomestudo.com.br',
        test_password: 'Teste@123',
        test_name: 'Usuário Teste'
      }).then(({ error }) => {
        if (error) {
          console.error("Erro ao criar usuário de teste:", error);
          setError("Erro ao criar usuário de teste: " + error.message);
        } else {
          setEmail('teste@bomestudo.com.br');
          setPassword('Teste@123');
          setError("");
          setActiveTab("login");
          alert("Usuário de teste criado com sucesso. Tente fazer login agora.");
        }
      });
    } catch (e: any) {
      setError("Erro: " + (e.message || "Erro desconhecido"));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'A') {
        toggleAdminMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdminMode]);
  
  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setError("");
    setIsSubmitting(true);
    setShowSessionClearButton(false);
    
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
        setShowSessionClearButton(true);
      } else {
        navigate("/");
      }
    } catch (e: any) {
      setError(e.message || "Erro desconhecido ao fazer login");
      setShowSessionClearButton(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setError("");
    setShowSessionClearButton(false);
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error: signUpError } = await signUp(email, password, nome, sobrenome);
      if (signUpError) {
        setError(signUpError.message);
        setShowSessionClearButton(true);
      } else {
        setActiveTab("login");
      }
    } catch (e: any) {
      setError(e.message || "Erro desconhecido ao criar conta");
      setShowSessionClearButton(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    setShowSessionClearButton(false);
    
    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) {
        setError(googleError.message);
        setShowSessionClearButton(true);
      }
    } catch (e: any) {
      setError(e.message || "Erro desconhecido ao fazer login com Google");
      setShowSessionClearButton(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSession = () => {
    clearAuthSession();
    setEmail("");
    setPassword("");
    setNome("");
    setSobrenome("");
    setConfirmPassword("");
    setError("");
    setShowSessionClearButton(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="hidden md:block md:w-1/2 bg-[#272f3c] relative">
        <div className="absolute top-8 left-8">
          <Link to="/">
            <img loading="lazy" src="/lovable-uploads/logo.svg" alt="BomEstudo Logo" className="w-[150px] h-auto" />
          </Link>
        </div>
        <div className="w-full h-full flex items-center justify-center p-10 px-0 py-0">
          <img alt="Estudante sorrindo" className="object-cover w-full h-full" src="/lovable-uploads/a63635e0-17bb-44d0-b68a-fb02fd8878d7.jpg" />
        </div>
        <div className="absolute bottom-10 left-10 text-white">
          <div className="text-2xl font-bold mb-1">
            "Simplesmente todas as ferramentas que
          </div>
          <div className="text-2xl font-bold mb-6">
            preciso para ser aprovado."
          </div>
          <div className="text-lg">João Silva</div>
          <div className="text-sm text-gray-300">Aprovado no concurso do INSS</div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex justify-center">
            <Link to="/">
              <img loading="lazy" src="/lovable-uploads/logo.svg" alt="BomEstudo Logo" className="w-[150px] h-auto" />
            </Link>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
                {showSessionClearButton && (
                  <div className="mt-2">
                    <Button 
                      variant="outline"
                      className="text-sm text-red-700 border-red-300 hover:bg-red-100" 
                      onClick={handleClearSession}
                    >
                      Limpar sessão e tentar novamente
                    </Button>
                  </div>
                )}
              </div>
            )}

            {showAdminMode && (
              <div className="mb-4 p-3 border-2 border-dashed border-yellow-400 bg-yellow-50 rounded">
                <h3 className="font-bold text-yellow-800 mb-2">Modo Administrador</h3>
                <Button 
                  variant="outline" 
                  className="w-full mb-2" 
                  onClick={createTestUser}
                  disabled={isSubmitting}
                >
                  Criar Usuário de Teste
                </Button>
                <div className="text-xs text-yellow-700">
                  Use esta opção apenas para depuração. Os usuários criados têm email teste@bomestudo.com.br e senha Teste@123.
                </div>
              </div>
            )}

            <TabsContent value="login">
              <h1 className="text-2xl md:text-3xl font-bold text-[#272f3c] mb-2">
                Bem-vindo de volta ao BomEstudo
              </h1>
              <p className="text-[#67748a] mb-8">
                Estude de forma eficiente com nossa plataforma completa de preparação.
              </p>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu.email@exemplo.com" 
                    className="w-full" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Lembrar de mim
                    </Label>
                  </div>
                  <Link to="/esqueci-senha" className="text-sm text-[#5f2ebe] hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processando..." : "Entrar"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#67748a]">OU</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  {isSubmitting ? "Processando..." : "Continuar com Google"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <h1 className="text-2xl md:text-3xl font-bold text-[#272f3c] mb-2">
                Junte-se ao BomEstudo
              </h1>
              <p className="text-[#67748a] mb-8">
                Crie sua conta e comece a estudar para concursos hoje mesmo.
              </p>

              <form className="space-y-4" onSubmit={handleSignUp}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input 
                      id="nome" 
                      type="text" 
                      placeholder="Seu nome" 
                      className="w-full" 
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sobrenome">Sobrenome</Label>
                    <Input 
                      id="sobrenome" 
                      type="text" 
                      placeholder="Seu sobrenome" 
                      className="w-full" 
                      value={sobrenome}
                      onChange={e => setSobrenome(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="seu.email@exemplo.com" 
                    className="w-full" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#ea2be2] hover:bg-[#ea2be2]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processando..." : "Cadastrar"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#67748a]">OU</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  {isSubmitting ? "Processando..." : "Continuar com Google"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6">
            <p className="text-[#67748a]">
              Ao criar uma conta, você concorda com os{" "}
              <Link to="/termos" className="text-[#5f2ebe] hover:underline">
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link to="/privacidade" className="text-[#5f2ebe] hover:underline">
                Política de Privacidade
              </Link>.
            </p>
          </div>
        </div>

        <div 
          className="mt-8 w-4 h-4 opacity-0 hover:opacity-5 cursor-default"
          onClick={toggleAdminMode}
        ></div>
      </div>
    </div>
  );
};

export default Login;
