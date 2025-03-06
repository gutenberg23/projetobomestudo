
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const ResetarSenha = () => {
  const { user, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Verificar se o usuário está autenticado pelo token na URL
  useEffect(() => {
    // O Supabase gerencia isso automaticamente para nós
    // quando enviamos o link de recuperação de senha
  }, []);

  // Se o usuário não estiver autenticado e não tivermos parâmetro de recuperação, redirecionar para login
  if (!user && !window.location.hash.includes("type=recovery")) {
    return <Navigate to="/auth" />;
  }

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
      await updatePassword(password);
      setIsSuccess(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (error) {
      // Erro já tratado no contexto de autenticação
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl mb-6 text-[#272f3c] font-extrabold md:text-3xl">
            Redefinir senha
          </h1>
          
          {isSuccess ? (
            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="bg-green-50 p-4 rounded-md mb-4">
                <h2 className="text-green-800 font-medium mb-2">
                  Senha atualizada com sucesso!
                </h2>
                <p className="text-green-700">
                  Sua senha foi atualizada. Você será redirecionado para a página de login em alguns segundos.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <p className="text-[#67748a] mb-4">
                Digite sua nova senha abaixo.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirme a nova senha</Label>
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
                    Atualizando...
                  </>
                ) : (
                  "Atualizar senha"
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetarSenha;
