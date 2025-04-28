
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

const RedefinirSenha = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar se o usuário chegou a esta página via link de redefinição de senha
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // Se não houver sessão, redirecionar para a página de login
        navigate("/login");
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setError("");
    
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
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        
        // Redirecionar para a página de login após alguns segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error: any) {
      setError("Ocorreu um erro ao redefinir sua senha. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 md:p-10">
        <div className="w-full">
          <Link to="/" className="inline-block mb-8">
            <img loading="lazy" src="/lovable-uploads/logo.svg" alt="BomEstudo Logo" className="h-10" />
          </Link>
          
          <Link to="/login" className="flex items-center text-sm text-gray-500 mb-8 hover:text-[#5f2ebe] transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para o login
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[#272f3c] mb-2">
            Redefinir senha
          </h1>
          <p className="text-[#67748a] mb-8">
            Digite sua nova senha para continuar.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Senha redefinida com sucesso!</p>
              <p>Você será redirecionado para a página de login em instantes...</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="password">Nova senha</Label>
                <Input 
                  id="password" 
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
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
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
                {isSubmitting ? "Processando..." : "Redefinir senha"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
